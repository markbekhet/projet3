import { DrawingVisibility } from "src/enumerators/visibility";

export interface DrawingGallery{
    id: number,
    visibility: DrawingVisibility, 
    name: string, 
    bgColor: string, 
    height: number, 
    width: number, 
    creationDate: string, 
    authorName: string, 
    ownerId: string,
    nbCollaborators: number,
}