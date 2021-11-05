import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { visibility } from 'src/enumerators/visibility';

export class CreateDrawingDto {
  @IsString()
  name: string;

  @IsEnum(visibility)
  visibility: visibility;

  @IsString()
  @IsOptional()
  password: string;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNotEmpty()
  color: string;

  @IsNotEmpty()
  ownerId: string;
}
