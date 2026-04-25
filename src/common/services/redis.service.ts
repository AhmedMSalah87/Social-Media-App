import { createClient, RedisClientType } from "redis";

class RedisService {
  private readonly redisClient: RedisClientType;
  constructor() {
    this.redisClient = createClient({ url: process.env.REDIS_URL! });
  }

  async connect() {
    try {
      await this.redisClient.connect();
      console.log("connection to redis successfully");
    } catch (err) {
      console.log("failed to connect to redis", err);
      throw err;
    }
  }

  async setCache(key: string, value: string | number, tllSeconds?: number) {
    try {
      const val = typeof value === "object" ? JSON.stringify(value) : value;
      if (tllSeconds) {
        await this.redisClient.set(key, val, {
          expiration: {
            type: "EX",
            value: tllSeconds,
          },
        });
      } else {
        await this.redisClient.set(key, val);
      }
    } catch (err) {
      console.error(`Redis SET error for key ${key}:`, err);
      throw err;
    }
  }

  async getCache(key: string): Promise<string | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value; // if value is primitive, json.parse throw error as value not json string so it is better to return primitive value itself
      }
    } catch (err) {
      console.error(`Redis GET error for key ${key}:`, err);
      throw err;
    }
  }

  async deleteCache(...key: string[]) {
    try {
      await this.redisClient.del(key);
    } catch (err) {
      console.error(`Redis DEL error for key ${key}:`, err);
      throw err;
    }
  }

  async cacheTTL(key: string): Promise<number> {
    try {
      const ttl = await this.redisClient.ttl(key);
      return ttl;
    } catch (err) {
      console.error(`Redis TTL error for key ${key}:`, err);
      throw err;
    }
  }

  async increment(key: string) {
    try {
      const value = await this.redisClient.incr(key);
      return value;
    } catch (err) {
      console.error(`Redis INCR error for key ${key}:`, err);
      throw err;
    }
  }

  async expireCache(key: string, ttlSeconds: number) {
    try {
      await this.redisClient.expire(key, ttlSeconds);
    } catch (err) {
      console.error(`Redis expire error for key ${key}:`, err);
      throw err;
    }
  }
}

export default new RedisService();
