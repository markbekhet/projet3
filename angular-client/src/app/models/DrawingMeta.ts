import { DrawingVisibilityLevel } from '@models/VisibilityMeta';

// TODO: should rename that one 'NewDrawing' to understand that we use it to create a new drawing.
export interface Drawing {
  drawingID?: number; // we don't have it prior to the request, it's the db that gives it to us
  name: string;
  visibility: DrawingVisibilityLevel;
  password?: string;
  width: number;
  height: number;
  color: string;
  ownerId: string | undefined;
  // useOwnerPrivateInformation: boolean;
}

export interface DrawingContent {
  userId?: string | undefined;
  drawingId?: number;
  id?: number; // ID of the svg element drawn onto the surface
  content?: string; // Actual content of the svg element
  status?: DrawingStatus; // To know how to render the drawing and the server uses this value to save when the drawing is done.
  toolName?: string;
}

export enum DrawingStatus {
  InProgress = 'In Progress',
  Done = 'Done',
  Selected = 'Selected',
  Deleted = 'Deleted',
}

export interface DrawingInfosForGallery {
  id: number;
  name: string;
  visibility: DrawingVisibilityLevel;
  width: number;
  height: number;
  bgColor: string;
  ownerId: string;
  contents: DrawingContent[];
  nbCollaborators: number;
  creationDate: string;
  authorName: string;
}

export interface DrawingShownInGallery {
  infos: DrawingInfosForGallery;
  thumbnail: Element;
}

export interface JoinDrawing {
  drawingId?: number;
  userId: string;
  password: string | undefined;
}

export interface LeaveDrawing {
  drawingId: number;
  userId: string;
}

export enum DrawingState {
  AVAILABLE,
  DELETED,
}

export enum DrawingVisibility {
  PUBLIC,
  PROTECTED,
  PRIVATE,
}
