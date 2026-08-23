import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { isSupportedSymbol, SUPPORTED_SYMBOLS } from '../common/symbols';
import { SignalsService } from './signals.service';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get(':symbol')
  getSignal(@Param('symbol') symbol: string) {
    if (!isSupportedSymbol(symbol)) {
      throw new BadRequestException(
        `Simbolo '${symbol}' no soportado. Disponibles: ${SUPPORTED_SYMBOLS.join(', ')}`,
      );
    }
    return this.signalsService.getSignal(symbol.toUpperCase());
  }
}
