import { MenuItem } from "./models/menu-item";

export const menuItems:MenuItem[] = [
    {
        name: 'Créer un nouveau dessin',
        shortcutName: 'Créer',
        shortDescription:
            "Cette option vous permet d'ouvrir un nouvel espace de dessin selon la taille et la couleur de fond de votre choix.",
        description:
            `La largeur et la hauteur du dessin sont
            automatiquement générés selon les dimensions de la fenêtre de votre navigateur.
            Par défaut, la couleur du nouveau dessin sera blanche, mais il est possible de la redéfinir avec une nouvelle valeur hexadécimale ou encore avec l’outil de sélection de couleur situé sur le formulaire. Il est possible d’ouvrir le formulaire via le raccourci 'ctrl+O'. Notez que si le dessin en cours n’a pas été sauvegardé sur la gallerie, celui-ci sera écrasé.`,
        icon: 'add_circle',
    },
    {
        name: 'Ouvrir la galerie de dessins',
        shortcutName: 'Ouvrir',
        shortDescription:
            `Cette option vous permet de visualiser tous les dessins que vous avez sauvegardé sur le serveur de PolyDessin, comme elle vous donne la possibilité de continuer un dessin sauvegardé en appuyant sur la flèche qui se trouve sous chaque dessin.
            Aussi, vous pouvez supprimer un dessin sauvegardé sur la base de données ou encore rechercher l'un d'entres eux à l'aide d'étiquettes.`,
        description: `Pour ouvrir la fenêtre d'exportation, vous pouvez appuyer sur l'icône approprié de la barre d'options,
        comme vous pouvez l'ouvrir en faisant la touche 'ctrl+G' de votre clavier. Si des dessins précédemment sauvegardés sont présents sur le serveur, ils seront automatiquement affichés sous forme
        de fenêtre de prévisualisation en vous laissant le choix de supprimer ou de continuer celui-ci. Cette dernière option écrasera le dessin courant dans le cas où il n'a pas été sauvegardé au préalable.
        Enfin, il est possible de rechercher un dessin à l'aide d'étiquettes via la barre de filtrage située au haut de la gallerie.`,
        icon: 'camera',
    },
];