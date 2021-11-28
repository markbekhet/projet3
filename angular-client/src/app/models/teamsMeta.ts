import { ActiveUser } from "./active-user";
import { DrawingInfosForGallery } from "./DrawingMeta";
import { TeamVisibilityLevel } from "./VisibilityMeta";

export interface Team{
    id: string;
    name: string;
    visibility: TeamVisibilityLevel,
    ownerId: string;
    bio: string| undefined;
}

export interface TeamInformations{
    id: string;
    name: string;
    visibility: TeamVisibilityLevel,
    ownerId: string;
    bio: string| undefined;
    gallery: DrawingInfosForGallery[];
    activeUsers: ActiveUser[];
}

export interface TeamCreation{
    name: string;
    visibility: TeamVisibilityLevel,
    password: string| undefined;
    ownerId: string;
    bio: string| undefined;
    nbCollaborators: number;
}