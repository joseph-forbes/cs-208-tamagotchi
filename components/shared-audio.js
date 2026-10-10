"use strict";

/* Shared audio module for all React rooms/pages. */
/*
 * - Keeps one music player alive across room changes
 * - Saves user volume/mute preferences
 * - Exposes simple helper functions through window.GoobiesAudio
 */

/* a window is used to store the shared audio manager instance */
function initializeGoobiesAudio() {
  if (window.GoobiesAudio) {
    return window.GoobiesAudio;
  }

  /* Names used to save each setting in localStorage. */
  const savedAudioSettingNames = {
    musicVolume: "goobies.musicVolume",
    sfxVolume: "goobies.sfxVolume",
    musicMuted: "goobies.musicMuted",
    sfxMuted: "goobies.sfxMuted"
  };

  /* Reads a 0-100 percent value from localStorage. */
  function readSavedPercent(settingName, fallback) {
    const parsed = parseInt(localStorage.getItem(settingName), 10);
    // If parsing fails, use the fallback value.
    if (Number.isFinite(parsed)) {
      return Math.min(Math.max(parsed, 0), 100);
    } else {
      return fallback;
    }
  }

  /* Reads a true/false toggle from localStorage. */
  function readSavedToggle(settingName, fallback) {
    const value = localStorage.getItem(settingName);
    if (value === null) {
      return fallback;
    } else {
      return value === "true";
    }
  }

  /* In-memory audio settings used by all controls. */
  const audioSettings = {
    musicVolume: readSavedPercent(savedAudioSettingNames.musicVolume, 100),
    sfxVolume: readSavedPercent(savedAudioSettingNames.sfxVolume, 100),
    musicMuted: readSavedToggle(savedAudioSettingNames.musicMuted, false),
    sfxMuted: readSavedToggle(savedAudioSettingNames.sfxMuted, false)
  };
  const backgroundMusic = new Audio("shared-music/slow-goobies-theme.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.preload = "auto";
  const buttonClickSound = new Audio("index-audio/button-click.wav");
  buttonClickSound.preload = "auto";
  const buttonHoverSound = new Audio("index-audio/button-hover.wav");
  buttonHoverSound.preload = "auto";

  /* Applies current settings to audio elements. */
  function applyAudioLevels() {
    backgroundMusic.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume / 100;
    buttonClickSound.volume = audioSettings.sfxMuted ? 0 : audioSettings.sfxVolume / 100;
    buttonHoverSound.volume = audioSettings.sfxMuted ? 0 : audioSettings.sfxVolume / 100;
  }

  /* Saves current settings so they persist between page loads. */
  function saveAudioSettings() {
    localStorage.setItem(savedAudioSettingNames.musicVolume, String(audioSettings.musicVolume));
    localStorage.setItem(savedAudioSettingNames.sfxVolume, String(audioSettings.sfxVolume));
    localStorage.setItem(savedAudioSettingNames.musicMuted, String(audioSettings.musicMuted));
    localStorage.setItem(savedAudioSettingNames.sfxMuted, String(audioSettings.sfxMuted));
  }

  /* Attempts to start background music (may be blocked until user interaction). */
  function tryStartBackgroundMusic() {
    if (!backgroundMusic.paused) {
      return;
    }
    // typeof checks if a method exists before calling catch to avoid errors.
    const playAttempt = backgroundMusic.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  }

  /* Retries music playback once user interacts (browser autoplay policy fallback). */
  function setupAutoplayRetryOnInteraction() {
    const tryResume = function () {
      tryStartBackgroundMusic();
      document.removeEventListener("pointerdown", tryResume);
      document.removeEventListener("keydown", tryResume);
      document.removeEventListener("touchstart", tryResume);
    };
    document.addEventListener("pointerdown", tryResume, {
      once: true
    });
    document.addEventListener("keydown", tryResume, {
      once: true
    });
    document.addEventListener("touchstart", tryResume, {
      once: true
    });
  }
  applyAudioLevels();
  saveAudioSettings();
  setupAutoplayRetryOnInteraction();
  window.GoobiesAudio = {
    getState() {
      return {
        ...audioSettings
      };
    },
    ensureStarted() {
      tryStartBackgroundMusic();
    },
    setMusicVolume(value) {
      audioSettings.musicVolume = Math.min(Math.max(parseInt(value, 10) || 0, 0), 100);
      audioSettings.musicMuted = false;
      applyAudioLevels();
      saveAudioSettings();
      tryStartBackgroundMusic();
      return this.getState();
    },
    setSfxVolume(value) {
      audioSettings.sfxVolume = Math.min(Math.max(parseInt(value, 10) || 0, 0), 100);
      audioSettings.sfxMuted = false;
      applyAudioLevels();
      saveAudioSettings();
      return this.getState();
    },
    toggleMusicMute() {
      audioSettings.musicMuted = !audioSettings.musicMuted;
      applyAudioLevels();
      saveAudioSettings();
      if (!audioSettings.musicMuted) {
        tryStartBackgroundMusic();
      }
      return this.getState();
    },
    toggleSfxMute() {
      audioSettings.sfxMuted = !audioSettings.sfxMuted;
      applyAudioLevels();
      saveAudioSettings();
      return this.getState();
    },
    playClick() {
      if (audioSettings.sfxMuted || audioSettings.sfxVolume <= 0) return;
      buttonClickSound.currentTime = 0;
      buttonClickSound.play().catch(() => {});
    },
    playHover() {
      if (audioSettings.sfxMuted || audioSettings.sfxVolume <= 0) return;
      buttonHoverSound.currentTime = 0;
      buttonHoverSound.play().catch(() => {});
    },
    playArcadeHover() {
      /* Intentionally left silent for now. */
    },
    playArcadeSelect() {
      /* Intentionally left silent for now. */
    }
  };
  return window.GoobiesAudio;
}

/* React helper that keeps audio manager aligned with React-controlled room transitions. */
class SharedAudioManager extends React.Component {
  componentDidMount() {
    const audioManager = initializeGoobiesAudio();
    if (audioManager) {
      audioManager.ensureStarted();
    }
  }
  render() {
    return null;
  }
}

// Initialize shared audio when the script loads.
initializeGoobiesAudio();
