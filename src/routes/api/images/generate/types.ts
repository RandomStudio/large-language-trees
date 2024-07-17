export interface GenerateImageRequest {
  plantId: string;
  description: string;
  instructions?: string;
  model?: string;
  backgroundSecret?: string;
}
