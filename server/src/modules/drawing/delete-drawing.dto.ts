import { IsNotEmpty } from 'class-validator';

export class DeleteDrawingDto {
  @IsNotEmpty()
  drawingId: number;

  @IsNotEmpty()
  userId: string;
}
