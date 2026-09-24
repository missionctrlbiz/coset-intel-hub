/**
 * Robust JSON extraction from model responses. Providers may wrap JSON in
 * markdown fences or prepend commentary, so we locate the first balanced
 * JSON block instead of trusting the raw payload shape.
 */

export function normalizeJsonResponse(rawText: string) {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const jsonBlock = extractFirstJsonBlock(cleaned);
  return jsonBlock ?? cleaned;
}

export function extractFirstJsonBlock(rawText: string) {
  const startIndex = rawText.search(/[\[{]/);
  if (startIndex === -1) {
    return null;
  }

  const openingChar = rawText[startIndex];
  const closingChar = openingChar === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = startIndex; index < rawText.length; index += 1) {
    const character = rawText[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (character === '\\') {
        isEscaped = true;
        continue;
      }

      if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === openingChar) {
      depth += 1;
      continue;
    }

    if (character === closingChar) {
      depth -= 1;
      if (depth === 0) {
        return rawText.slice(startIndex, index + 1).trim();
      }
    }
  }

  return null;
}

export function parseModelJson<T>(rawText: string): T | null {
  const normalized = normalizeJsonResponse(rawText);

  try {
    return JSON.parse(normalized) as T;
  } catch (error) {
    console.error('Failed to parse model JSON response:', error, rawText);
    return null;
  }
}
