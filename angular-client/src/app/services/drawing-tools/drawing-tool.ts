/* eslint-disable @typescript-eslint/no-unused-vars */
//import { Subscription } from 'rxjs';
//import { ChosenColors } from '@models/ChosenColors';
//import { DrawingContent, DrawingStatus } from '@models/DrawingMeta';
//import { ColorPickingService } from '@services/color-picker/color-picking.service';
//import { InteractionService } from '@services/interaction/interaction.service';
//import { InputObserver } from './input-observer';
import { Point } from './point';
//import { ActiveDrawing/*, UserToken*/ } from '../static-services/user_token';
//import { SocketService } from '../socket/socket.service';
//import { DrawingService } from '../drawing/drawing.service';
//import { AuthService } from '../authentication/auth.service';
//import { User } from '@src/app/models/UserMeta';

/*const DEFAULT_PRIMARY_COLOR = 'FF0000FF';
const DEFAULT_SECONDARY_COLOR = '000000';
const DEFAULT_BACK_COLOR = 'FFFFFFFF';*/

export interface DrawingTool {
  currentX: number;
  currentY: number;
  str: string;
  selected: boolean;
  startTransformPoint: Point
  totalTranslation: Point;
  totalScaling: Point;
  scalingPositions: Map<Point, Point>;
  contentId: number;
  userId: string;
  element: SVGElement;
  drawingId: number;

  onMouseDown(event: MouseEvent): void

  onMouseUp(): void

  onMouseMove(event: MouseEvent): void

  getString(): string;

  getOriginalString(): string;

  inTranslationZone(event: MouseEvent): boolean;

  translate(translationPoint: Point): void

  scale(scalePoint: Point, direction: Point): void;

  getSelectionString(): void;

  calculateScalingPositions(): void;

  getScalingPoint(point: Point): [Point, Point] | null;

  getScalingPositionsString(): void;

  parse(parceableString: string): void;

  unselect(): void;

  delete(): void;

  updateThickness(): void;

  updatePrimaryColor(): void;

  updateSecondaryColor(): void;

  select(): void;

  setCriticalValues(): void;
}
