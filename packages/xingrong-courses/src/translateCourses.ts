import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

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
const cacheDir = path.resolve(__dirname, "../data/translation-cache");
const cachePath = path.resolve(cacheDir, "zh-vi.json");
const concurrency = Number.parseInt(process.env.TRANSLATE_CONCURRENCY ?? "4", 10);
const retryCount = Number.parseInt(process.env.TRANSLATE_RETRY_COUNT ?? "3", 10);
const retryDelayMs = Number.parseInt(process.env.TRANSLATE_RETRY_DELAY_MS ?? "750", 10);
const limit = Number.parseInt(process.env.TRANSLATE_LIMIT ?? "0", 10);

const overrides: Record<string, string> = {
  I: "tôi",
  like: "thích",
  "I like": "tôi thích",
  "the food": "món ăn này",
  "don't": "không",
  "don't like": "không thích",
  "to do": "làm",
  it: "nó; việc này",
  "to do it": "làm việc này",
  now: "bây giờ",
  here: "ở đây",
  "to be here": "ở đây",
  want: "muốn",
  "don't want": "không muốn",
  today: "hôm nay",
  "to eat": "ăn",
  "every day": "mỗi ngày",
  "all the day": "cả ngày",
  need: "cần",
  "have to do": "phải làm",
  tomorrow: "ngày mai",
  you: "bạn",
  "I want": "tôi muốn",
  "I need": "tôi cần",
  "to know": "biết",
  "to know you": "biết bạn",
  soon: "sớm",
  "to see": "gặp",
  "to see you": "gặp bạn",
  tonight: "tối nay",
  "to tell": "nói",
  "to tell you": "nói với bạn",
  something: "điều gì đó",
  important: "quan trọng",
  "something important": "điều gì đó quan trọng",
  very: "rất",
  me: "tôi",
  "for me": "đối với tôi",
  impossible: "không thể",
  good: "tốt",
  possible: "có thể",
  if: "nếu",
  so: "vì vậy",
  "not important": "không quan trọng",
  It: "nó",
  "It is": "nó là",
  "I am": "tôi là",
  "I am important": "tôi quan trọng",
  "need to know": "cần biết",
  perfect: "hoàn hảo",
  "I am perfect": "tôi hoàn hảo",
  "have to know": "phải biết",
  healthy: "khỏe mạnh",
  "I am healthy": "tôi khỏe mạnh",
  Xingrong: "Xingrong",
  "I am Xingrong": "tôi là Xingrong",
  "I am here": "tôi ở đây",
  "I am eighteen": "tôi mười tám tuổi",
  "you are": "bạn là",
  "You are important": "bạn rất quan trọng",
  "You are perfect": "bạn hoàn hảo",
  "You are healthy": "bạn khỏe mạnh",
  "Jay Chou": "Châu Kiệt Luân",
  "want to know": "muốn biết",
  rich: "giàu có",
  "he is": "anh ấy là",
  "He is rich": "anh ấy giàu có",
  "she is": "cô ấy là",
  "She is rich": "cô ấy giàu có",
  "She is perfect": "cô ấy hoàn hảo",
  "it is": "nó là",
  "I am rich": "tôi giàu có",
  pretty: "xinh đẹp",
  "You are pretty": "bạn xinh đẹp",
  "He is pretty": "anh ấy đẹp trai",
  "She is pretty": "cô ấy xinh đẹp",
  "It is pretty": "nó đẹp",
  "I am pretty": "tôi xinh đẹp",
  "to talk": "nói chuyện",
  with: "với",
  "with me": "với tôi",
  "to help": "giúp",
  "to help me": "giúp tôi",
  "to believe": "tin",
  "to believe me": "tin tôi",
  "to tell me": "nói với tôi",
  "the truth": "sự thật",
  "to study": "học",
  because: "bởi vì",
  "you need": "bạn cần",
  he: "anh ấy",
  "he needs": "anh ấy cần",
  she: "cô ấy",
  "she needs": "cô ấy cần",
  "it needs": "nó cần",
  "to sleep": "ngủ",
  "Xingrong needs": "Xingrong cần",
  "you want": "bạn muốn",
  "he wants": "anh ấy muốn",
  "to explain": "giải thích",
  "the reason": "lý do",
  "she wants": "cô ấy muốn",
  why: "tại sao",
  "to ask": "hỏi",
  "to ask me": "hỏi tôi",
  "a question": "một câu hỏi",
  about: "về",
  "to fly": "bay",
  sky: "bầu trời",
  "in the sky": "trên bầu trời",
  "the bird": "con chim",
  "the bird wants": "con chim muốn",
  "Xingrong wants": "Xingrong muốn",
  but: "nhưng",
  "to read": "đọc",
  "at home": "ở nhà",
  "you like": "bạn thích",
  "he likes": "anh ấy thích",
  "to walk": "đi bộ",
  park: "công viên",
  "in the park": "trong công viên",
  "she likes": "cô ấy thích",
  bed: "giường",
  "on the bed": "trên giường",
  "Xingrong likes": "Xingrong thích",
  tired: "mệt",
  "he is tired": "anh ấy mệt",
  "to know it": "biết điều đó",
  "I don't need": "tôi không cần",
  "you don't need": "bạn không cần",
  urgent: "khẩn cấp",
  "it is urgent": "nó khẩn cấp",
  and: "và",
  "he doesn't need": "anh ấy không cần",
  "I don't want": "tôi không muốn",
  "you don't want": "bạn không muốn",
  "he doesn't want": "anh ấy không muốn",
  "I don't like": "tôi không thích",
  "you don't like": "bạn không thích",
  "he doesn't like": "anh ấy không thích",
  "it doesn't need": "nó không cần",
  "to rest": "nghỉ ngơi",
  "Xingrong doesn't need": "Xingrong không cần",
  "she doesn't want": "cô ấy không muốn",
  "it wants": "nó muốn",
  "it doesn't want": "nó không muốn",
  "she doesn't like": "cô ấy không thích",
  "it likes": "nó thích",
  "it doesn't like": "nó không thích",
  "it doesn't have": "nó không có",
  can: "có thể",
  "I can": "tôi có thể",
  alone: "một mình",
  "be here": "ở đây",
  "eat the food": "ăn món ăn này",
  "you can": "bạn có thể",
  "tell me": "nói với tôi",
  "help me": "giúp tôi",
  "read at home": "đọc ở nhà",
  "he can": "anh ấy có thể",
  later: "sau đó",
  "talk with me": "nói chuyện với tôi",
  "she can": "cô ấy có thể",
  "explain the reason": "giải thích lý do",
  "it can": "nó có thể",
  fly: "bay",
  "Xingrong can": "Xingrong có thể",
  walk: "đi bộ",
  should: "nên",
  "I should": "tôi nên",
  "talk with you": "nói chuyện với bạn",
  "believe you": "tin bạn",
  "you should": "bạn nên",
  read: "đọc",
  "he should": "anh ấy nên",
  "she should": "cô ấy nên",
  sleep: "ngủ",
  "it should": "nó nên",
  will: "sẽ",
  "I will": "tôi sẽ",
  "see you": "gặp bạn",
  "tell you": "nói với bạn",
  "the future": "tương lai",
  "in the future": "trong tương lai",
  week: "tuần",
  "next week": "tuần tới",
  "you will": "bạn sẽ",
  "he will": "anh ấy sẽ",
  "believe me": "tin tôi",
  "she will": "cô ấy sẽ",
  "a story": "một câu chuyện",
  "it will": "nó sẽ",
  not: "không",
  "very important": "rất quan trọng",
  we: "chúng tôi",
  "we like": "chúng tôi thích",
  "to dance": "nhảy",
  "the street": "đường phố",
  night: "ban đêm",
  "at night": "vào ban đêm",
  they: "họ",
  "with you": "với bạn",
  just: "chỉ",
  "the answer": "câu trả lời",
  "the question": "câu hỏi",
  "the restaurant": "nhà hàng",
  "to work": "làm việc",
  think: "nghĩ",
  "I think": "tôi nghĩ",
  "the questions": "các câu hỏi",
  "to answer": "trả lời",
  "to leave": "rời đi",
  "we can": "chúng tôi có thể",
  "we should": "chúng tôi nên",
  "should know": "nên biết",
  "we want": "chúng tôi muốn",
  "to stay": "ở lại",
  plan: "kế hoạch",
  "I plan": "tôi dự định",
  "you plan": "bạn dự định",
  "with him": "với anh ấy",
  "with us": "với chúng tôi",
  "he plans": "anh ấy dự định",
  "with them": "với họ",
  "she plans": "cô ấy dự định",
  "Xingrong plans": "Xingrong dự định",
  "the city": "thành phố",
  next: "tiếp theo",
  "the country": "đất nước",
  month: "tháng",
  "next month": "tháng tới",
  "we plan": "chúng tôi dự định",
  early: "sớm",
  "to pay": "trả",
  "the bill": "hóa đơn",
  "for you": "cho bạn",
  "for him": "cho anh ấy",
  "for her": "cho cô ấy",
  "for them": "cho họ",
  "to travel": "du lịch",
  "the world": "thế giới",
  year: "năm",
  "next year": "năm tới",
  "with her": "với cô ấy",
  "would like": "muốn",
  "for us": "cho chúng tôi",
  "to give": "đưa",
  "a reason": "một lý do",
  phone: "điện thoại",
  number: "số",
  "phone number": "số điện thoại",
  my: "của tôi",
  your: "của bạn",
  his: "của anh ấy",
  hope: "hy vọng",
  "I hope": "tôi hy vọng",
  her: "của cô ấy",
  hand: "tay",
  "a hand": "một tay",
};

(async function main() {
  ensureTargetDir();

  const cache = loadCache();
  const fileNames = getCourseFileNames();
  const sourceCourses = fileNames.map((fileName) => {
    const filePath = path.resolve(sourceDir, fileName);
    const statements = JSON.parse(fs.readFileSync(filePath, "utf8")) as SourceStatement[];

    return {
      fileName,
      filePath,
      statements,
    };
  });
  const targetCourses = fileNames.map((fileName) => {
    const filePath = path.resolve(targetDir, fileName);
    const statements = JSON.parse(fs.readFileSync(filePath, "utf8")) as TargetStatement[];

    return {
      fileName,
      filePath,
      statements,
    };
  });

  const phraseMeta = new Map<string, string>();
  for (const course of sourceCourses) {
    for (const statement of course.statements) {
      if (!phraseMeta.has(statement.chinese)) {
        phraseMeta.set(statement.chinese, statement.english);
      }
    }
  }

  for (const [chinese, english] of phraseMeta.entries()) {
    if (!cache[chinese] && overrides[english]) {
      cache[chinese] = overrides[english];
    }
  }

  const chinesePhrases = [...phraseMeta.keys()];
  const missingPhrases = chinesePhrases.filter((phrase) => !cache[phrase]);
  const phrasesToTranslate = limit > 0 ? missingPhrases.slice(0, limit) : missingPhrases;

  console.log(
    `Found ${chinesePhrases.length} unique Chinese phrases, ${missingPhrases.length} missing, translating ${phrasesToTranslate.length}.`,
  );

  await translateMissingPhrases(phrasesToTranslate, cache);
  persistCache(cache);

  for (const [index, course] of targetCourses.entries()) {
    const sourceStatements = sourceCourses[index]?.statements ?? [];
    const translatedStatements = course.statements.map((statement, statementIndex) => {
      const sourceStatement = sourceStatements[statementIndex];

      return {
        ...statement,
        vietnamese: sourceStatement
          ? formatTranslation(
              sourceStatement.english,
              cache[sourceStatement.chinese] ?? statement.vietnamese,
            )
          : statement.vietnamese,
      };
    });

    fs.writeFileSync(course.filePath, `${JSON.stringify(translatedStatements, null, 2)}\n`);
  }

  console.log(`Updated ${targetCourses.length} Vietnamese course files.`);
})();

function ensureTargetDir() {
  if (!fs.existsSync(targetDir)) {
    fs.cpSync(sourceDir, targetDir, { recursive: true });
  }
}

function getCourseFileNames() {
  return fs
    .readdirSync(targetDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));
}

function loadCache(): Record<string, string> {
  if (!fs.existsSync(cachePath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(cachePath, "utf8")) as Record<string, string>;
}

function persistCache(cache: Record<string, string>) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

async function translateMissingPhrases(phrases: string[], cache: Record<string, string>) {
  if (phrases.length === 0) {
    return;
  }

  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, phrases.length) }, async () => {
    while (index < phrases.length) {
      const currentIndex = index++;
      const phrase = phrases[currentIndex];
      const translatedPhrase = await translateWithRetry(phrase);

      cache[phrase] = translatedPhrase;

      if ((currentIndex + 1) % 25 === 0 || currentIndex === phrases.length - 1) {
        persistCache(cache);
      }

      console.log(`[${currentIndex + 1}/${phrases.length}] ${phrase} -> ${translatedPhrase}`);
    }
  });

  await Promise.all(workers);
}

async function translateWithRetry(text: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retryCount; attempt += 1) {
    try {
      return await translateText(text);
    } catch (error) {
      lastError = error;
      if (isRateLimitError(error)) {
        return await translateWithGoogle(text);
      }
      console.error(`Translate failed for "${text}" on attempt ${attempt}/${retryCount}.`);
      if (attempt < retryCount) {
        await sleep(retryDelayMs * attempt);
      }
    }
  }

  throw lastError;
}

async function translateText(text: string) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "zh-CN|vi");

  const response = await fetch(url, {
    headers: {
      "user-agent": "earthworm-xingrong-courses-translator",
    },
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    responseData?: {
      translatedText?: string;
    };
  };
  const translatedText = cleanupRawTranslation(payload.responseData?.translatedText ?? "");

  if (!translatedText) {
    throw new Error(`Empty translation received for "${text}"`);
  }

  return translatedText;
}

async function translateWithGoogle(text: string) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "zh-CN");
  url.searchParams.set("tl", "vi");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url, {
    headers: {
      "user-agent": "earthworm-xingrong-courses-translator",
    },
  });

  if (!response.ok) {
    throw new Error(`Google translation request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Array<Array<[string, string]>>;
  const translatedText = cleanupRawTranslation(payload[0]?.map((part) => part[0]).join("") ?? "");

  if (!translatedText) {
    throw new Error(`Empty Google translation received for "${text}"`);
  }

  return translatedText;
}

function formatTranslation(english: string, translatedText: string) {
  const overridden = overrides[english] ?? translatedText;
  const withoutInfinitiveMarker = english.startsWith("to ")
    ? overridden.replace(/^để\s+/i, "")
    : overridden;
  const trimmed = withoutInfinitiveMarker.trim();

  if (trimmed.length === 0) {
    return trimmed;
  }

  const shouldCapitalize =
    /^[A-Z]/.test(english) || english.startsWith("Xingrong") || english.startsWith("Jay ");
  return shouldCapitalize ? capitalizeFirstLetter(trimmed) : lowercaseFirstLetter(trimmed);
}

function cleanupRawTranslation(text: string) {
  return text
    .replace(/<x id="[^"]+"\/?>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\u00a0/g, " ")
    .replace(/^"+|"+$/g, "")
    .replace(/[，。,.]+$/g, "")
    .replace(/……+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isRateLimitError(error: unknown) {
  return error instanceof Error && error.message.includes("status 429");
}

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function lowercaseFirstLetter(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
