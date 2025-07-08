
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowDown, Eye, Shield, Key } from 'lucide-react';

const BB84Protocol = ({ simulateEve = false }) => {
  const [step, setStep] = useState(0);
  const [protocolData, setProtocolData] = useState(null);

  const generateProtocolExample = () => {
    const numQubits = 8;
    const aliceBits = [];
    const aliceBases = [];
    const bobBases = [];
    const bobMeasurements = [];
    const eveInterceptions = [];

    for (let i = 0; i < numQubits; i++) {
      aliceBits.push(Math.floor(Math.random() * 2));
      aliceBases.push(Math.floor(Math.random() * 2));
      bobBases.push(Math.floor(Math.random() * 2));
      
      // Simulación de Eve
      const eveIntercepts = simulateEve && Math.random() < 0.3;
      eveInterceptions.push(eveIntercepts);
      
      // Medición de Bob
      if (aliceBases[i] === bobBases[i]) {
        // Bases coinciden
        bobMeasurements.push(eveIntercepts && Math.random() < 0.5 ? 1 - aliceBits[i] : aliceBits[i]);
      } else {
        // Bases no coinciden, resultado aleatorio
        bobMeasurements.push(Math.floor(Math.random() * 2));
      }
    }

    // Sifting
    const compatibleIndices = [];
    for (let i = 0; i < numQubits; i++) {
      if (aliceBases[i] === bobBases[i]) {
        compatibleIndices.push(i);
      }
    }

    setProtocolData({
      aliceBits,
      aliceBases,
      bobBases,
      bobMeasurements,
      eveInterceptions,
      compatibleIndices,
      numQubits
    });
  };

  const nextStep = () => {
    if (step === 0) {
      generateProtocolExample();
    }
    setStep(prev => Math.min(prev + 1, 5));
  };

  const resetProtocol = () => {
    setStep(0);
    setProtocolData(null);
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Presiona 'Siguiente Paso' para comenzar la demostración del protocolo BB84";
      case 1:
        return "Paso 1: Alice prepara qubits aleatorios usando bases aleatorias";
      case 2:
        return "Paso 2: Los qubits viajan por el canal cuántico" + (simulateEve ? " (Eve puede interceptar)" : "");
      case 3:
        return "Paso 3: Bob mide los qubits usando bases aleatorias";
      case 4:
        return "Paso 4: Alice y Bob comparan sus bases y conservan bits compatibles";
      case 5:
        return "Paso 5: Verificación de errores y generación de clave final";
      default:
        return "";
    }
  };

  const QubitRow = ({ index, showAlice = false, showBob = false, showEve = false }) => {
    if (!protocolData) return null;

    const { aliceBits, aliceBases, bobBases, bobMeasurements, eveInterceptions, compatibleIndices } = protocolData;
    const isCompatible = compatibleIndices.includes(index);

    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        isCompatible ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="w-8 text-center font-mono">{index + 1}</div>
          
          {showAlice && (
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">Alice:</div>
              <Badge variant={aliceBits[index] ? "destructive" : "default"}>
                {aliceBits[index]}
              </Badge>
              <div className={`w-3 h-3 rounded ${aliceBases[index] ? 'rotate-45' : ''} ${
                aliceBases[index] ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
            </div>
          )}

          {showEve && eveInterceptions[index] && (
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600">Eve</span>
            </div>
          )}

          {showBob && (
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">Bob:</div>
              <div className={`w-3 h-3 rounded ${bobBases[index] ? 'rotate-45' : ''} ${
                bobBases[index] ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <Badge variant={bobMeasurements[index] ? "destructive" : "default"}>
                {bobMeasurements[index]}
              </Badge>
            </div>
          )}
        </div>

        {step >= 4 && (
          <div className="flex items-center space-x-2">
            {isCompatible ? (
              <Badge variant="success" className="bg-green-100 text-green-800">
                ✓ Compatible
              </Badge>
            ) : (
              <Badge variant="secondary">
                ✗ Descartado
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            Protocolo BB84 - Demostración Paso a Paso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={nextStep} disabled={step >= 5}>
                {step === 0 ? 'Comenzar Demostración' : 'Siguiente Paso'}
              </Button>
              <Button onClick={resetProtocol} variant="outline">
                Reiniciar
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Paso {step} de 5
            </div>
          </div>

          <Progress value={(step / 5) * 100} className="h-2" />

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-blue-800">{getStepDescription()}</p>
            </CardContent>
          </Card>

          {protocolData && (
            <div className="space-y-4">
              <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">👩</span>
                  </div>
                  <div className="font-semibold">Alice</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-8 h-8 text-gray-400" />
                  {simulateEve && step >= 2 && (
                    <>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Eye className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="text-xs text-red-600 mt-1">Eve</div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-red-400" />
                    </>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">👨</span>
                  </div>
                  <div className="font-semibold">Bob</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Transmisión Cuántica</h3>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Base Rectilinear</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded rotate-45"></div>
                      <span>Base Diagonal</span>
                    </div>
                  </div>
                </div>

                {Array.from({ length: protocolData.numQubits }).map((_, index) => (
                  <QubitRow
                    key={index}
                    index={index}
                    showAlice={step >= 1}
                    showBob={step >= 3}
                    showEve={step >= 2}
                  />
                ))}
              </div>

              {step >= 4 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800">Resultado del Sifting</h4>
                        <p className="text-green-700">
                          {protocolData.compatibleIndices.length} de {protocolData.numQubits} qubits son compatibles
                        </p>
                      </div>
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step >= 5 && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Clave Final Generada</h4>
                    <div className="font-mono text-lg text-center p-3 bg-white rounded border">
                      {protocolData.compatibleIndices.map(i => protocolData.aliceBits[i]).join('')}
                    </div>
                    <p className="text-purple-700 text-sm mt-2 text-center">
                      Esta clave puede usarse para cifrado simétrico seguro
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BB84Protocol;
