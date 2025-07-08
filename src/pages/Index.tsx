
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import QubitVisualizer from '@/components/QubitVisualizer';
import BB84Protocol from '@/components/BB84Protocol';
import EncryptionDemo from '@/components/EncryptionDemo';
import { Shield, Lock, Unlock, Eye, EyeOff, Zap } from 'lucide-react';

const Index = () => {
  const [message, setMessage] = useState('');
  const [simulateEve, setSimulateEve] = useState(false);
  const [eveRate, setEveRate] = useState(0.5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);

  const textToBinary = (text) => {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('').split('').map(bit => parseInt(bit));
  };

  const binaryToText = (bits) => {
    const chars = [];
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8).join('');
      chars.push(String.fromCharCode(parseInt(byte, 2)));
    }
    return chars.join('');
  };

  const xorBits = (data, key) => {
    const extendedKey = [];
    for (let i = 0; i < data.length; i++) {
      extendedKey.push(key[i % key.length]);
    }
    return data.map((bit, i) => bit ^ extendedKey[i]);
  };

  const generateBB84Key = (numQubits, simulateEve = false, eveInterceptRate = 0.5) => {
    const aliceBits = [];
    const aliceBases = [];
    const bobMeasurements = [];
    const bobBases = [];
    const interceptedQubits = [];

    // Simulación paso a paso
    for (let i = 0; i < numQubits; i++) {
      // Alice prepara un qubit
      const bit = Math.floor(Math.random() * 2);
      const base = Math.floor(Math.random() * 2); // 0: rectilinear, 1: diagonal
      
      aliceBits.push(bit);
      aliceBases.push(base);

      // Simulación de Eve (si está habilitada)
      let intercepted = false;
      if (simulateEve && Math.random() < eveInterceptRate) {
        intercepted = true;
        interceptedQubits.push(i);
      }

      // Bob mide el qubit
      const bobBase = Math.floor(Math.random() * 2);
      bobBases.push(bobBase);
      
      // Si las bases coinciden, la medición es correcta
      // Si no coinciden, hay 50% de probabilidad de error
      let measurement;
      if (base === bobBase) {
        measurement = intercepted && Math.random() < 0.5 ? 1 - bit : bit;
      } else {
        measurement = Math.floor(Math.random() * 2);
      }
      
      bobMeasurements.push(measurement);
    }

    // Sifting: mantener solo bits donde las bases coinciden
    const siftedAlice = [];
    const siftedBob = [];
    
    for (let i = 0; i < numQubits; i++) {
      if (aliceBases[i] === bobBases[i]) {
        siftedAlice.push(aliceBits[i]);
        siftedBob.push(bobMeasurements[i]);
      }
    }

    if (siftedAlice.length === 0) {
      return { key: [], errorRate: 1.0, interceptedQubits, totalQubits: numQubits };
    }

    // Test de errores en una muestra
    const testCount = Math.max(1, Math.floor(siftedAlice.length * 0.2));
    const testIndices = [];
    while (testIndices.length < testCount) {
      const idx = Math.floor(Math.random() * siftedAlice.length);
      if (!testIndices.includes(idx)) {
        testIndices.push(idx);
      }
    }

    let errors = 0;
    testIndices.forEach(idx => {
      if (siftedAlice[idx] !== siftedBob[idx]) {
        errors++;
      }
    });

    const errorRate = errors / testCount;
    
    // Clave final (sin los bits de test)
    const finalKey = siftedAlice.filter((_, idx) => !testIndices.includes(idx));
    
    return { 
      key: finalKey, 
      errorRate, 
      interceptedQubits, 
      totalQubits: numQubits,
      siftedLength: siftedAlice.length,
      testIndices
    };
  };

  const runSimulation = async () => {
    if (!message.trim()) {
      alert('Por favor, ingresa un mensaje');
      return;
    }

    setIsSimulating(true);
    
    // Convertir mensaje a binario
    const messageBinary = textToBinary(message);
    console.log('Mensaje binario:', messageBinary);
    
    // Generar clave BB84
    const numQubits = Math.max(messageBinary.length * 4, 50);
    const bb84Result = generateBB84Key(numQubits, simulateEve, eveRate);
    
    console.log('Resultado BB84:', bb84Result);
    
    // Verificar seguridad
    if (bb84Result.errorRate > 0.15 && simulateEve) {
      setResults({
        ...bb84Result,
        messageBinary,
        isSecure: false,
        securityAlert: 'ALERTA: Alta tasa de error detectada. Posible interceptación por Eve.',
        encryptedMessage: null,
        decryptedMessage: null
      });
      setIsSimulating(false);
      return;
    }

    // Ajustar longitud de la clave
    let finalKey = bb84Result.key;
    if (finalKey.length < messageBinary.length) {
      // Repetir la clave si es más corta
      const repeatedKey = [];
      for (let i = 0; i < messageBinary.length; i++) {
        repeatedKey.push(finalKey[i % finalKey.length]);
      }
      finalKey = repeatedKey;
    } else if (finalKey.length > messageBinary.length) {
      // Truncar si es más larga
      finalKey = finalKey.slice(0, messageBinary.length);
    }

    // Cifrar y descifrar
    const encrypted = xorBits(messageBinary, finalKey);
    const decrypted = xorBits(encrypted, finalKey);
    const decryptedText = binaryToText(decrypted);

    setResults({
      ...bb84Result,
      messageBinary,
      finalKey,
      encryptedMessage: encrypted,
      decryptedMessage: decrypted,
      decryptedText,
      isSecure: true,
      success: decryptedText === message
    });
    
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Simulador BB84
            </h1>
            <Zap className="h-10 w-10 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualización interactiva del protocolo de distribución de claves cuánticas BB84
          </p>
        </div>

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simulator">Simulador Principal</TabsTrigger>
            <TabsTrigger value="protocol">Protocolo BB84</TabsTrigger>
            <TabsTrigger value="qubits">Visualización Cuántica</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Configuración del Mensaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mensaje a cifrar:
                  </label>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje secreto aquí..."
                    className="text-lg"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={simulateEve}
                      onCheckedChange={setSimulateEve}
                    />
                    <div className="flex items-center gap-2">
                      {simulateEve ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>Simular interceptación de Eve</span>
                    </div>
                  </div>

                  {simulateEve && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Tasa de interceptación:</span>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={eveRate}
                        onChange={(e) => setEveRate(parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={runSimulation}
                  disabled={isSimulating || !message.trim()}
                  className="w-full text-lg py-6"
                >
                  {isSimulating ? 'Ejecutando Simulación...' : 'Ejecutar Simulación BB84'}
                </Button>
              </CardContent>
            </Card>

            {results && (
              <div className="space-y-6">
                {!results.isSecure && (
                  <Alert className="border-red-500 bg-red-50">
                    <Shield className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-800 font-semibold">
                      {results.securityAlert}
                    </AlertDescription>
                  </Alert>
                )}

                {results.isSecure && (
                  <EncryptionDemo results={results} />
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas de la Simulación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.totalQubits}
                        </div>
                        <div className="text-sm text-gray-600">Qubits Enviados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {results.siftedLength}
                        </div>
                        <div className="text-sm text-gray-600">Bits Compatibles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {(results.errorRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Tasa de Error</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {results.interceptedQubits.length}
                        </div>
                        <div className="text-sm text-gray-600">Interceptados</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Seguridad de la Clave</span>
                        <span>{results.errorRate < 0.15 ? 'SEGURA' : 'COMPROMETIDA'}</span>
                      </div>
                      <Progress
                        value={(1 - results.errorRate) * 100}
                        className={`h-3 ${results.errorRate < 0.15 ? 'bg-green-100' : 'bg-red-100'}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="protocol">
            <BB84Protocol simulateEve={simulateEve} />
          </TabsContent>

          <TabsContent value="qubits">
            <QubitVisualizer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
