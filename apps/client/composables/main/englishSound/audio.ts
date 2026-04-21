import { usePronunciation } from "~/composables/user/pronunciation";

// 便于测试
// 后面不使用 audio 后也可以不破坏业务逻辑
const audio = new Audio();

// Youdao's British voice (type=1) sporadically 500s on longer inputs while the
// American voice (type=2) still serves audio. If the element fails to load the
// current source, swap type=1 -> type=2 once and retry so playback still works.
const triedFallbackFor = new Set<string>();
audio.addEventListener("error", () => {
  const failedSrc = audio.src;
  if (!failedSrc || triedFallbackFor.has(failedSrc)) return;
  triedFallbackFor.add(failedSrc);
  if (failedSrc.includes("type=1")) {
    const fallback = failedSrc.replace("type=1", "type=2");
    audio.src = fallback;
    audio.load();
  }
});

export function updateSource(src: string) {
  if (!src || src.endsWith("=undefined") || src.endsWith("=")) return;
  audio.src = src;
  audio.load();
}

// Browsers block HTMLAudioElement.play() until the user has interacted with
// the document. Detect the first gesture and replay any auto-play that was
// blocked before then.
let userHasGestured = false;
let pendingAutoPlay: (() => void) | null = null;

if (typeof document !== "undefined") {
  const markGesture = () => {
    userHasGestured = true;
    document.removeEventListener("pointerdown", markGesture, true);
    document.removeEventListener("keydown", markGesture, true);
    document.removeEventListener("touchstart", markGesture, true);
    if (pendingAutoPlay) {
      const fn = pendingAutoPlay;
      pendingAutoPlay = null;
      fn();
    }
  };
  document.addEventListener("pointerdown", markGesture, true);
  document.addEventListener("keydown", markGesture, true);
  document.addEventListener("touchstart", markGesture, true);
}

function safePlay(el: HTMLAudioElement, onBlocked?: () => void) {
  const p = el.play();
  if (p && typeof p.catch === "function") {
    p.catch((err: DOMException) => {
      if (err.name === "NotAllowedError" && !userHasGestured && onBlocked) {
        pendingAutoPlay = onBlocked;
        return;
      }
      if (
        err.name === "NotAllowedError" ||
        err.name === "NotSupportedError" ||
        err.name === "AbortError"
      ) {
        return;
      }
      console.warn("[audio] play failed", { name: err.name, src: el.src, err });
    });
  }
}

const { getPronunciationUrl } = usePronunciation();
export function usePlayWordSound() {
  const wordAudio = new Audio();
  let lastWord = "";
  let isPlaying = false;

  wordAudio.onplay = () => {
    isPlaying = true;
  };

  wordAudio.onended = () => {
    isPlaying = false;
  };

  wordAudio.addEventListener("error", () => {
    const failedSrc = wordAudio.src;
    if (failedSrc && failedSrc.includes("type=1")) {
      wordAudio.src = failedSrc.replace("type=1", "type=2");
      wordAudio.load();
      safePlay(wordAudio);
    }
  });

  function handlePlayWordSound(word: string) {
    if (isPlaying && lastWord === word) {
      // skip
      return;
    }
    lastWord = word;
    wordAudio.src = getPronunciationUrl(word);
    safePlay(wordAudio);
  }

  return {
    handlePlayWordSound,
  };
}

export interface PlayOptions {
  times?: number;
  rate?: number;
  interval?: number;
}

const DefaultPlayOptions = {
  times: 1,
  rate: 1,
  interval: 500,
};

export function play(playOptions?: PlayOptions) {
  const { times, rate, interval } = Object.assign({}, DefaultPlayOptions, playOptions);

  audio.playbackRate = rate;
  safePlay(audio, () => play(playOptions));
  if (times > 1) {
    audio.addEventListener("ended", handleEnded, false);
  }

  let index = 1;
  let timeoutId: NodeJS.Timeout;
  function handleEnded() {
    timeoutId = setTimeout(() => {
      if (index < times) {
        safePlay(audio);
        index++;
      } else {
        index = 1;
        audio.removeEventListener("ended", handleEnded);
      }
    }, interval);
  }

  return () => {
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener("ended", handleEnded);
    timeoutId && clearTimeout(timeoutId);
  };
}
