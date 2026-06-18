import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
    name: 'http_response_time_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const end = httpRequestDuration.startTimer();

        res.on('finish', () => {
            end({
                method: req.method,
                route: req.route?.path ?? req.path,
                status_code: res.statusCode,
            });
        });

        next();
    }
}
