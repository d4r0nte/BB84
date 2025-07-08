
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Lock, Unlock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EncryptionDemo = ({ results }) => {
  const { toast } = useToast();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const formatBinaryString = (binaryArray, chunkSize = 8) => {
    const binaryString = binaryArray.join('');
    const chunks = [];
    for (let i = 0; i < binaryString.length; i += chunkSize) {
      chunks.push(binaryString.slice(i, i + chunkSize));
    }
    return chunks.join(' ');
  };

  const BinaryDisplay = ({ data, label, color = "default" }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}:</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(data.join(''))}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <div className={`p-3 bg-gray-50 rounded font-mono text-sm break-all border-l-4 ${
        color === 'blue' ? 'border-blue-500' : 
        color === 'red' ? 'border-red-500' : 
        color === 'green' ? 'border-green-500' : 'border-gray-300'
      }`}>
        {formatBinaryString(data)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {results.success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            Resultado del Cifrado
            <Badge variant={results.success ? "success" : "destructive"}>
              {results.success ? "ÉXITO" : "ERROR"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="process" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="process">Proceso de Cifrado</TabsTrigger>
              <TabsTrigger value="visualization">Visualización</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
            </TabsList>

            <TabsContent value="process" className="space-y-4">
              <div className="grid gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <h4 className="font-semibold">Mensaje Original</h4>
                    </div>
                    <div className="text-lg font-mono bg-white p-3 rounded border">
                      "{results.decryptedText}"
                    </div>
                  </CardContent>
                </Card>

                <BinaryDisplay 
                  data={results.messageBinary} 
                  label="Mensaje en Binario" 
                  color="blue"
                />

                <BinaryDisplay 
                  data={results.finalKey} 
                  label="Clave BB84 Generada" 
                  color="green"
                />

                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg">⊕</div>
                    <div className="text-sm text-gray-600">Operación XOR</div>
                  </div>
                </div>

                <BinaryDisplay 
                  data={results.encryptedMessage} 
                  label="Mensaje Cifrado" 
                  color="red"
                />

                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg">⊕</div>
                    <div className="text-sm text-gray-600">Operación XOR (descifrado)</div>
                  </div>
                </div>

                <BinaryDisplay 
                  data={results.decryptedMessage} 
                  label="Mensaje Descifrado" 
                  color="green"
                />

                <Card className={`${results.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {results.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h4 className="font-semibold">Resultado Final</h4>
                    </div>
                    <div className={`text-lg font-mono p-3 rounded border ${
                      results.success ? 'bg-white border-green-200' : 'bg-white border-red-200'
                    }`}>
                      "{results.decryptedText}"
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold mb-2">Cifrado</h3>
                    <p className="text-sm text-gray-600">
                      Mensaje original XOR clave cuántica
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔐</span>
                    </div>
                    <h3 className="font-semibold mb-2">Transmisión</h3>
                    <p className="text-sm text-gray-600">
                      Mensaje cifrado viaja por canal público
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Unlock className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h3 className="font-semibold mb-2">Descifrado</h3>
                    <p className="text-sm text-gray-600">
                      Mensaje cifrado XOR clave cuántica
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-center">Flujo de Datos</h3>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-xs font-mono">MSG</span>
                    </div>
                    <div>Mensaje</div>
                  </div>
                  <div className="text-2xl">⊕</div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-xs font-mono">KEY</span>
                    </div>
                    <div>Clave BB84</div>
                  </div>
                  <div className="text-2xl">=</div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-xs font-mono">ENC</span>
                    </div>
                    <div>Cifrado</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estadísticas del Mensaje</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Longitud del mensaje:</span>
                      <Badge>{results.decryptedText.length} caracteres</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bits totales:</span>
                      <Badge>{results.messageBinary.length} bits</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Longitud de la clave:</span>
                      <Badge>{results.finalKey.length} bits</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Eficiencia:</span>
                      <Badge variant="secondary">
                        {((results.finalKey.length / results.totalQubits) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seguridad Cuántica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Tasa de error:</span>
                      <Badge variant={results.errorRate < 0.05 ? "success" : "destructive"}>
                        {(results.errorRate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Qubits interceptados:</span>
                      <Badge variant="secondary">
                        {results.interceptedQubits.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado de seguridad:</span>
                      <Badge variant={results.errorRate < 0.15 ? "success" : "destructive"}>
                        {results.errorRate < 0.15 ? "SEGURO" : "COMPROMETIDO"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Integridad:</span>
                      <Badge variant={results.success ? "success" : "destructive"}>
                        {results.success ? "VERIFICADA" : "FALLA"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Principios de Seguridad Cuántica</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• La clave es verdaderamente aleatoria gracias a la mecánica cuántica</li>
                    <li>• Cualquier intercepción es detectable por el aumento en la tasa de error</li>
                    <li>• La seguridad está garantizada por las leyes de la física</li>
                    <li>• No requiere suposiciones computacionales como RSA</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionDemo;
