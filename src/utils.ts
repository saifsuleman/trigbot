export function has(query: string, text: string): boolean {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return false;
  }

  if (index > 0 && text[index - 1].match(/[a-zA-Z]/)) {
    return false;
  }

  if (index + query.length < text.length) {
    if (text[index + query.length].match(/[a-zA-Z]/)) {
      return false;
    }
  }

  return true;
}
