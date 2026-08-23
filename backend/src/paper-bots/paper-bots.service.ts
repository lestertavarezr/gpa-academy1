import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '../common/fastapi-errors';
import { CreatePaperBotDto } from './dto/create-paper-bot.dto';

@Injectable()
export class PaperBotsService {
  private readonly logger = new Logger(PaperBotsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  createBot(dto: CreatePaperBotDto, userId: string) {
    return this.forward(() =>
      this.httpService.post(`${this.botEngineUrl()}/paper-bots`, dto, this.authHeaders(userId)),
    );
  }

  listBots(userId: string) {
    return this.forward(() =>
      this.httpService.get(`${this.botEngineUrl()}/paper-bots`, this.authHeaders(userId)),
    );
  }

  getBot(id: number, userId: string) {
    return this.forward(() =>
      this.httpService.get(`${this.botEngineUrl()}/paper-bots/${id}`, this.authHeaders(userId)),
    );
  }

  pauseBot(id: number, userId: string) {
    return this.forward(() =>
      this.httpService.patch(
        `${this.botEngineUrl()}/paper-bots/${id}/pause`,
        {},
        this.authHeaders(userId),
      ),
    );
  }

  async deleteBot(id: number, userId: string): Promise<void> {
    await this.forward(() =>
      this.httpService.delete(`${this.botEngineUrl()}/paper-bots/${id}`, this.authHeaders(userId)),
    );
  }

  private botEngineUrl(): string {
    return this.configService.get<string>('BOT_ENGINE_URL', 'http://localhost:8000');
  }

  /**
   * El bot-engine no valida JWT: confia en que solo este backend le habla
   * (nunca deberia quedar expuesto directo a internet) y en el X-User-Id
   * que le reenviamos aca, ya extraido y verificado del JWT por el
   * JwtAuthGuard del controller. Asi el bot-engine puede filtrar/aplicar
   * ownership sobre los bots sin tener que re-implementar la verificacion
   * de JWT en Python.
   */
  private authHeaders(userId: string): AxiosRequestConfig {
    return { headers: { 'X-User-Id': userId } };
  }

  private async forward<T>(request: () => Observable<AxiosResponse<T>>): Promise<T> {
    try {
      const { data } = await firstValueFrom(request());
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: unknown }>;
      const status = axiosError.response?.status;

      // El bot-engine devuelve 404 (bot inexistente o de otro usuario — nunca
      // 403, para no confirmarle a quien no es el dueño que el bot existe) o
      // 400/422 (validacion). Son errores del cliente, se los pasamos tal
      // cual en vez de un 502.
      if (status === 404) {
        throw new HttpException(
          extractErrorMessage(axiosError.response?.data?.detail),
          HttpStatus.NOT_FOUND,
        );
      }
      if (status === 400 || status === 422) {
        throw new HttpException(
          extractErrorMessage(axiosError.response?.data?.detail),
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.error(`Error consultando bot-engine (paper-bots): ${axiosError.message}`);
      throw new HttpException(
        'No se pudo completar la operacion sobre el bot en el bot engine',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
