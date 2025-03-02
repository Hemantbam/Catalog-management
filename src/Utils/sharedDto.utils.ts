import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidIdDto {
  @ApiProperty({
    description: 'The id must be an UUID type',
    example: 'a12b2c87-d01b-444e-9f4a-157260b882c5',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsOptional()
  attribute_id: string;

  @IsUUID()
  @IsOptional()
  category_id: string;
}
