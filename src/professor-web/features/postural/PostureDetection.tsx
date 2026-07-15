import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface PostureDetectionProps {
  imageUrl: string;
  view: "front" | "side" | "back";
  onPointsDetected: (points: Array<{ id: string; x: number; y: number; label: string }>) => void;
}

// Coordenadas padrão otimizadas para fotos de corpo inteiro
const DEFAULT_POINTS = {
  front: [
    { label: "Ombro Direito", x: 30, y: 28 },
    { label: "Ombro Esquerdo", x: 70, y: 28 },
    { label: "Quadril Direito", x: 32, y: 55 },
    { label: "Quadril Esquerdo", x: 68, y: 55 },
    { label: "Joelho Direito", x: 35, y: 78 },
    { label: "Joelho Esquerdo", x: 65, y: 78 },
  ],
  side: [
    { label: "Orelha", x: 50, y: 8 },
    { label: "Ombro", x: 50, y: 22 },
    { label: "Quadril", x: 50, y: 50 },
    { label: "Joelho", x: 50, y: 72 },
    { label: "Tornozelo", x: 50, y: 92 },
  ],
  back: [
    { label: "Escápula Direita", x: 32, y: 25 },
    { label: "Escápula Esquerda", x: 68, y: 25 },
    { label: "Coluna Torácica", x: 50, y: 35 },
    { label: "Coluna Lombar", x: 50, y: 52 },
  ],
};

export default function PostureDetection({
  imageUrl,
  view,
  onPointsDetected,
}: PostureDetectionProps) {
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedPoints, setDetectedPoints] = useState<Array<{ id: string; x: number; y: number; label: string }>>([]);

  useEffect(() => {
    if (imageUrl) {
      setIsDetecting(true);
      // Simula detecção automática (na verdade usa coordenadas padrão otimizadas)
      const timer = setTimeout(() => {
        const points = DEFAULT_POINTS[view].map((point, idx) => ({
          id: `point-${view}-${idx}-${Date.now()}`,
          x: point.x,
          y: point.y,
          label: point.label,
        }));

        setDetectedPoints(points);
        onPointsDetected(points);
        setIsDetecting(false);
      }, 800); // Aguarda 800ms para simular "processamento"

      return () => clearTimeout(timer);
    }
  }, [imageUrl, view, onPointsDetected]);

  return (
    <div className="relative w-full h-full aspect-square bg-black">
      <img
        src={imageUrl}
        alt={`Postura ${view}`}
        className="w-full h-full object-cover"
      />
      
      {/* 📐 Grade Postural Sutil Overlay de Alinhamento */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Linhas Verticais da Grade */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`v-subgrid-${i}`}
            className="absolute top-0 bottom-0 border-r border-cyan-500/10"
            style={{ left: `${(i + 1) * 20}%` }}
          />
        ))}
        {/* Linhas Horizontais da Grade */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`h-subgrid-${i}`}
            className="absolute left-0 right-0 border-b border-cyan-500/10"
            style={{ top: `${(i + 1) * 20}%` }}
          />
        ))}

        {/* 🔴 Fio de Prumo Central (Vertical) */}
        <div className="absolute top-0 bottom-0 left-1/2 border-r border-dashed border-red-500/35" />
        {/* 🟡 Linha Horizontal de Simetria (Horizontal) */}
        <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-yellow-500/25" />
      </div>
      
      {/* Overlay de pontos detectados */}
      {!isDetecting && detectedPoints.map((point) => (
        <div
          key={point.id}
          className="absolute group"
          style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {/* Ponto verde piscante interativo */}
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white shadow-md animate-pulse" />
          
          {/* Tooltip com nome do ponto */}
          <div className="absolute left-4 top-0 bg-black/95 text-white text-[8px] px-1.5 py-0.5 rounded border border-gray-850 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            {point.label}
          </div>
        </div>
      ))}

      {/* Indicador de carregamento */}
      {isDetecting && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-black/90 text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-800/25 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Mapeando...</span>
          </div>
        </div>
      )}

      {/* Contador de pontos */}
      {!isDetecting && detectedPoints.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-green-400 px-2 py-0.5 rounded text-[8px] font-mono border border-green-500/10 shadow-sm">
          ✓ {detectedPoints.length} marcadores
        </div>
      )}
    </div>
  );
}
