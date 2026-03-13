import { createClient } from "redis";
import { env } from "../../config/env.service.js";

export const client = createClient({
  url: env.redisUri,
});

export const redisConection = async () => {
  await client
    .connect()
    .then(() => {
      console.log("redis connected successfully");
    })
    .catch((err) => {
      console.log({ message: "redis connection failed", error: err });
    });
};
