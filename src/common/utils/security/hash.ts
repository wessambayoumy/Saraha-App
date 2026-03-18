import { hashSync, compareSync } from "bcrypt";
import { env } from "../../../../config/env.service.js";

export const hash = (data: string | Buffer<ArrayBufferLike>) =>
  hashSync(data, env.saltRounds);

export const compareHash = (
  plain: string | Buffer<ArrayBufferLike>,
  encrypted: string,
) => compareSync(plain, encrypted);
