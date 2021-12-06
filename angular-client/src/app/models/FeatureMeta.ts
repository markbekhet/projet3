import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faCircle,
  faMousePointer,
  faPencilAlt,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';

export interface FeatureItem {
  name: string;
  shortcutName: string;
  description: string;
  icon: string;
}

export interface ToolItem {
  name: string;
  shortcutName: string;
  shortDescription: string;
  description: string;
  icon: IconDefinition;
}

export const homeHeaderItems: FeatureItem[] = [
  {
    name: 'Créer un nouveau dessin',
    shortcutName: 'Créer dessin',
    description:
      "Cette option permet d'ouvrir un nouvel espace de dessin selon la taille et la couleur de fond de votre choix.",
    icon: 'add_circle',
  },
  {
    name: 'Créer une nouvelle équipe de collaboration',
    shortcutName: 'Créer équipe',
    description:
      "Cette option permet d'ouvrir une nouvelle équipe de collaboration.",
    icon: 'group_add',
  },
  {
    name: 'Consulter votre profil',
    shortcutName: 'Profil',
    description: `Ce bouton vous permet de consulter votre page de profil.`,
    icon: 'account_circle',
  },
  {
    name: 'Se déconnecter',
    shortcutName: 'Déconnexion',
    description: 'Ce bouton vous permet de vous déconnecter.',
    icon: 'exit_to_app',
  },
];

export const drawingHeaderItems: FeatureItem[] = [
  {
    name: 'Quitter le dessin',
    shortcutName: 'Quitter dessin',
    description:
      "Ce bouton vous permet de quitter le dessin en cours et de revenir à l'accueil.",
    icon: 'arrow_back',
  },
];

export const toolItems: ToolItem[] = [
  {
    name: 'Sélectionner',
    shortcutName: 'Sélectionner',
    shortDescription:
      "Grâce à cet outil, il vous est possible de sélectionner un objet sur l'espace de dessin et de le modifier. En effet, il vous est possible de le déplacer et de le pivoter.",
    description: `Pour choisir cette option, vous pouvez sélectionner l'outil via la barre des outils en appuyant sur l'icône approprié,
    comme vous pouvez l'utiliser en appuyant sur la touche 'S' de votre clavier. Avec l'outil en main, vous pouvez cliquer sur un seul objet sur la planche à dessin
    ou encore en sélectionner plusieurs en effectuant un clic gauche et en faisant glisser la souris pour utiliser le rectangle de sélection, puis en relâchant le bouton de la souris pour sélectionner les items. À l'inverse,
    un clic droit avec cette option crée un rectangle de sélection qui applique un traitement inverse. Il vous sera alors possible de déselectionner les objets déjà sélectionnés ou de sélectionner ceux ne l'étant pas.
    Une fois la sélection complétée, une boîte englobant tous les objets pris en compte apparaîtra. Il sera ensuite possible de déplacer cette sélection avec les flèches du clavier ou avec la souris et de faire tourner cette sélection.
    Pour faire tourner la sélection active, utilisez la roue de la souris pour appliquer une rotation de 15 degrés par cran ou de 1 degré, si la touche 'alt' est pressée. Appuyer sur 'shift' lors de la rotation fera tourner tous les objets sélectionnés autour de leur propre centre.
    Enfin, appuyer sur 'ctrl+A' sélectionnera tous les objets et la touche 'Delete' supprimera la sélection active.`,
    icon: faMousePointer,
  },
  {
    name: 'Crayon',
    shortcutName: 'Crayon',
    shortDescription:
      'Le crayon vous permet de dessiner un trait simple sur la planche à dessin.',
    description: `Après sa sélection, Il vous suffit de maintenir le clic gauche en vous déplaçant dans n’importe quelle
            direction dans l’aire de dessin. Un trait simple de la couleur et grandeur choisies apparaîtra. Vous pouvez sélectionner le crayon via l'icône appropriée dans la boîte à outils ou encore en pressant sur la touche 'C'.`,
    icon: faPencilAlt,
  },
  {
    name: 'Rectangle',
    shortcutName: 'Rectangle',
    shortDescription:
      'En faisant un clic gauche, vous définissez un premier coin du rectangle. En vous déplaçant, un aperçu de la taille du rectangle est disponible et vous pouvez confirmer la création de l’objet en relâchant le clic de souris. De plus, en maintenant la touche Shift, il vous est possible d’uniformiser les côtés de votre rectangle afin de créer un carré.',
    description: `Le type de tracé et l’épaisseur du trait de contour sont configurable dans le panneau d’attribut. La touche '1' du clavier permet de sélectionner l'outil.`,
    icon: faSquare,
  },
  {
    name: 'Ellipse',
    shortcutName: 'Ellipse',
    shortDescription:
      'En faisant un clic gauche, vous définissez un premier coin de l’ellipse. En vous déplaçant, un aperçu de sa taille est disponible et vous pouvez confirmer la création de l’objet en relâchant le clic de souris. De plus, en maintenant la touche Shift, il vous est possible d’uniformiser le rayon de l’ellipse afin de créer un cercle.',
    description: `Vous pouvez configurer les attributs de l'éllipse, comme le type de tracé et l'épaisseur du contour, via le panneau des attributs. Pour utiliser l'éllipse vous pouvovez le sélctionner en appuyant sur l'icône appropriée de la barre des outils comme vous pouvez l'utiliser en appuyant sur la touche 2 de votre clavier.`,
    icon: faCircle,
  },
];
