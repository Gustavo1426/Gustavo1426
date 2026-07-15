/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoseLandmark } from "./posturalEngine";

/**
 * Maps coordinate points from different sources (such as drag-and-drop markers in front/back/side views)
 * into a complete, normalized 33-point PoseLandmark array.
 */
export function mapMarkersToLandmarks(markers: Array<{ label: string; x: number; y: number }>): PoseLandmark[] {
  const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0.0,
    visibility: 0.95,
  }));

  markers.forEach((marker) => {
    const label = marker.label.toLowerCase();
    const xVal = marker.x / 100; // Map from percentages (0-100) to normalized units (0-1)
    const yVal = marker.y / 100;

    if (label.includes("nariz")) {
      landmarks[0] = { x: xVal, y: yVal, z: 0, visibility: 0.98 };
    } else if (label.includes("orelha direita") || (label.includes("orelha") && !label.includes("esquerda"))) {
      landmarks[8] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("orelha esquerda")) {
      landmarks[7] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("ombro direito") || (label.includes("ombro") && !label.includes("esquerdo"))) {
      landmarks[12] = { x: xVal, y: yVal, z: 0, visibility: 0.98 };
    } else if (label.includes("ombro esquerdo")) {
      landmarks[11] = { x: xVal, y: yVal, z: 0, visibility: 0.98 };
    } else if (label.includes("quadril direito") || (label.includes("quadril") && !label.includes("esquerdo"))) {
      landmarks[24] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("quadril esquerdo")) {
      landmarks[23] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("joelho direito") || (label.includes("joelho") && !label.includes("esquerdo"))) {
      landmarks[26] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("joelho esquerdo")) {
      landmarks[25] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("tornozelo direito") || (label.includes("tornozelo") && !label.includes("esquerdo"))) {
      landmarks[28] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("tornozelo esquerdo")) {
      landmarks[27] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("escápula direita") || (label.includes("escápula") && !label.includes("esquerda"))) {
      // Proxy escápula using standard back-shoulder points
      landmarks[12] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    } else if (label.includes("escápula esquerda")) {
      landmarks[11] = { x: xVal, y: yVal, z: 0, visibility: 0.95 };
    }
  });

  return landmarks;
}
