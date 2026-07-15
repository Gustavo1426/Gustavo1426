import React from "react";

export interface DobrasData {
  peitoral?: number;
  mediaAxilar?: number;
  triceps?: number;
  subescapular?: number;
  abdomen?: number;
  suprailiaca?: number;
  coxa?: number;
  biceps?: number;
  panturrilha?: number;
}

export interface PerimetrosData {
  pescoco?: number;
  ombros?: number;
  torax?: number;
  cintura?: number;
  abdomen?: number;
  quadril?: number;
  bracoD?: number;
  bracoE?: number;
  antebracoD?: number;
  antebracoE?: number;
  coxaD?: number;
  coxaE?: number;
  panturrilhaD?: number;
  panturrilhaE?: number;
}

interface AntropometriaViewProps {
  dobras: DobrasData;
  perimetros: PerimetrosData;
  onChangeDobras: (dobras: DobrasData) => void;
  onChangePerimetros: (perimetros: PerimetrosData) => void;
  isReadOnly?: boolean;
}

export default function AntropometriaView({
  dobras,
  perimetros,
  onChangeDobras,
  onChangePerimetros,
  isReadOnly = false
}: AntropometriaViewProps) {
  const handleDobraChange = (key: keyof DobrasData, value: string) => {
    if (isReadOnly) return;
    const num = value === "" ? undefined : parseFloat(value);
    onChangeDobras({
      ...dobras,
      [key]: num
    });
  };

  const handlePerimetroChange = (key: keyof PerimetrosData, value: string) => {
    if (isReadOnly) return;
    const num = value === "" ? undefined : parseFloat(value);
    onChangePerimetros({
      ...perimetros,
      [key]: num
    });
  };

  const inputClass = "w-full bg-[#1b1c1e] border border-gray-800 text-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Dobras Cutâneas */}
      <div className="bg-[#121314] border border-gray-900 rounded-xl p-5">
        <h4 className="text-[#ccff00] font-mono text-sm font-bold uppercase mb-4 tracking-wider">
          📐 Dobras Cutâneas (mm)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Peitoral", key: "peitoral" },
            { label: "Média Axilar", key: "mediaAxilar" },
            { label: "Tríceps", key: "triceps" },
            { label: "Subescapular", key: "subescapular" },
            { label: "Abdomen", key: "abdomen" },
            { label: "Suprailíaca", key: "suprailiaca" },
            { label: "Coxa", key: "coxa" },
            { label: "Bíceps", key: "biceps" },
            { label: "Panturrilha", key: "panturrilha" }
          ].map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="block text-gray-400 font-mono text-xs">{item.label}</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                disabled={isReadOnly}
                value={dobras[item.key as keyof DobrasData] ?? ""}
                onChange={(e) => handleDobraChange(item.key as keyof DobrasData, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Perímetros */}
      <div className="bg-[#121314] border border-gray-900 rounded-xl p-5">
        <h4 className="text-[#ccff00] font-mono text-sm font-bold uppercase mb-4 tracking-wider">
          📏 Perímetros (cm)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Pescoço", key: "pescoco" },
            { label: "Ombro", key: "ombros" },
            { label: "Tórax", key: "torax" },
            { label: "Cintura", key: "cintura" },
            { label: "Abdomen", key: "abdomen" },
            { label: "Quadril", key: "quadril" },
            { label: "Braço D (Relax)", key: "bracoD" },
            { label: "Braço E (Relax)", key: "bracoE" },
            { label: "Antebraço D", key: "antebracoD" },
            { label: "Antebraço E", key: "antebracoE" },
            { label: "Coxa D", key: "coxaD" },
            { label: "Coxa E", key: "coxaE" },
            { label: "Panturrilha D", key: "panturrilhaD" },
            { label: "Panturrilha E", key: "panturrilhaE" }
          ].map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="block text-gray-400 font-mono text-xs">{item.label}</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                disabled={isReadOnly}
                value={perimetros[item.key as keyof PerimetrosData] ?? ""}
                onChange={(e) => handlePerimetroChange(item.key as keyof PerimetrosData, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
