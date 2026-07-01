import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({ require_protocol: false }, { message: 'Invalid URL' })
  @IsNotEmpty()
  url!: string;
}
