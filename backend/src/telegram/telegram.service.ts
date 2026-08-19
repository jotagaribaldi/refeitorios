import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token: string;
  private readonly chatId: string;

  constructor(private configService: ConfigService) {
    this.token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
  }

  sendMessage(text: string): void {
    if (!this.token || !this.chatId) {
      this.logger.debug('Telegram notifications disabled: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured.');
      return;
    }

    const payload = JSON.stringify({
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${this.token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    // Asynchronous fire-and-forget request
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const status = res.statusCode || 0;
        if (status < 200 || status >= 300) {
          this.logger.error(`Failed to send Telegram message. Status: ${status}, Response: ${body}`);
        }
      });
    });

    req.on('error', (err) => {
      this.logger.error('Error sending message to Telegram:', err.message);
    });

    req.write(payload);
    req.end();
  }
}
