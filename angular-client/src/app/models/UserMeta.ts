import { DrawingVisibility, DrawingState } from './DrawingMeta';

export interface User {
  token: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  status: Status;
  pseudo: string;

  averageCollaborationTime: number;
  totalCollaborationTime: number;
  numberCollaborationTeams: number;
  numberCollaboratedDrawings: number;
  numberAuthoredDrawings: number;

  connectionHistories: ConnectionHistory[];
  disconnectionHistories: DisconnectionHistory[];
  drawingEditionHistories: DrawingEditionHistory[];
}

export interface UserProfileRequest {
  userId: string;
  visitedId: string;
}

export enum Status {
  ONLINE,
  BUSY,
  OFFLINE,
}

export interface DrawingEditionHistory {
  id: number;
  action: string;
  drawingName: string;
  drawingId: number;
  drawingVisibility: DrawingVisibility;
  drawingState: DrawingState;
  date: string;
}

export interface ConnectionHistory {
  id: number;
  date: string;
}

export interface DisconnectionHistory {
  id: number;
  date: string;
}

export interface UpdateUserInformation {
  newPassword?: string | null;
  newPseudo?: string | null;
  oldPassword?: string | null;
}
