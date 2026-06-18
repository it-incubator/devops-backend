import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MetricsModule} from "./metrics.module";
import {ConfigModule} from "@nestjs/config";
import {MetricsMiddleware} from "./metrics.middleware";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        MetricsModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: false,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(MetricsMiddleware)
            .exclude('metrics')  // не измеряем сам /metrics эндпоинт
            .forRoutes('*');
    }
}
