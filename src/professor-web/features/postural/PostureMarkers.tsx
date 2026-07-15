import React, { useState, useRef, useEffect } from "react";
import { X, Grid3X3, Eye, EyeOff, Loader2, Plus, Target, Edit3 } from "lucide-react";

interface Marker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "normal" | "warning" | "error";
}

interface PostureMarkersProps {
  imageUrl: string;
  view: "front" | "side" | "back";
  markers: Marker[];
  onAddMarker: (marker: Omit<Marker, "id">) => void;
  onRemoveMarker: (id: string) => void;
  onUpdateMarkerPosition: (id: string, x: number, y: number) => void;
}

export const ANATOMICAL_POINTS = {
  front: [
    { label: "Ombro Direito", x: 30, y: 28, type: "normal" as const },
    { label: "Ombro Esquerdo", x: 70, y: 28, type: "normal" as const },
    { label: "Quadril Direito", x: 32, y: 55, type: "normal" as const },
    { label: "Quadril Esquerdo", x: 68, y: 55, type: "normal" as const },
    { label: "Joelho Direito", x: 35, y: 78, type: "normal" as const },
    { label: "Joelho Esquerdo", x: 65, y: 78, type: "normal" as const },
  ],
  side: [
    { label: "Orelha", x: 50, y: 8, type: "normal" as const },
    { label: "Ombro", x: 50, y: 22, type: "normal" as const },
    { label: "Quadril", x: 50, y: 50, type: "normal" as const },
    { label: "Joelho", x: 50, y: 72, type: "normal" as const },
    { label: "Tornozelo", x: 50, y: 92, type: "normal" as const },
  ],
  back: [
    { label: "Escápula Direita", x: 32, y: 25, type: "normal" as const },
    { label: "Escápula Esquerda", x: 68, y: 25, type: "normal" as const },
    { label: "Coluna Torácica", x: 50, y: 35, type: "normal" as const },
    { label: "Coluna Lombar", x: 50, y: 52, type: "normal" as const },
  ],
};

export default function PostureMarkers({
  imageUrl,
  view,
  markers,
  onAddMarker,
  onRemoveMarker,
  onUpdateMarkerPosition,
}: PostureMarkersProps) {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const prevUrlRef = useRef<string | null>(null);

  // Gatilho automático: simula detecção de pontos por IA se a foto for nova e não tiver pontos
  useEffect(() => {
    if (imageUrl && prevUrlRef.current !== imageUrl) {
      prevUrlRef.current = imageUrl;
      if (markers.length === 0) {
        setIsDetecting(true);
        const timer = setTimeout(() => {
          setIsDetecting(false);
          // Adiciona todos os pontos anatômicos padrão
          const points = ANATOMICAL_POINTS[view];
          points.forEach((p) => {
            onAddMarker(p);
          });
        }, 1200); // 1.2 segundos para uma linda simulação de escaneamento de IA
        return () => clearTimeout(timer);
      }
    }
  }, [imageUrl, view, markers.length, onAddMarker]);

  // Manipulação de Drag-and-Drop (Mouse & Touch) para movimentar pontos
  useEffect(() => {
    if (!draggingId) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;
      
      // Limitar coordenadas entre 0.5% e 99.5% para não saírem da imagem
      x = Math.max(0.5, Math.min(99.5, x));
      y = Math.max(0.5, Math.min(99.5, y));

      onUpdateMarkerPosition(draggingId, x, y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      // Prevenir rolagem de tela durante o movimento
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      setDraggingId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [draggingId, onUpdateMarkerPosition]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMode || !imageRef.current) return;
    
    // Se clicou em um ponto ou no botão de deletar, não adiciona outro ponto
    const target = e.target as HTMLElement;
    if (target.closest(".marker-point") || target.closest(".remove-marker-btn")) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const label = prompt("Nome do ponto de referência:");
    if (label) {
      onAddMarker({ x, y, label, type: "warning" });
    }
  };

  const addAnatomicalPoints = () => {
    ANATOMICAL_POINTS[view].forEach((point) => {
      // Evita duplicar se já existir um ponto com o mesmo rótulo
      if (!markers.some((m) => m.label.toLowerCase() === point.label.toLowerCase())) {
        onAddMarker(point);
      }
    });
  };

  const getMarkerColor = (type: Marker["type"]) => {
    switch (type) {
      case "normal":
        return "bg-green-500 border-white";
      case "warning":
        return "bg-yellow-500 border-white";
      case "error":
        return "bg-red-500 border-white";
    }
  };

  return (
    <div className="space-y-3">
      {/* Barra de Ações com Design Polido */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#121315]/80 p-2 rounded-xl border border-gray-850">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setIsAddingMode(!isAddingMode)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isAddingMode
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20"
            }`}
          >
            {isAddingMode ? (
              <>
                <X className="w-3 h-3" /> Cancelar Modo Adição
              </>
            ) : (
              <>
                <Edit3 className="w-3 h-3" /> Novo Marcador
              </>
            )}
          </button>
          <button
            type="button"
            onClick={addAnatomicalPoints}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Target className="w-3 h-3" /> Pontos Padrão
          </button>
        </div>

        {/* Botão de Grade Postural */}
        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer ${
            showGrid
              ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
              : "bg-gray-950 text-gray-500 border-gray-800 hover:text-gray-400"
          }`}
          title="Ativar/Desativar grade postural e fio de prumo"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          {showGrid ? "Grade: ON" : "Grade: OFF"}
        </button>
      </div>

      {/* Container Principal da Imagem */}
      <div
        ref={imageRef}
        className="relative aspect-square bg-black rounded-xl overflow-hidden cursor-crosshair select-none border border-gray-800"
        onClick={handleImageClick}
      >
        <img
          src={imageUrl}
          alt={`Postura ${view}`}
          className="w-full h-full object-cover pointer-events-none"
          draggable="false"
        />

        {/* Linha laser de escaneamento de IA */}
        {isDetecting && (
          <div className="absolute left-0 right-0 h-[3px] bg-[#00f2ff] shadow-[0_0_12px_#00f2ff,0_0_6px_#00f2ff] pointer-events-none animate-scanner-normal z-30" />
        )}

        {/* Overlay de carregamento do escaneamento de IA */}
        {isDetecting && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center z-40 backdrop-blur-[1px]">
            <div className="bg-[#121315]/95 border border-cyan-500/30 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2.5 max-w-[240px] text-center">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">Processando IA</span>
                <p className="text-[9px] text-gray-400 font-mono">Mapeando referências anatômicas de {view === 'front' ? 'frente' : view === 'side' ? 'perfil' : 'costas'}...</p>
              </div>
            </div>
          </div>
        )}

        {/* 📐 Grade Postural Avançada e Fio de Prumo */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Linhas Verticais da Grade */}
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`v-grid-${i}`}
                className={`absolute top-0 bottom-0 border-r ${
                  i === 4 ? "border-transparent" : "border-cyan-500/10"
                }`}
                style={{ left: `${(i + 1) * 10}%` }}
              />
            ))}
            
            {/* Linhas Horizontais da Grade */}
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`h-grid-${i}`}
                className={`absolute left-0 right-0 border-b ${
                  i === 4 ? "border-transparent" : "border-cyan-500/10"
                }`}
                style={{ top: `${(i + 1) * 10}%` }}
              />
            ))}

            {/* 🔴 Fio de Prumo Central (Linha vertical principal de simetria) */}
            <div className="absolute top-0 bottom-0 left-1/2 border-r-2 border-dashed border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)] z-10" />
            
            {/* 🟡 Linha Horizontal de Simetria Central (Nível do quadril/pelve) */}
            <div className="absolute left-0 right-0 top-1/2 border-b-2 border-dashed border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.3)] z-10" />
          </div>
        )}

        {/* Renderização de Marcadores Interativos */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute marker-point select-none cursor-grab active:cursor-grabbing z-20"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: "translate(-50%, -50%)",
              touchAction: "none",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setDraggingId(marker.id);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setDraggingId(marker.id);
            }}
          >
            <div className="relative flex flex-col items-center group">
              {/* Ponto Visual */}
              <div
                className={`w-4 h-4 rounded-full ${getMarkerColor(
                  marker.type
                )} border-2 shadow-[0_0_8px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all ${
                  draggingId === marker.id ? "scale-125 ring-4 ring-cyan-500/30" : "group-hover:scale-110"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Rótulo Inteligente com Posição Inteligente (Garante visibilidade) */}
              <div className="absolute top-5 bg-black/90 text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-gray-850 shadow-md whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <span>{marker.label}</span>
                <span className="text-[7px] text-gray-400">({Math.round(marker.x)}, {Math.round(marker.y)})</span>
              </div>

              {/* Botão de Remoção no Hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMarker(marker.id);
                }}
                className="absolute -top-3.5 -right-3.5 w-4 h-4 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer remove-marker-btn z-30"
                title="Remover ponto"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        ))}

        {isAddingMode && (
          <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none flex items-center justify-center">
            <div className="bg-black/95 text-cyan-400 px-4 py-2 rounded-xl text-[10px] font-mono font-bold border border-cyan-800/30 shadow-xl animate-pulse">
              📍 Clique na foto para marcar um novo ponto
            </div>
          </div>
        )}
      </div>

      {/* Lista de Pontos para Monitoramento e Remoção Rápida */}
      {markers.length > 0 && (
        <div className="bg-[#121315]/80 border border-gray-850 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-gray-900 pb-1">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              Anatomia Identificada ({markers.length})
            </span>
            <span className="text-[8px] text-gray-500 font-mono">Dica: Arraste os pontos na foto para ajustar</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-24 overflow-y-auto pr-1">
            {markers.map((marker) => (
              <div
                key={marker.id}
                className="flex items-center justify-between bg-black/50 px-2 py-1.5 rounded-lg border border-gray-900 text-[9px] font-mono"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${marker.type === "normal" ? "bg-green-500" : marker.type === "warning" ? "bg-yellow-500" : "bg-red-500"}`} />
                  <span className="text-gray-300 truncate font-bold" title={marker.label}>
                    {marker.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMarker(marker.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer pl-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
