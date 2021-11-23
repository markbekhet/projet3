import { DrawingVisibility, DrawingState } from './DrawingMeta';

export interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  password?: string;
  status?: Status;
  pseudo?: string;

  averageCollaborationTime?: number;
  totalCollaborationTime?: number;
  numberCollaborationTeams?: number;
  numberCollaboratedDrawings?: number;
  numberAuthoredDrawings?: number;

  connectionHistories?: ConnectionHistory[];
  disconnectionHistories?: DisconnectionHistory[];
  drawingEditionHistories?: DrawingEditionHistory[];
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
  drawingStae: DrawingState;
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

export interface Avatar {
  filename: string;
  url: string;
  encoding?: string;
}

export const avatarList: Avatar[] = [
  {
    filename: 'avatar1',
    url: '../../../assets/avatars/avatar1.png'
  },
  {
    filename: 'avatar2',
    url: '../../../assets/avatars/avatar2.png'
  },
  {
    filename: 'avatar3',
    url: '../../../assets/avatars/avatar3.png'
  },
  {
    filename: 'avatar4',
    url: '../../../assets/avatars/avatar4.png'
  },
  {
    filename: 'avatar5',
    url: '../../../assets/avatars/avatar5.png'
  },
  {
    filename: 'avatar6',
    url: '../../../assets/avatars/avatar6.png'
  },
  {
    filename: 'avatar7',
    url: '../../../assets/avatars/avatar7.png'
  },
  {
    filename: 'avatar8',
    url: '../../../assets/avatars/avatar8.png'
  },
  {
    filename: 'avatar9',
    url: '../../../assets/avatars/avatar9.png'
  },
  {
    filename: 'avatar10',
    url: '../../../assets/avatars/avatar10.png'
  },

]
