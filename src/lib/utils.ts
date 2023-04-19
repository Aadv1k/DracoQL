export function isURL(input: string) {
  var httpRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  return httpRegex.test(input);
}

export function isLowerCase(str: string): boolean {
  return str.toLowerCase() === str;
}
