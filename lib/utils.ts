import { URL } from "node:url";

export function isURL(input: string) {
  try {
    new URL(input)
    return true;
  } catch (error) {
    return false;
  }
}
