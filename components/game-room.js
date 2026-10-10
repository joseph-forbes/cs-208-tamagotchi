"use strict";

/* React room component for game selection, room navigation, and settings access. */
class GameRoom extends React.Component {
  /* Centralized navigation so room changes stay consistent. */
  navigateToRoom(target) {
    if (window.GoobiesAudio) {
      window.GoobiesAudio.playClick();
    }
    load(target);
  }
  navigateToMachine(target) {
    if (window.GoobiesAudio) {
      window.GoobiesAudio.playArcadeSelect();
    }
    load(target);
  }
  handleMachineHover() {
    if (window.GoobiesAudio) {
      window.GoobiesAudio.playArcadeHover();
    }
  }
  render() {
    /* Game machine config keeps enabled/disabled machine behavior simple to extend. */
    const machines = [{
      id: "snake",
      image: "game-room-images/snake-machine.png",
      alt: "Snake game machine",
      label: "Play Snake",
      gameKey: "snakeGame"
    }, {
      id: "flappy",
      image: "game-room-images/flappy-goobert-machine.png",
      alt: "Flappy Goobert machine",
      label: "Play Flappy Goobert",
      gameKey: "flappyGoobert"
    }, {
      id: "frogoobert",
      image: "game-room-images/frogoobert-machine.png",
      alt: "Frogoobert machine coming soon",
      gameKey: null
    }, {
      id: "pipelined",
      image: "game-room-images/pipelined-machine.png",
      alt: "Pipelined machine coming soon",
      gameKey: null
    }, {
      id: "feast-fest",
      image: "game-room-images/feast-fest-machine.png",
      alt: "Feast Fest machine coming soon",
      gameKey: null
    }];
    return /*#__PURE__*/React.createElement("main", {
      className: "game-room"
    }, /*#__PURE__*/React.createElement("div", {
      className: "game-room-controls"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn game-room-exit",
      onClick: () => this.navigateToRoom("hub")
    }, /*#__PURE__*/React.createElement("img", {
      className: "game-room-exit-icon",
      src: "assets/pixelarticons/arrow-left.svg",
      alt: "",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", null, "Back to hub"))), /*#__PURE__*/React.createElement("div", {
      className: "game-room-logo-wrap"
    }, /*#__PURE__*/React.createElement("img", {
      src: "game-room-images/game-room-logo.png",
      alt: "Game Room",
      className: "game-room-logo"
    })), /*#__PURE__*/React.createElement("div", {
      className: "game-room-machines"
    }, machines.map(machine => machine.gameKey ? /*#__PURE__*/React.createElement("button", {
      key: machine.id,
      type: "button",
      className: "machine-button",
      onClick: () => this.navigateToMachine(machine.gameKey),
      onMouseEnter: () => this.handleMachineHover(),
      onFocus: () => this.handleMachineHover(),
      "aria-label": machine.label
    }, /*#__PURE__*/React.createElement("img", {
      src: machine.image,
      alt: machine.alt
    })) : /*#__PURE__*/React.createElement("span", {
      key: machine.id,
      className: "machine-button machine-disabled",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("img", {
      src: machine.image,
      alt: machine.alt
    })))), /*#__PURE__*/React.createElement(SettingsPanel, {
      buttonClassName: "game-room-settings-button",
      panelClassName: "game-room-settings-panel"
    }));
  }
}
