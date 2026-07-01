import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { RedirectController } from './redirect.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Link])],
  controllers: [LinksController, RedirectController],
  providers: [LinksService],
})
export class LinksModule {}
