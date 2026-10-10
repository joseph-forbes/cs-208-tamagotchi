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
        const machines = [
            {
                id: "snake",
                image: "game-room-images/snake-machine.png",
                alt: "Snake game machine",
                label: "Play Snake",
                gameKey: "snakeGame"
            },
            {
                id: "flappy",
                image: "game-room-images/flappy-goobert-machine.png",
                alt: "Flappy Goobert machine",
                label: "Play Flappy Goobert",
                gameKey: "flappyGoobert"
            },
            {
                id: "frogoobert",
                image: "game-room-images/frogoobert-machine.png",
                alt: "Frogoobert machine coming soon",
                gameKey: null
            },
            {
                id: "pipelined",
                image: "game-room-images/pipelined-machine.png",
                alt: "Pipelined machine coming soon",
                gameKey: null
            },
            {
                id: "feast-fest",
                image: "game-room-images/feast-fest-machine.png",
                alt: "Feast Fest machine coming soon",
                gameKey: null
            }
        ];

        return (
            <main className="game-room">
                {/* Top-left return control back to the hub room. */}
                <div className="game-room-controls">
                    <button type="button" className="btn game-room-exit" onClick={() => this.navigateToRoom("hub")}>
                        <img className="game-room-exit-icon" src="assets/pixelarticons/arrow-left.svg" alt="" aria-hidden="true"/>
                        <span>Back to hub</span>
                    </button>
                </div>

                {/* Center room logo overlay. */}
                <div className="game-room-logo-wrap">
                    <img src="game-room-images/game-room-logo.png" alt="Game Room" className="game-room-logo" />
                </div>

                {/* Arcade machine row: active machines navigate, inactive machines render as placeholders. */}
                <div className="game-room-machines">
                    {machines.map((machine) => (
                        machine.gameKey ? (
                            <button
                                key={machine.id}
                                type="button"
                                className="machine-button"
                                onClick={() => this.navigateToMachine(machine.gameKey)}
                                onMouseEnter={() => this.handleMachineHover()}
                                onFocus={() => this.handleMachineHover()}
                                aria-label={machine.label}>
                                <img src={machine.image} alt={machine.alt} />
                            </button>
                        ) : (
                            <span key={machine.id} className="machine-button machine-disabled" aria-hidden="true">
                                <img src={machine.image} alt={machine.alt} />
                            </span>
                        )
                    ))}
                </div>

                {/* Shared React settings panel (audio controls, no Bootstrap modal). */}
                <SettingsPanel
                    buttonClassName="game-room-settings-button"
                    panelClassName="game-room-settings-panel"
                />
            </main>
        );
    }
}