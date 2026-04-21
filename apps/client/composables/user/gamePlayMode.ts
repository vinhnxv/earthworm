import { useI18n } from "#imports";
import { ref } from "vue";

export enum GamePlayMode {
  Dictation = "DICTATION",
  ChineseToEnglish = "CHINESE_TO_ENGLISH",
}

const gamePlayModeLabelKeys: { [key in GamePlayMode]: string } = {
  [GamePlayMode.ChineseToEnglish]: "settings.gameMode.chineseToEnglish",
  [GamePlayMode.Dictation]: "settings.gameMode.dictation",
};

const GamePlayModeKey = "gamePlayMode";
const currentGamePlayMode = ref<GamePlayMode>(GamePlayMode.ChineseToEnglish);

function loadCache() {
  const mode = getStore() || currentGamePlayMode.value;
  currentGamePlayMode.value = mode;
}

function getStore() {
  return localStorage.getItem(GamePlayModeKey) as GamePlayMode;
}

function setStore(value: GamePlayMode) {
  localStorage.setItem(GamePlayModeKey, value);
}

loadCache();

export function useGamePlayMode() {
  const { t } = useI18n();

  function getGamePlayModeOptions() {
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

  function isChineseToEnglishMode() {
    return currentGamePlayMode.value === GamePlayMode.ChineseToEnglish;
  }

  return {
    toggleGamePlayMode,
    getGamePlayModeOptions,
    currentGamePlayMode,
    isDictationMode,
    isChineseToEnglishMode,
  };
}
