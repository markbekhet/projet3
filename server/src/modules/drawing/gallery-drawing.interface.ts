import { visibility } from "src/enumerators/visibility";

export interface GalleryDrawing{
    drawingId: number,
    visibility: visibility,
    content: string,
    drawingName: string,
    ownerUsername: string,
    height: number,
    width: number,
    ownerEmail: string,
    ownerFirstName: string,
    ownerLastName: string,
}