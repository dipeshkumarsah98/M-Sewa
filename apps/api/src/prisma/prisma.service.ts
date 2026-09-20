
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
  constructor(private configService: ConfigService) {
    const DB_URL = configService.get<string>('DATABASE_URL');
    console.log("Connecting to database...", DB_URL );
    if (!DB_URL) {
      throw new Error('DATABASE_URL is not defined in the environment variables');
    }
    super({
      adapter: new PrismaPg({
        connectionString: DB_URL,
      }),
    });
  }

  async onModuleInit() {
     try {
        await this.$connect();
        this.logger.log('Successfully connected to database');
      } catch (error: any) {
        this.logger.error(
          `Failed to connect to database: ${error?.message || error.stack}`,
        );
        throw error;
      }
  }

  async onModuleDestroy() {
     try {
      await this.$disconnect();
      this.logger.log('Disconnected from database');
    } catch (error: any) {
      this.logger.error('Error disconnecting from database', error);
    }
  }
}
