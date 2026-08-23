import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaperBotsController } from './paper-bots.controller';
import { PaperBotsService } from './paper-bots.service';

@Module({
  imports: [HttpModule],
  controllers: [PaperBotsController],
  providers: [PaperBotsService],
})
export class PaperBotsModule {}
