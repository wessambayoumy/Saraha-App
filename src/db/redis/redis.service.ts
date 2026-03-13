import type { RedisArgument, SetOptions } from "redis";
import { client } from "./redis.connection.js";
export const redis = {
  get: async (key: RedisArgument): Promise<string | null> =>
    await client.get(key),
  set: async (
    key: RedisArgument,
    value: RedisArgument | number,
    options?: SetOptions,
  ) => await client.set(key, value, options),
  ttl: async (key: RedisArgument): Promise<number> => await client.ttl(key),
  exists: async (keys: RedisArgument | Array<RedisArgument>): Promise<number> =>
    await client.exists(keys),
  del: async (keys: RedisArgument | Array<RedisArgument>) =>
    await client.del(keys),
  mget: async (keys: RedisArgument[]) => await client.mGet(keys),
  mset: async (
    toSet:
      | Array<[RedisArgument, RedisArgument]>
      | Array<RedisArgument>
      | Record<string, RedisArgument>,
  ) => await client.mSet(toSet),
  keys: async (pattern: RedisArgument) => await client.keys(pattern),
  incrBy: async (key: RedisArgument, incrementation: number) =>
    await client.incrBy(key, incrementation),
};
