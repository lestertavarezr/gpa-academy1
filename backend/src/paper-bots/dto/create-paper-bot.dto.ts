import { IsIn, IsInt, IsNumber, IsPositive, Max, Min } from 'class-validator';
import { SUPPORTED_CCXT_SYMBOLS, SupportedCcxtSymbol } from '../../common/symbols';

export class CreatePaperBotDto {
  @IsIn(SUPPORTED_CCXT_SYMBOLS)
  symbol: SupportedCcxtSymbol;

  @IsInt()
  @Min(0)
  @Max(100)
  buy_score_threshold: number;

  @IsInt()
  @Min(0)
  @Max(100)
  sell_score_threshold: number;

  @IsNumber()
  @IsPositive()
  initial_capital: number;

  @IsNumber()
  @IsPositive()
  @Max(100)
  kill_switch_pct: number;

  @IsInt()
  @Min(1)
  @Max(1440)
  evaluation_interval_minutes: number;
}
