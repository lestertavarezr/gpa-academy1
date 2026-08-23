import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SignalHistoryModule } from '../signal-history/signal-history.module';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';

@Module({
  imports: [HttpModule, SignalHistoryModule],
  controllers: [SignalsController],
  providers: [SignalsService],
})
export class SignalsModule {}
