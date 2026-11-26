"use strict";
import "../styles/index.css";
import React, { useEffect, useState } from "react";
import { indexClickSound, indexHoverSound } from "./audio";
import Credits from "./credits";
import { load, rooms } from "../App";
import useGooberts from "../GoobertContext";
import { getUserByPid } from "../saveLoadGoobert";
import useServer from "../ServerContext";

/*
 * Gooberts Main Menu
 * React switches between Menu and Credits without reloading.
 * All audio is handled by components/audio.js using Howler.js.
 */

export default function MainMenu(): React.JSX.Element {
    let [screen, setScreen] = useState("menu");
    let { doorRefs, loadSlot, newGame } = useGooberts();
    let { pid } = useServer();
    const [initialized, setInitialized] = useState("");

    // let showCredits = this.showCredits.bind(this); - commented out because idk what these do
    // let showMenu = this.showMenu.bind(this);

    // Open the Credits screen.
    let showCredits = () => {
        indexClickSound.play();
        setScreen("credits");
    }

    // Return to the Main Menu.
    function showMenu() {
        indexClickSound.play();
        setScreen("menu");
    }
    let { gooberts } = useGooberts();

    useEffect(() => {
        (getUserByPid(pid).then((data) => {
            const initialized = data?.initialized;
            if(initialized)
                setInitialized(initialized);
        }));
    }, [pid]);
    return (
        <>
        {/* Can't click on the main menu when a confirmation screen is up */}
        <main className={`${screen.includes("confirm") ? "no-select" : ""} main-menu`}>
            {screen.includes("menu") ? (
                <>
                    {/* Animated Gooberts logo */}
                    <div className="row">
                        <div className="col text-center">
                            <img
                                src="images/index/Gooberts_Logo_text.gif"
                                alt="Gooberts"
                                id="game-title"
                                className="img-fluid"
                            />
                        </div>
                    </div>

                    {/* Save system will be connected later. */}
                    <div className="row justify-content-center my-3">
                        <div className="col-10 col-md-6 col-lg-3" ref={doorRefs.menuHub}>
                            <button 
                                className={
                                    `btn btn-continue menu-button w-100
                                    ${!initialized || parseInt(initialized) == 0 ? "no-select" : ""}
                                `}
                                id="continue"
                                onMouseEnter={() => indexHoverSound.play()}
                                onClick={() => {
                                    indexClickSound.play();
                                    setScreen("menu-load")
                                }}
                            >
                                Continue Game
                                {gooberts.filter((goobert) => goobert.room == rooms.menu).length > 0 && 
                                    <div className="hint"><br />Drag gooberts here to bring them back to the game!</div>
                                }
                            </button>
                                
                        </div>
                    </div>

                    {/* New Game opens the Hub. */}
                    <div className="row justify-content-center my-3">
                        <div className="col-10 col-md-6 col-lg-3">
                            <button 
                                className="btn btn-new-game menu-button w-100"
                                onMouseEnter={() => indexHoverSound.play()}
                                onClick={() => {
                                    indexClickSound.play();
                                    
                                    setScreen("menu-load-new");
                                }}
                            >
                                New Game
                            </button>
                        </div>
                    </div>

                    {/* Credits screen */}
                    <button
                        type="button"
                        className="btn btn-credits menu-button btn-lg position-fixed bottom-0 start-0 m-5"
                        onMouseEnter={() => indexHoverSound.play()}
                        onClick={showCredits}
                    >
                        Credits
                    </button>

                    {/* Game save state selectors */}
                    {screen.includes("load") &&
                        <div id="save-selector">
                            <div id="close-selector" onClick={() => setScreen("menu")}>x</div>
                            <div className={
                                `selector-option 
                                ${screen.includes("new") || initialized.charAt(0) != "0" ? "" : "no-select"}`
                            } 
                            onClick={() => {
                                if(screen.includes("new")) {
                                    console.log(initialized);
                                    // New game selector
                                    if(initialized.charAt(0) == "1") {
                                        console.log("initialized");
                                        setScreen("menu-load-new-confirm-1");
                                    } else {
                                        newGame(1);
                                        load(rooms.hub);
                                    }
                                } else {
                                    // Continue game selector
                                    loadSlot(1);
                                    load(rooms.hub);
                                }
                            }}>
                                Save Slot 1
                            </div>
                            <div className={`
                                selector-option 
                                ${screen.includes("new") || initialized.charAt(1) != "0" ? "" : "no-select"}`
                            } 
                            onClick={() => {
                                if(screen.includes("new")) {
                                    // New game selector
                                    if(initialized.charAt(1) == "1") {
                                        setScreen("menu-load-new-confirm-2");
                                    } else {
                                        newGame(2);
                                        load(rooms.hub);
                                    }
                                } else {
                                    // Continue game selector
                                    loadSlot(2);
                                    load(rooms.hub);
                                }
                            }}>
                                Save Slot 2
                            </div>
                            <div className={`
                                selector-option 
                                ${screen.includes("new") || initialized.charAt(2) != "0" ? "" : "no-select"}`
                            } 
                            onClick={() => {
                                if(screen.includes("new")) {
                                    // New game selector
                                    if(initialized.charAt(2) == "1") {
                                        setScreen("menu-load-new-confirm-3");
                                    } else {
                                        newGame(3);
                                        load(rooms.hub);
                                    }
                                } else {
                                    // Continue game selector
                                    loadSlot(3);
                                    load(rooms.hub);
                                }
                            }}>
                                Save Slot 3
                            </div>
                        </div>
                    }
                </>
            ) : (
                <Credits
                onBack={showMenu}
                onHover={() => indexHoverSound.play()}
                />
            )}
        </main>
        {screen.includes("new-confirm") &&
            <div id="selector-confirm">
                Are you sure?
                <br />
                <button className="button confirm yes" onClick={
                    () => {
                        newGame(parseInt(screen.slice(-1)));
                        load(rooms.hub)
                    }
                }>Yes</button>
                <button className="button confirm no" onClick={() => setScreen("menu-load-new")}>No</button>
            </div>
        }
        </>
    );
}