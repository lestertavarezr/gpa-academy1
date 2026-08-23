import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { isSupportedSymbol, SUPPORTED_SYMBOLS } from '../common/symbols';
import { SignalHistoryService } from './signal-history.service';

@Controller('signal-history')
export class SignalHistoryController {
  constructor(private readonly signalHistoryService: SignalHistoryService) {}

  @Get(':symbol')
  getHistory(@Param('symbol') symbol: string) {
    if (!isSupportedSymbol(symbol)) {
      throw new BadRequestException(
        `Simbolo '${symbol}' no soportado. Disponibles: ${SUPPORTED_SYMBOLS.join(', ')}`,
      );
    }
    return this.signalHistoryService.getHistory(symbol.toUpperCase());
  }
}
