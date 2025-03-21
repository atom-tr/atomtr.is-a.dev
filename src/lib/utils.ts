import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import sanitizeHtml from 'sanitize-html'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function extractTextContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['code'], // Keep <code> tags only
    allowedAttributes: {}, // Remove all attributes
    textFilter: (text) => {
      let previous;
      do {
        previous = text;
        text = text.replace(/<!--[\s\S]*?-->/g, '');
      } while (text !== previous);
      return text;
    }, // Remove comments
  });
}

export function readingTime(html: string): string {
  const textOnly = extractTextContent(html);
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${readingTimeMinutes} min read`;
}