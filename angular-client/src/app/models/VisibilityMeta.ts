export enum DrawingVisibilityLevel {
  PUBLIC = 0,
  PROTECTED = 1,
  PRIVATE = 2,
}

export enum TeamVisibilityLevel {
  PUBLIC = 0,
  PROTECTED = 1,
}

export interface DrawingVisibilityItem {
  name: string;
  value: DrawingVisibilityLevel;
  desc: string;
}

export interface TeamVisibilityItem {
  name: string;
  value: TeamVisibilityLevel;
  desc: string;
}

export const drawingVisibilityItems: DrawingVisibilityItem[] = [
  {
    name: 'Public',
    value: 0,
    desc: 'Le dessin sera accessible par les autres utilisateurs.',
  },
  {
    name: 'Protégé',
    value: 1,
    desc: 'Le dessin sera accessible par quiconque connaît le mot de passe.',
  },
  {
    name: 'Privé',
    value: 2,
    desc: 'Le dessin sera accessible exclusivement par vous.',
  },
];

export const teamVisibilityItems: TeamVisibilityItem[] = [
  {
    name: 'Publique',
    value: 0,
    desc: 'Cette équipe est ouverte à tous.',
  },
  {
    name: 'Protégée',
    value: 1,
    desc: 'Cette équipe est protégée par un mot de passe.',
  },
];
