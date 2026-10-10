"use strict";

class FlappyGoobert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPlayAgain: false
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
      this.loadScript("games/flappy-goobert.js", "flappy-goobert-script", () => {
        window.onFlappyGameOver = () => {
          this.setState({
            showPlayAgain: true
          });
        };
        if (typeof initFlappyGoobert === "function") {
          initFlappyGoobert();
        }
      });
    });
  }
  componentWillUnmount() {
    window.onFlappyGameOver = null;
    if (typeof stopGame === "function") {
      stopGame();
    }
  }
  playAgain() {
    this.setState({
      showPlayAgain: false
    }, () => {
      if (typeof initFlappyGoobert === "function") {
        initFlappyGoobert();
      }
    });
  }
  handleTouch(event) {
    // Don't jump when touching a button or settings panel
    if (event.target.closest("button, .game-room-settings-panel")) {
      return;
    }
    event.preventDefault;
    if (typeof jump === "function") {
      jump();
    }
  }
  render() {
    return /*#__PURE__*/React.createElement("main", {
      className: "flappy-screen",
      onTouchStart: event => this.handleTouch(event)
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn game-return-btn",
      onClick: () => load("gameRoom")
    }, "Back to Game Room"), /*#__PURE__*/React.createElement("div", {
      id: "main",
      className: "flappy-board"
    }, /*#__PURE__*/React.createElement("div", {
      id: "keys",
      className: "d-block d-md-none vw-100"
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-up text-white bg-warning p-1 rounded-pill key keyup vw-100",
      onClick: () => jump()
    }))), /*#__PURE__*/React.createElement("div", {
      id: "flappy-score",
      className: "flappy-score"
    }, "Score: 0"), this.state.showPlayAgain && /*#__PURE__*/React.createElement("div", {
      className: "game-over-panel"
    }, /*#__PURE__*/React.createElement("h3", null, "Game Over"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-warning",
      onClick: () => this.playAgain()
    }, "Play Again")), /*#__PURE__*/React.createElement(SettingsPanel, {
      buttonClassName: "game-room-settings-button",
      panelClassName: "game-room-settings-panel"
    }));
  }
}
