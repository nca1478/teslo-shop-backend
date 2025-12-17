import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request: { method: string; url: string } = context
      .switchToHttp()
      .getRequest();
    const key = this.generateCacheKey(request);

    // Check if we have cached data
    const cachedData: { data: unknown; timestamp: number } | undefined =
      this.cache.get(key);
    if (cachedData && Date.now() - cachedData.timestamp < this.TTL) {
      return of(cachedData.data);
    }

    return next.handle().pipe(
      tap((data: unknown) => {
        // Cache the response
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        });
      }),
    );
  }

  private generateCacheKey(request: { method: string; url: string }): string {
    return `${request.method}:${request.url}`;
  }
}
