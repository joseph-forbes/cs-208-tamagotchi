"use strict";

class SnakeGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptsReady: false,
      selectedDifficulty: null
    };
  }
  loadScript(src, id, onReady) {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        onReady();
        return;
      }
      existing.addEventListener("load", onReady, {
        once: true
      });
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      onReady();
    };
    document.body.appendChild(script);
  }
  componentDidMount() {
    this.loadScript("games/games-global.js", "games-global-script", () => {
      this.loadScript("games/snake-game.js", "snake-game-script", () => {
        this.setState({
          scriptsReady: true
        });
      });
    });
  }
  componentWillUnmount() {
    if (typeof stopGame === "function") {
      stopGame();
    }
  }
  startSnake(width, height, difficulty) {
    if (!this.state.scriptsReady || typeof initSnakeGame !== "function") {
      return;
    }
    this.setState({
      selectedDifficulty: difficulty
    }, () => {
      initSnakeGame(width, height);
    });
  }
  render() {
    const showDifficultyPicker = this.state.selectedDifficulty === null;
    return /*#__PURE__*/React.createElement("main", {
      className: "snake-screen"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn game-return-btn",
      onClick: () => load("gameRoom")
    }, "Back to Game Room"), showDifficultyPicker && /*#__PURE__*/React.createElement("div", {
      className: "snake-difficulty-menu"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "snake-difficulty-title"
    }, "Select Snake Difficulty"), /*#__PURE__*/React.createElement("div", {
      className: "snake-difficulty-buttons"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-success",
      onClick: () => this.startSnake(25, 25, "Easy"),
      disabled: !this.state.scriptsReady
    }, "Easy"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-warning",
      onClick: () => this.startSnake(17, 17, "Medium"),
      disabled: !this.state.scriptsReady
    }, "Medium"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-danger",
      onClick: () => this.startSnake(10, 10, "Hard"),
      disabled: !this.state.scriptsReady
    }, "Hard"))), /*#__PURE__*/React.createElement("div", {
      id: "main",
      className: "snake-board"
    }), /*#__PURE__*/React.createElement("div", {
      id: "keys",
      className: "d-block d-md-none"
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-up text-white bg-warning p-1 rounded-pill key keyup",
      onClick: () => setSnakeVelocity("up"),
      onTouchStart: event => {
        event.preventDefault();
        setSnakeVelocity("up");
      }
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-left text-white bg-warning p-1 rounded-pill key keyleft",
      onClick: () => setSnakeVelocity("left"),
      onTouchStart: event => {
        event.preventDefault();
        setSnakeVelocity("left");
      }
    }), /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-down text-white bg-warning p-1 rounded-pill key keydown",
      onClick: () => setSnakeVelocity("down"),
      onTouchStart: event => {
        event.preventDefault();
        setSnakeVelocity("down");
      }
    }), /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-right text-white bg-warning p-1 rounded-pill key keyright",
      onClick: () => setSnakeVelocity("right"),
      onTouchStart: event => {
        event.preventDefault();
        setSnakeVelocity("right");
      }
    })), /*#__PURE__*/React.createElement(SettingsPanel, {
      buttonClassName: "game-room-settings-button",
      panelClassName: "game-room-settings-panel"
    }));
  }
}
