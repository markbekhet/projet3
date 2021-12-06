import { ActiveUser } from './active-user';
import { DrawingContent } from './DrawingMeta';
import { ChatHistory } from './MessageMeta';
import { DrawingVisibilityLevel } from './VisibilityMeta';

export interface DrawingInformations {
  drawing: CanvasDetails;
  chatHistoryList: ChatHistory[];
  activeUsers: ActiveUser[];
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
