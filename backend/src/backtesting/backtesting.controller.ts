import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { dashSymbolToCcxt } from '../common/symbols';
import { BacktestingService } from './backtesting.service';
import { CreateBacktestDto } from './dto/create-backtest.dto';

@Controller('backtest')
export class BacktestingController {
  constructor(private readonly backtestingService: BacktestingService) {}

  @Post()
  runBacktest(@Body() dto: CreateBacktestDto) {
    return this.backtestingService.runBacktest(dto);
  }

  @Get('history/:symbol')
  getHistory(@Param('symbol') symbol: string) {
    const ccxtSymbol = dashSymbolToCcxt(symbol);
    if (!ccxtSymbol) {
      throw new BadRequestException(`Simbolo '${symbol}' no soportado`);
    }
    return this.backtestingService.getHistory(ccxtSymbol);
  }
}
