import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis and Ratelimit only if credentials are provided
// In production, these should be environment variables
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const ratelimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per 60 seconds
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

export async function middleware(request: NextRequest) {
  // 1. Target sensitive AI and matching routes
  if (request.nextUrl.pathname.startsWith('/api/match') || request.nextUrl.pathname.startsWith('/api/cron')) {
    
    // Skip ratelimit in development if no Redis is configured
    if (!ratelimit) {
      console.warn('[Middleware] Rate limiting skipped: Upstash Redis not configured.');
      return NextResponse.next();
    }

    const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { 
          error: "Too many matching requests. Please wait a minute.",
          limit,
          remaining,
          reset 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/api/match/:path*', '/api/cron/:path*'],
};
