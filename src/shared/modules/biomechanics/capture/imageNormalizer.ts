/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: IMAGE NORMALIZER
 * ============================================================================
 */

import { BiomechanicalImage, ImageView } from "../types";

export interface NormalizedImage {
  url: string;
  width: number;
  height: number;
  format: "jpeg" | "png" | "webp";
  originalView: ImageView;
}

export function normalizeImage(image: BiomechanicalImage): NormalizedImage {
  // TODO: Implementar processamento real de compressão/redimensionamento no futuro (ex: via Canvas API ou backend)
  return {
    url: image.url,
    width: 1024,
    height: 1536,
    format: "jpeg",
    originalView: image.view
  };
}
