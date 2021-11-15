import { DrawingVisibility } from "src/enumerators/visibility";
import { DrawingContent } from "../drawing-content/drawing-content.entity";

export interface GalleryDrawing{
    drawingId: number,
    visibility: DrawingVisibility,
    contents: DrawingContent[],
    drawingName: string,
    ownerUsername: string,
    height: number,
    width: number,
    ownerEmail: string,
    ownerFirstName: string,
    ownerLastName: string,
}