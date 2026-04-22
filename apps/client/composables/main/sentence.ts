const WORD_TOKEN_PATTERN = /^[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*$/;
const SENTENCE_TOKEN_PATTERN = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|[^\s]/g;

export function isSentenceWord(token: string) {
  return WORD_TOKEN_PATTERN.test(token);
}

export function splitSentenceTokens(sentence: string | undefined) {
  return sentence?.match(SENTENCE_TOKEN_PATTERN) ?? [];
}
