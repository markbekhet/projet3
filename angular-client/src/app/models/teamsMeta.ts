import { TeamVisibilityLevel } from "./VisibilityMeta";

export interface Team{
    id?: string;
    visibility?: TeamVisibilityLevel,
    name?: string;
    ownerId?: string;
    password?: string;
    nbCollaborators?: number;
}