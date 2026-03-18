import crypto from "node:crypto";

export const generatePassword = (): string => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()-+=[]{}|;<>?,./~`";

  const allChars = upper + lower + digits + special;

  // Guarantee at least one of each required group
  const required = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];

  // Fill remaining length (8–16), pick random length between 8–16
  const length = crypto.randomInt(8, 17);
  const rest = Array.from(
    { length: length - 4 },
    () => allChars[crypto.randomInt(allChars.length)],
  );

  // Shuffle so required chars aren't always at the start
  return [...required, ...rest].sort(() => crypto.randomInt(3) - 1).join("");
};
