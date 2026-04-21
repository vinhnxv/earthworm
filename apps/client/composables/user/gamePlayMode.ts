import { useI18n } from "#imports";
import { ref } from "vue";

export enum GamePlayMode {
  Dictation = "DICTATION",
  VietnameseToEnglish = "VIETNAMESE_TO_ENGLISH",
}

const gamePlayModeLabelKeys: { [key in GamePlayMode]: string } = {
  [GamePlayMode.VietnameseToEnglish]: "settings.gameMode.vietnameseToEnglish",
  [GamePlayMode.Dictation]: "settings.gameMode.dictation",
};

const GamePlayModeKey = "gamePlayMode";
const currentGamePlayMode = ref<GamePlayMode>(GamePlayMode.VietnameseToEnglish);

function loadCache() {
  const mode = normalizeMode(getStore()) || currentGamePlayMode.value;
  currentGamePlayMode.value = mode;
}

function getStore() {
  return localStorage.getItem(GamePlayModeKey) as GamePlayMode;
}

function setStore(value: GamePlayMode) {
  localStorage.setItem(GamePlayModeKey, value);
}

function normalizeMode(mode: string | null) {
  if (mode === "CHINESE_TO_ENGLISH") {
    return GamePlayMode.VietnameseToEnglish;
  }

  return mode as GamePlayMode | null;
}

loadCache();

export function useGamePlayMode() {
  function getGamePlayModeOptions() {
    const { t } = useI18n();

    return Object.entries(gamePlayModeLabelKeys).map(([key, value]) => {
      return {
        label: t(value),
        value: key,
      };
    });
  }

  function toggleGamePlayMode(mode: GamePlayMode) {
    currentGamePlayMode.value = mode;
    setStore(mode);
  }

  function isDictationMode() {
    return currentGamePlayMode.value === GamePlayMode.Dictation;
  }

  function isVietnameseToEnglishMode() {
    return currentGamePlayMode.value === GamePlayMode.VietnameseToEnglish;
  }

  return {
    toggleGamePlayMode,
    getGamePlayModeOptions,
    currentGamePlayMode,
    isDictationMode,
    isVietnameseToEnglishMode,
  };
}
