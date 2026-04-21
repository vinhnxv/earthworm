import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

type SourceStatement = {
  chinese: string;
  english: string;
  soundmark: string;
};

type TargetStatement = {
  vietnamese: string;
  english: string;
  soundmark: string;
};

const sourceDir = path.resolve(__dirname, "../data/courses");
const targetDir = path.resolve(__dirname, "../data/courses-vi");
const hanPattern = /\p{Script=Han}/u;
const mixedCasePlaceholderPattern = /tRONG|qUYẾT ĐỊNH/u;
const duplicateMarkers = new Set(["đã", "chưa", "đang", "bị", "có", "luôn"]);
const wordPattern = /\p{L}+/gu;

function words(text: string) {
  return (text.match(wordPattern) ?? []).map((word) => word.toLocaleLowerCase("vi-VN"));
}

function hasRepeatedMarker(text: string) {
  const withoutParentheses = text.replace(/\([^)]*\)/g, " ");
  const tokens = words(withoutParentheses);

  for (let index = 1; index < tokens.length; index += 1) {
    if (tokens[index] === tokens[index - 1] && duplicateMarkers.has(tokens[index])) {
      return true;
    }
  }

  const parenthesesPattern = /\(([^)]*)\)/g;

  for (const match of text.matchAll(parenthesesPattern)) {
    const insideWords = words(match[1]);

    if (insideWords.length !== 1 || !duplicateMarkers.has(insideWords[0])) {
      continue;
    }

    const beforeWords = words(text.slice(0, match.index));
    const afterWords = words(text.slice((match.index ?? 0) + match[0].length));
    const token = insideWords[0];

    if (beforeWords.at(-1) === token || afterWords[0] === token) {
      return true;
    }
  }

  return false;
}

function hasRepeatedSeparatedPhrase(text: string) {
  const parts = text
    .split(/[;/]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return false;
  }

  const normalizedParts = parts.map((part) =>
    part
      .replace(/\([^)]*\)/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("vi-VN"),
  );

  return normalizedParts.every((part) => part.length > 0 && part === normalizedParts[0]);
}

describe("Vietnamese course translations", () => {
  it("keep english statements aligned with the source files", () => {
    const fileNames = fs
      .readdirSync(sourceDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort((left, right) => left.localeCompare(right));

    for (const fileName of fileNames) {
      const sourceStatements = JSON.parse(
        fs.readFileSync(path.join(sourceDir, fileName), "utf8"),
      ) as SourceStatement[];
      const targetStatements = JSON.parse(
        fs.readFileSync(path.join(targetDir, fileName), "utf8"),
      ) as TargetStatement[];

      expect(targetStatements).toHaveLength(sourceStatements.length);

      for (const [index, sourceStatement] of sourceStatements.entries()) {
        expect(targetStatements[index]?.english).toBe(sourceStatement.english);
      }
    }
  });

  it("do not leave Han characters in vietnamese or soundmark fields", () => {
    const fileNames = fs
      .readdirSync(targetDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort((left, right) => left.localeCompare(right));

    const invalidEntries: string[] = [];

    for (const fileName of fileNames) {
      const statements = JSON.parse(
        fs.readFileSync(path.join(targetDir, fileName), "utf8"),
      ) as TargetStatement[];

      for (const [index, statement] of statements.entries()) {
        if (hanPattern.test(statement.vietnamese) || hanPattern.test(statement.soundmark)) {
          invalidEntries.push(`${fileName}:${index + 1} ${statement.english}`);
        }
      }
    }

    expect(invalidEntries).toEqual([]);
  });

  it("do not leave obvious untranslated placeholders or duplicated vietnamese tokens", () => {
    const fileNames = fs
      .readdirSync(targetDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort((left, right) => left.localeCompare(right));

    const invalidEntries: string[] = [];

    for (const fileName of fileNames) {
      const statements = JSON.parse(
        fs.readFileSync(path.join(targetDir, fileName), "utf8"),
      ) as TargetStatement[];

      for (const [index, statement] of statements.entries()) {
        const vietnamese = statement.vietnamese.trim();

        if (
          vietnamese.toLocaleLowerCase("en-US") === "young" ||
          mixedCasePlaceholderPattern.test(vietnamese) ||
          hasRepeatedSeparatedPhrase(vietnamese) ||
          hasRepeatedMarker(vietnamese)
        ) {
          invalidEntries.push(`${fileName}:${index + 1} ${statement.english} => ${vietnamese}`);
        }
      }
    }

    expect(invalidEntries).toEqual([]);
  });
});
