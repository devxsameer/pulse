import { customAlphabet } from "nanoid";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generate = customAlphabet(alphabet, 7);

export function generateShortCode() {
  return generate();
}
