export interface ToolsAttributes {
    pencilLineThickness?: number;
    shapeLineThickness?: number;
    shapeType?: ShapeTypes;
}

export enum ShapeTypes {
    OUTLINE = 'OUTLINE',
    FULL = 'FULL',
    BOTH = 'BOTH'
}