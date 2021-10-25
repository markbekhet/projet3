export interface DrawingContent{
    // If we want we can add a userId so we can know who is drawing what but that will come later
    // To use when you connect with socket
    // drawingId: number;
    contentId: number;
    // the actual content
    drawing: string;
    // to know how to render the drawing and the server uses this value to save when the drawing is done
    status: DrawingStatus
}
export enum DrawingStatus{
    InProgress = "InProgress",
    Done = "Done",
    Selected = "Selected",
    Deleted = "Deleted"
}