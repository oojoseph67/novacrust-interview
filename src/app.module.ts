import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingMiddleware } from './global/middleware/logging.middleware';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import environmentValidation from './global/config/environmentValidation';
import databaseConfig from './global/config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 4, ttl: seconds(10), blockDuration: seconds(3) }], // 4 request within 10seconds with block-duration of 5 seconds
      errorMessage: 'Too many requests... slow down',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: environmentValidation,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // specify any additional imports here, e.g., TypeORM migrations or custom repositories
      inject: [ConfigService], // inject
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'), // using this syntax means getting directly from the environment variable
        port: +configService.get('database.port'),
        // port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: ['dist/**/*.entity.js'],
        synchronize: configService.get('DATABASE_SYNC'), // set to false in production
        // autoLoadEntities: true, // using this would require us to create a module (controller and module file) for every entity we want to add, exporting it and using the TypeORM.forFeature([]) function
        ...(configService.get('NODE_ENV') !== 'development' && {
          ssl: true,
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        }),
        // Production migration settings
        migrations: ['dist/migrations/*.js'],
        migrationsRun: true, // Auto-run pending migrations on app start
        logging: ['error', 'warn'], // Reduced logging in production
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
