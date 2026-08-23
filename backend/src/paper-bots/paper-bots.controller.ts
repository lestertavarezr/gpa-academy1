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
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaperBotDto } from './dto/create-paper-bot.dto';
import { PaperBotsService } from './paper-bots.service';

@UseGuards(JwtAuthGuard)
@Controller('paper-bots')
export class PaperBotsController {
  constructor(private readonly paperBotsService: PaperBotsService) {}

  @Post()
  create(@Body() dto: CreatePaperBotDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paperBotsService.createBot(dto, String(user.userId));
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.paperBotsService.listBots(String(user.userId));
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.paperBotsService.getBot(id, String(user.userId));
  }

  @Patch(':id/pause')
  pause(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.paperBotsService.pauseBot(id, String(user.userId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.paperBotsService.deleteBot(id, String(user.userId));
  }
}
