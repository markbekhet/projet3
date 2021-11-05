export enum VisibilityLevel {
  PUBLIC = 0,
  PROTECTED = 1,
  PRIVATE = 2,
}

export interface VisibilityItem {
  name: string;
  value: VisibilityLevel;
  desc: string;
}

export const drawingVisibilityItems: VisibilityItem[] = [
  {
    name: 'Public',
    value: 0,
    desc: 'Votre dessin sera accessible par les autres utilisateurs.',
  },
  {
    name: 'Protégé',
    value: 1,
    desc: 'Votre dessin sera accessible, en possession du bon mot de passe.',
  },
  {
    name: 'Privé',
    value: 2,
    desc: 'Votre dessin sera seulement accessible par vous.',
  },
];

export const teamVisibilityItems: VisibilityItem[] = [
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
