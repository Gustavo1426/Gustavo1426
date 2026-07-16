/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POSTURE ANALYSIS VIEW (PINS)
 * ============================================================================
 */

import React from "react";
import { BodyAnnotation } from "../types/report.types";

interface PostureAnalysisViewProps {
  photoUrl: string;
  annotations: BodyAnnotation[];
}

export function PostureAnalysisView({ photoUrl, annotations }: PostureAnalysisViewProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Mapeamento Biomecânico</h3>
      
      {/* CONTAINER RELATIVO: É o segredo para os pins ficarem no lugar certo */}
      <div style={styles.imageWrapper}>
        <img src={photoUrl} alt="Avaliação Postural" style={styles.image} />
        
        {/* RENDERIZAÇÃO DOS PINS */}
        {annotations.map((pin, index) => (
          <div
            key={index}
            title={pin.label} // Tooltip nativo do HTML ao passar o mouse
            style={{
              ...styles.pin,
              left: `${pin.position.x}%`,
              top: `${pin.position.y}%`,
              backgroundColor: pin.severity === "high" ? "#EF4444" : "#F59E0B",
            }}
          >
            <span style={styles.tooltip}>{pin.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", backgroundColor: "#fff", borderRadius: "8px" },
  title: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" },
  imageWrapper: {
    position: "relative" as const,
    display: "inline-block",
    width: "100%",
    maxWidth: "400px", // Limita o tamanho na tela do professor
    borderRadius: "8px",
    overflow: "hidden",
  },
  image: { width: "100%", height: "auto", display: "block" },
  pin: {
    position: "absolute" as const,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)", // Centraliza exato no eixo X/Y
    cursor: "pointer",
    border: "2px solid white",
    boxShadow: "0 0 8px rgba(0,0,0,0.5)",
  },
  tooltip: {
    visibility: "hidden" as const, // Requer CSS :hover para exibir, simplificado aqui
    position: "absolute" as const,
    left: "20px",
    whiteSpace: "nowrap" as const,
    backgroundColor: "#333",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  }
};
