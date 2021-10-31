export interface DrawingContent {
  // If we want, we can add a userID so we can know who's drawing what, but that will come later.

  // ID of the svg element drawn onto the surface
  contentId: number;

  // Actual content of the svg element
  drawing: string;

  // To know how to render the drawing and the server uses this value to save when the drawing is done.
  status: DrawingStatus;

  // To use when connecting to socket
  // drawingId: number;
}

export enum DrawingStatus {
  InProgress,
  Done,
  Selected,
  Deleted,
}
