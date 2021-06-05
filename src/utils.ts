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

export function shuffleArray(arr: any[]): any[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
