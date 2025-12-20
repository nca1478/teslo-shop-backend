import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request: { method: string; url: string; user?: { id: string } } = context
            .switchToHttp()
            .getRequest();
        const { method, url, user } = request;
        const startTime = Date.now();

        this.logger.log(`Incoming Request: ${method} ${url} - User: ${user?.id || 'Anonymous'}`);

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = Date.now() - startTime;
                    this.logger.log(`Request completed: ${method} ${url} - ${duration}ms`);
                },
                error: (error: { message: string }) => {
                    const duration = Date.now() - startTime;
                    this.logger.error(
                        `Request failed: ${method} ${url} - ${duration}ms - Error: ${error.message}`,
                    );
                },
            }),
        );
    }
}
