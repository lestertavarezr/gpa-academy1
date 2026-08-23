import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataModule } from '../market-data/market-data.module';
import { SignalRecord } from './entities/signal-record.entity';
import { SignalHistoryController } from './signal-history.controller';
import { SignalHistoryService } from './signal-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([SignalRecord]), MarketDataModule],
  controllers: [SignalHistoryController],
  providers: [SignalHistoryService],
  exports: [SignalHistoryService],
})
export class SignalHistoryModule {}
