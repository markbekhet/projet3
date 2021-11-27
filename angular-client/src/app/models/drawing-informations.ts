import { DrawingContent } from './DrawingMeta';
import { DrawingVisibilityLevel } from './VisibilityMeta';

export interface DrawingInformations {
  drawing: CanvasDetails;
}
export interface CanvasDetails {
  bgColor?: string;
  name?: string;
  width?: number;
  height?: number;
  ownerId?: string;
  contents?: DrawingContent[];
  visibility?: DrawingVisibilityLevel;
  // chatHistoryList?: string;
}
