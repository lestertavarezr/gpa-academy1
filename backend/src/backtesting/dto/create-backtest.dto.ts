import { IsIn, IsISO8601, IsInt, IsNumber, IsPositive, Max, Min } from 'class-validator';
import { SUPPORTED_CCXT_SYMBOLS, SupportedCcxtSymbol } from '../../common/symbols';

export class CreateBacktestDto {
  @IsIn(SUPPORTED_CCXT_SYMBOLS)
  symbol: SupportedCcxtSymbol;

  @IsISO8601({ strict: true })
  start_date: string;

  @IsISO8601({ strict: true })
  end_date: string;

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
}
