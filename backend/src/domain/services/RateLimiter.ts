import redisClient from '../../config/redis';

export class RateLimitExceededError extends Error {
  constructor(public nextAvailableTime: Date) {
    super('Rate limit exceeded');
    this.name = 'RateLimitExceededError';
  }
}

export class RateLimiter {
  private maxEmailsPerHour: number;

  constructor() {
    this.maxEmailsPerHour = parseInt(
      process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || '100'
    );
  }

  private getHourKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    return `${year}-${month}-${day}-${hour}`;
  }

  private getNextHourStart(date: Date): Date {
    const next = new Date(date);
    next.setUTCHours(next.getUTCHours() + 1, 0, 0, 0);
    return next;
  }

  async check(sender: string): Promise<void> {
    const now = new Date();
    const hourKey = this.getHourKey(now);
    const redisKey = `rate_limit:${sender}:${hourKey}`;

    const count = await redisClient.incr(redisKey);

    // Set expiry on first increment
    if (count === 1) {
      await redisClient.expire(redisKey, 3600); // 1 hour
    }

    if (count > this.maxEmailsPerHour) {
      const nextHour = this.getNextHourStart(now);
      throw new RateLimitExceededError(nextHour);
    }
  }

  async getCurrentCount(sender: string): Promise<number> {
    const now = new Date();
    const hourKey = this.getHourKey(now);
    const redisKey = `rate_limit:${sender}:${hourKey}`;
    const count = await redisClient.get(redisKey);
    return count ? parseInt(count) : 0;
  }

  async reset(sender: string): Promise<void> {
    const now = new Date();
    const hourKey = this.getHourKey(now);
    const redisKey = `rate_limit:${sender}:${hourKey}`;
    await redisClient.del(redisKey);
  }
}
