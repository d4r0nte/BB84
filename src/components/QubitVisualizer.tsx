
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Play, Pause } from 'lucide-react';

const QubitVisualizer = () => {
  const [qubits, setQubits] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const generateRandomQubit = () => {
    const bit = Math.floor(Math.random() * 2);
    const base = Math.floor(Math.random() * 2);
    return {
      id: Date.now() + Math.random(),
      bit,
      base,
      state: base === 0 ? (bit === 0 ? '|0⟩' : '|1⟩') : (bit === 0 ? '|+⟩' : '|-⟩'),
      color: base === 0 ? (bit === 0 ? 'bg-blue-500' : 'bg-red-500') : (bit === 0 ? 'bg-green-500' : 'bg-yellow-500'),
      angle: base === 0 ? (bit === 0 ? 0 : 180) : (bit === 0 ? 45 : 135)
    };
  };

  const addQubit = () => {
    const newQubit = generateRandomQubit();
    setQubits(prev => [...prev, newQubit]);
  };

  const clearQubits = () => {
    setQubits([]);
    setCurrentStep(0);
  };

  const startAnimation = () => {
    setIsAnimating(true);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= qubits.length - 1) {
          setIsAnimating(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const QubitSphere = ({ qubit, isActive = false }) => (
    <div className={`relative w-24 h-24 rounded-full border-4 transition-all duration-500 ${
      isActive ? 'border-yellow-400 shadow-lg scale-110' : 'border-gray-300'
    } ${qubit.color} flex items-center justify-center`}>
      <div className="text-white font-bold text-sm">{qubit.state}</div>
      <div 
        className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full transition-transform duration-1000"
        style={{ transform: `rotate(${qubit.angle}deg) translateX(8px)` }}
      />
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <Badge variant={qubit.base === 0 ? "default" : "secondary"}>
          {qubit.base === 0 ? 'Rectilinear' : 'Diagonal'}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visualizador de Estados Cuánticos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={addQubit} variant="outline">
              Generar Qubit Aleatorio
            </Button>
            <Button onClick={startAnimation} disabled={qubits.length === 0 || isAnimating}>
              <Play className="w-4 h-4 mr-2" />
              Animar Secuencia
            </Button>
            <Button onClick={clearQubits} variant="destructive">
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Estados Cuánticos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>|0⟩ - Rectilinear</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>|1⟩ - Rectilinear</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>|+⟩ - Diagonal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>|-⟩ - Diagonal</span>
              </div>
            </div>
          </div>

          {qubits.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Secuencia de Qubits ({qubits.length} generados)
              </h3>
              <div className="flex flex-wrap gap-6 justify-center p-4 bg-slate-50 rounded-lg">
                {qubits.map((qubit, index) => (
                  <div key={qubit.id} className="text-center space-y-2">
                    <QubitSphere 
                      qubit={qubit} 
                      isActive={isAnimating && index === currentStep}
                    />
                    <div className="text-xs text-gray-600">
                      Qubit #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {qubits.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">⚛️</div>
              <p className="text-lg">No hay qubits generados</p>
              <p className="text-sm">Haz clic en "Generar Qubit Aleatorio" para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QubitVisualizer;
