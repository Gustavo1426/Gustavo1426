export type ImageView =
  | "front"
  | "back"
  | "left"
  | "right";

export interface BiomechanicalImage {
  id: string;
  studentId: string;
  view: ImageView;
  url: string;
  width: number;
  height: number;
  qualityScore: number;
  validated: boolean;
  createdAt: Date;
}
