import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BacktestingController } from './backtesting.controller';
import { BacktestingService } from './backtesting.service';
import { BacktestRecord } from './entities/backtest-record.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([BacktestRecord])],
  controllers: [BacktestingController],
  providers: [BacktestingService],
})
export class BacktestingModule {}
