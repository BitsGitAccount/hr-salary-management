import * as fs from 'fs';

/**
 * Parses a text file containing names (one per line)
 * and returns a clean array of strings with empty lines filtered out.
 *
 * @param filePath - The absolute path to the text file
 * @returns An array of trimmed, non-empty strings
 */
export function parseNamesFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');

  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}
