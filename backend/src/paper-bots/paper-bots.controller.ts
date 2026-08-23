import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePaperBotDto } from './dto/create-paper-bot.dto';
import { PaperBotsService } from './paper-bots.service';

@Controller('paper-bots')
export class PaperBotsController {
  constructor(private readonly paperBotsService: PaperBotsService) {}

  @Post()
  create(@Body() dto: CreatePaperBotDto) {
    return this.paperBotsService.createBot(dto);
  }

  @Get()
  list() {
    return this.paperBotsService.listBots();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.paperBotsService.getBot(id);
  }

  @Patch(':id/pause')
  pause(@Param('id', ParseIntPipe) id: number) {
    return this.paperBotsService.pauseBot(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paperBotsService.deleteBot(id);
  }
}
