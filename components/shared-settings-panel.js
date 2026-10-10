"use strict";

/* Shared settings panel used by React rooms (game room now, hub/others later). */
class SettingsPanel extends React.Component {
  /* Initialize panel state and audio defaults in case audio manager isn't ready yet. */
  constructor(props) {
    super(props);
    this.state = {
      // Default state for the settings panel (closed initially)
      open: false,
      // Default audio state if audio manager isn't ready yet
      audioState: window.GoobiesAudio ? window.GoobiesAudio.getState() : {
        musicVolume: 100,
        sfxVolume: 100,
        musicMuted: false,
        sfxMuted: false
      }
    };
  }

  /* Helper function to check if the audio manager is available. */
  hasAudioManager() {
    if (window.GoobiesAudio) {
      return true;
    } else {
      return false;
    }
  }

  /* UI sound effect used on hover/focus for keyboard + mouse support. */
  playHoverSound() {
    if (this.hasAudioManager()) {
      window.GoobiesAudio.playHover();
    }
  }

  /* Button labels reflect mute state */
  getMusicButtonText() {
    if (this.state.audioState.musicMuted) {
      return "Unmute Music";
    } else {
      return "Mute Music";
    }
  }

  /* Button labels reflect SFX mute state */
  getSfxButtonText() {
    if (this.state.audioState.sfxMuted) {
      return "Unmute Sound Effects";
    } else {
      return "Mute Sound Effects";
    }
  }

  /* Sync local component state from the shared audio manager to reflect any changes. */
  refreshAudioState() {
    if (this.hasAudioManager()) {
      this.setState({
        audioState: window.GoobiesAudio.getState()
      });
    }
  }

  /* Open/close panel and ensure music starts after user interaction. */
  togglePanel() {
    if (this.hasAudioManager()) {
      window.GoobiesAudio.ensureStarted();
      window.GoobiesAudio.playClick();
    }
    /* this ensures the panel state is toggled after handling audio interactions */
    this.setState(previous => ({
      open: !previous.open
    }), () => this.refreshAudioState());
  }

  /* Volume + mute controls write to shared audio manager and refresh panel values. */
  setMusicVolume(event) {
    if (this.hasAudioManager()) {
      window.GoobiesAudio.setMusicVolume(event.target.value);
      this.refreshAudioState();
    }
  }

  /* Volume + mute controls for music and SFX */
  setSfxVolume(event) {
    if (this.hasAudioManager()) {
      window.GoobiesAudio.setSfxVolume(event.target.value);
      this.refreshAudioState();
    }
  }

  /* Toggle music mute state */
  toggleMusicMute() {
    if (this.hasAudioManager()) {
      window.GoobiesAudio.toggleMusicMute();
      this.refreshAudioState();
    }
  }

  /* Toggle SFX mute state */
  toggleSfxMute() {
    if (this.hasAudioManager()) {
      window.GoobiesAudio.toggleSfxMute();
      this.refreshAudioState();
    }
  }

  // Render the settings panel component
  render() {
    const state = this.state.audioState;
    const buttonClass = this.props.buttonClassName || "settings-fab";
    const panelClass = this.props.panelClassName || "settings-panel";
    let settingsPanel = null;

    /* conditional rendering */
    if (this.state.open) {
      settingsPanel = /*#__PURE__*/React.createElement("section", {
        className: panelClass
      }, /*#__PURE__*/React.createElement("div", {
        className: "settings-panel-header"
      }, /*#__PURE__*/React.createElement("h5", null, "Settings"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn-close",
        onClick: () => this.togglePanel(),
        "aria-label": "Close settings"
      })), /*#__PURE__*/React.createElement("div", {
        className: "settings-panel-body"
      }, /*#__PURE__*/React.createElement("label", {
        className: "form-label"
      }, "Music Volume: ", /*#__PURE__*/React.createElement("span", null, state.musicVolume, "%")), /*#__PURE__*/React.createElement("input", {
        type: "range",
        className: "form-range",
        min: "0",
        max: "100",
        value: state.musicVolume,
        onChange: event => this.setMusicVolume(event)
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-dark settings-toggle-btn",
        onClick: () => this.toggleMusicMute()
      }, this.getMusicButtonText()), /*#__PURE__*/React.createElement("label", {
        className: "form-label mt-3"
      }, "Sound Effects Volume: ", /*#__PURE__*/React.createElement("span", null, state.sfxVolume, "%")), /*#__PURE__*/React.createElement("input", {
        type: "range",
        className: "form-range",
        min: "0",
        max: "100",
        value: state.sfxVolume,
        onChange: event => this.setSfxVolume(event)
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-dark settings-toggle-btn",
        onClick: () => this.toggleSfxMute()
      }, this.getSfxButtonText())));
    }

    // Render the button that toggles the settings panel and the panel itself
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: buttonClass,
      onClick: () => this.togglePanel(),
      onMouseEnter: () => this.playHoverSound(),
      onFocus: () => this.playHoverSound(),
      "aria-label": "Open settings"
    }, /*#__PURE__*/React.createElement("img", {
      src: "assets/pixelarticons/settings.svg",
      alt: "",
      "aria-hidden": "true"
    })), settingsPanel);
  }
}
