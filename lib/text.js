import { decode } from 'he';

// Strip HTML, decode entities, and collapse whitespace into a single clean line.
export function cleanText(value = '') {
  return decode(String(value))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Trim a title to `limit` words, appending an ellipsis only when truncation occurred.
export function cutTitle(value, limit = 16) {
  const words = cleanText(value).split(' ').filter(Boolean);
  if (!words.length) return '';
  return words.slice(0, limit).join(' ') + (words.length > limit ? '...' : '');
}

// Build a short excerpt of `words` words, with a fallback when the source is empty.
export function makeExcerpt(value, { words = 16, fallback = '' } = {}) {
  const list = cleanText(value).split(' ').filter(Boolean);
  if (!list.length) return fallback;
  return list.slice(0, words).join(' ') + (list.length > words ? '...' : '');
}

// Split rendered HTML into clean text paragraphs (used by the article body).
export function getParagraphs(html = '') {
  const text = decode(String(html))
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .trim();

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}
