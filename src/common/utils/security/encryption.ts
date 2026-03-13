import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { env } from "../../../config/env.service.js";

const ENCRYPTION_KEY = Buffer.from(env.encryptionKey, "hex");
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");

  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return iv.toString("hex") + ":" + encrypted + ":" + authTag.toString("hex");
}

export function decrypt(text: string): string {
  const [ivHex, encryptedText, authTagHex] = text.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");

  decrypted += decipher.final("utf8");

  return decrypted;
}
