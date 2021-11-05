import { VisibilityLevel } from '@models/VisibilityMeta';

export interface Drawing {
  drawingId: string | undefined; // we don't have it prior to the request, it's the db that gives it to us
  name: string;
  visibility: VisibilityLevel;
  password?: string;
  width: number;
  height: number;
  bgColor: string;
  ownerId: string | undefined;
  // useOwnerPrivateInformation: boolean;
}

export interface DrawingContent {
  contentId: number; // ID of the svg element drawn onto the surface
  drawing: string; // Actual content of the svg element
  status: DrawingStatus; // To know how to render the drawing and the server uses this value to save when the drawing is done.

  // drawingId: number; // To use when connecting to socket
}

export enum DrawingStatus {
  InProgress,
  Done,
  Selected,
  Deleted,
}
