import { parseNamesFile } from '../utils/fileParser';
import * as path from 'path';
import * as fs from 'fs';

describe('File Parser Utility', () => {
  const testDataDir = path.join(__dirname, '../../data');

  it('should parse first_names.txt and return clean string array', () => {
    const filePath = path.join(testDataDir, 'first_names.txt');
    const names = parseNamesFile(filePath);

    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBe(10);
    expect(names[0]).toBe('James');
    expect(names[9]).toBe('Elizabeth');
    // Ensure no empty strings
    names.forEach(name => {
      expect(name.trim()).not.toBe('');
    });
  });

  it('should parse last_names.txt and return clean string array', () => {
    const filePath = path.join(testDataDir, 'last_names.txt');
    const names = parseNamesFile(filePath);

    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBe(10);
    expect(names[0]).toBe('Smith');
    expect(names[9]).toBe('Martinez');
  });

  it('should filter out empty lines', () => {
    // Create a temp file with empty lines
    const tempFilePath = path.join(testDataDir, 'temp_test.txt');
    fs.writeFileSync(tempFilePath, 'Alice\n\nBob\n  \nCharlie\n');

    const names = parseNamesFile(tempFilePath);

    expect(names.length).toBe(3);
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);

    // Clean up
    fs.unlinkSync(tempFilePath);
  });
});
