import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type RefObject } from "react";
import type { Corpse, Goobert } from "./Goobert";
import { rooms } from "./App";
import { MutantType } from "./Mutant";
import { deleteGoobert, deleteGraveyard, getState, getUserByPid, saveAccessories, saveGoobertToDatabase, updateGoobert, updateGoobertProperty, updateUser } from "./saveLoadGoobert";
import { goobertDeathRattle } from "./components/audio";
import useServer from "./ServerContext";
import { globalTick } from "./globalTick";

export type GoobertAppearance = {
    bodyType: number;
    bodyColor: number;
    legType: number;
    legColor: number;
    eyeType: number;
    mouthType: number;
}
export type GoobertStats = {
    fullness: number;
    entertainment: number;
    awakeness: number;
    cleanliness: number;
};

export type GoobertAccessories = {
    hatType: number;
    hatStyle: number;
    maskType: number;
    maskStyle: number;
    extraType: number;
    extraStyle: number;
};

// How many of each type of asset exist
const MAX_EYE_TYPES = 10;
const MAX_BODY_TYPES = 7;
const MAX_LEG_TYPES = 7;
const MAX_MOUTH_TYPES = 11;
const MAX_COLORS = 7;

interface GoobertContextType {
    gooberts: Goobert[];
    deadGooberts: Corpse[];
    cureGoobert: (id: string) => void;
    summonGoobertsToHub: () => void;
    // captureGoobert: (id: string) => void;

    // Stats that minigames and rooms are allowed to update.
    updateStat: (
        id: string,
        stat: "fullness" | "awakeness" | "cleanliness" | "entertainment",
        amount: number
    ) => void;
    getGoobertById: (id: string) => Goobert | undefined;

    createGoobert: (
        name: string,
        location?: string,
        x?: number,
        y?: number,
        appearance?: GoobertAppearance,
        stats?: GoobertStats,

        fromServer?: boolean
        // accessories?: GoobertAccessories
    ) => void;

    loadSlot: (saveSlot: number) => void
    newGame: (slot: number) => void

    updatePosition: (
        id: string,
        x: number,
        y: number,
    ) => void;

    updateProp: <K extends keyof Goobert>(
        id: string,
        property: K,
        value: any
    ) => void;

    updateAccessories: (
        id: string,
        accessories: GoobertAccessories
    ) => void;

    kill: (
        id: string
    ) => void;


    doorRefs: doorRefs
}
type doorRefs = {
    gameRoom: RefObject<HTMLImageElement | null>,
    bedroom: RefObject<HTMLImageElement | null>,
    shop: RefObject<HTMLImageElement | null>,
    menu: RefObject<HTMLImageElement | null>,
    dungeon: RefObject<HTMLImageElement | null>,
    graveyard: RefObject<HTMLImageElement | null>,

    gameRoomHub: RefObject<HTMLImageElement | null>,
    bedroomHub: RefObject<HTMLImageElement | null>,
    shopHub: RefObject<HTMLImageElement | null>,
    menuHub: RefObject<HTMLDivElement | null>,
    dungeonHub: RefObject<HTMLImageElement | null>,
    graveyardHub: RefObject<HTMLImageElement | null>,
}
const GoobertContext = createContext<GoobertContextType | null>(null);

declare global{
    interface window{
        kill: (id: string) => void;
    }
}

/*=====MUTATION TYPES=====*/

function getMutationType(goobert: Goobert): MutantType {
    if (goobert.fullness <= 0) return MutantType.HUNGRY;
    if (goobert.awakeness <= 0) return MutantType.SLEEPLESS;
    if (goobert.cleanliness <= 0) return MutantType.DIRTY;
    if (goobert.entertainment <= 0) return MutantType.BORED;

    // Saved mutant Gooberts without a zero stat still need a sprite.
    // This should be impossible but it gets TS to stop complaining
    return MutantType.HUNGRY;
}

export function GoobertProvider({ children }: any) {
    // Allow gooberts and mutants to be globally accessible
    const [gooberts, setGooberts] = useState<Goobert[]>([]);
    (window as any).gooberts = gooberts;

    const [deadGooberts, killGooberts] = useState<Corpse[]>([]);
    (window as any).deadGooberts = deadGooberts;

    
    let { pid } = useServer();
    const gameData = useRef({ gooberts, deadGooberts, pid });
    
    // ==== CENTRALIZED Goobert STAT UPDATES ====

    // Update a specific Goobert's stat through React state.
    // Positive amounts restore stats; negative amounts decrease them.
    // useCallback prevents the function from being recreated on every render.
    const updateStat = useCallback((
        id: string,
        stat: "fullness" | "awakeness" | "cleanliness" | "entertainment",
        amount: number
    ) => {
        setGooberts(previous =>
            previous.map(goobert => {
                if (goobert.id !== id) {
                    return goobert;
                }

                return {
                    ...goobert,
                    [stat]: Math.min(
                        100,
                        Math.max(0, goobert[stat] + amount)
                    )
                };
            })
        );
    }, []);

    const getGoobertById = (id: string) => {
        for(let goobert of gooberts) {
            if(goobert.id == id) return goobert;
        }
        return undefined;
    }

    /*=====AUTOMATIC STAT DEPLETION AND MUTATION=====*/

    // Maintain the upstream ten-second stat depletion interval.
    // Mutated Gooberts do not lose additional stats while imprisoned.
    useEffect(() => {
        gameData.current = {
            ...gameData.current,
            gooberts: gooberts,
            deadGooberts: deadGooberts,
            pid: pid
        };
    }, [gooberts, deadGooberts, pid])
    useEffect(() => {
        const interval = window.setInterval(() => {
            if(!gameData.current) return;
            const state = globalTick(gameData.current);

            
            // Update gooberts if there are gooberts to update. This helps prevent overwriting failed save loading from servers
            if(state.gooberts.length > 0 || gooberts.length > 0)
                setGooberts(state.gooberts);

            if(state.deadGooberts.length != gameData.current.deadGooberts.length) {
                killGooberts(state.deadGooberts);
            }
        }, 1000 / 60);
        return () => window.clearInterval(interval);
    }, []);

    (window as any).mutate = (id: string, depletedStat: "fullness" | "cleanliness" | "awakeness" | "entertainment") => {
        setGooberts((prev) => 
            prev.map(goobert => goobert.id == id ? {
                ...goobert,
                [depletedStat]: 0
            } : goobert)
        );
    }
    /*=====DUNGEON DASH RESCUE=====*/

    const cureGoobert = useCallback((id: string) => {
        setGooberts(previous => previous.map(goobert => {
            if (goobert.id !== id || !goobert.isMutant) {
                return goobert;
            }

            // Remove mutant type because goobert is being cured
            const { mutantType, ...normalGoobert } = goobert;
            const newGoobert = {
                ...normalGoobert,
                isMutant: false,
                room: rooms.hub,
                x: 100 + Math.random() * 180,
                y: 450,

                fullness: Math.max(50, goobert.fullness),
                awakeness: Math.max(50, goobert.awakeness),
                cleanliness: Math.max(50, goobert.cleanliness),
                entertainment: Math.max(50, goobert.entertainment)
            };

            const saveSlot = localStorage.getItem("currentSlot");
            if(saveSlot) {
                if(!pid) pid = localStorage.getItem("pid")!;
                updateGoobert(pid, parseInt(saveSlot), newGoobert);
            }

            return newGoobert;
        }));
    }, []);

    /*=====HUB SUMMONING BELL=====*/

    const summonGoobertsToHub = useCallback(() => {
        const hub = document.querySelector<HTMLElement>(".hub");
        const width = hub?.clientWidth ?? window.innerWidth;
        const height = hub?.clientHeight ?? window.innerHeight;

        setGooberts(previous => {
            const available = previous.filter(goobert =>
                !goobert.isMutant
            );

            const columns = Math.max(1, Math.min(8, Math.floor((width - 24) / 76)));
            const positions = new Map<string, { x: number; y: number }>();

            available.forEach((goobert, index) => {
                const row = Math.floor(index / columns);
                const column = index % columns;
                const countInRow = Math.min(columns, available.length - row * columns);
                const spacing = Math.min(76, Math.max(66, (width - 24) / countInRow));
                const rowWidth = countInRow * spacing;

                positions.set(goobert.id, {
                    x: Math.max(0, Math.min(
                        width - 64,
                        (width - rowWidth) / 2 + column * spacing + (spacing - 64) / 2
                    )),
                    y: Math.max(0, height - 95 - row * 72)
                });
            });

            return previous.map(goobert => {
                const position = positions.get(goobert.id);
                return position
                    ? { ...goobert, room: rooms.hub, ...position }
                    : goobert;
            });
        });
    }, []);

    /*=====LOCAL DUNGEON DASH TESTING=====*/

    useEffect(() => {
        if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) {
            return;
        }

        (window as any).testDungeonMutation = () => {
            setGooberts(previous => {
                const candidate = previous.find(goobert =>
                    !goobert.isMutant
                );

                if (!candidate) {
                    console.warn("Create or load a Goobert before testing a mutation.");
                    return previous;
                }
                return previous.map(goobert => goobert.id === candidate.id
                    ? { ...goobert, fullness: 0, isMutant: true, mutantType: MutantType.HUNGRY }
                    : goobert
                );
            });
        };

        return () => {
            delete (window as any).testDungeonMutation;
        };
    }, []);

    // Allow gooberts to be created from anywhere
    const createGoobert = (
        name: string,
        location?: string,
        x?: number,
        y?: number,
        appearance?: GoobertAppearance,
        stats?: GoobertStats,
        fromServer?: boolean
    ) => {
        const goobert = renderGoobert(name, location, x, y);

        if (appearance) {
            Object.assign(goobert, appearance);
        }
        if (stats) {
            Object.assign(goobert, stats);
        }

        if(!fromServer && localStorage.getItem("currentSlot")) {
            const saveSlot = localStorage.getItem("currentSlot");
            saveGoobertToDatabase(pid, parseInt(saveSlot!), goobert);
        }

        setGooberts(prev => [...prev, goobert]);
    };
    (window as any).createGoobert = createGoobert;
    /**
     * Load a save slot. The exact location of the saved storage is determined by getState
     * But the data rendering is handled by this function.
    */
    const loadSlot = async (saveSlot: number) => {
        let data = await getState(pid, saveSlot);
        if(!data) {
            setGooberts([]);
            killGooberts([]);
            return;
        }

        let newGooberts = data.gooberts.map(goobert => {
            let newGoobert: Goobert = renderGoobert(goobert.name, goobert.room);
            // Populate saved properties
            Object.assign(newGoobert, {...goobert});
            // Randomize Position
            newGoobert.x = Math.floor(Math.random() * window.innerWidth);
            newGoobert.y = Math.floor(Math.random() * window.innerHeight);

                newGoobert.isMutant = newGoobert.fullness <= 0 || newGoobert.awakeness <= 0 || newGoobert.cleanliness <= 0 || newGoobert.entertainment <= 0;

            return newGoobert;
        });
        
        gameData.current.gooberts = newGooberts;
        setGooberts(newGooberts);
        if(data.deadGooberts) {
            gameData.current.deadGooberts = data.deadGooberts;
            killGooberts(data.deadGooberts);
        } else {
            killGooberts([]);
        }
        
        // Set most recently loaded slot to activate on page reload
        localStorage.setItem("currentSlot", saveSlot.toString());
    }
    (window as any).loadSlot = loadSlot;

    const newGame = async (slot: number) => {
        setGooberts([]);
        killGooberts([]);

        localStorage.setItem("currentSlot", slot.toString());
        if(!pid)
            pid = localStorage.getItem("pid") ?? "";
        if(pid.length > 0) {
            const s = (await getUserByPid(pid))?.initialized;
            if(s) {
                const initialized = s.substring(0, slot - 1) + "1" + s.substring(slot);
                updateUser(pid, initialized);
                let state = await getState(pid, slot);
                if(state) {
                    for(let goobert of state.gooberts) {
                        await deleteGoobert(pid, slot, goobert.id);
                    }
                    deleteGraveyard(pid, slot);
                    // state = await getState(pid, slot); 
                }
            }
        }

        setGooberts([]);
        killGooberts([]);
    }

    //KILL GOOBERTS DEAD!!!!!
    
    const kill = (id: string) => {
        let newArray = [...gooberts];
        //find the goobert in the living gooberts array
        for(let i = 0; i < newArray.length; i++) {
            let deadGoobert = (newArray[i] as Goobert);
            if(deadGoobert!.id == id) {
                // updateRoom(deadGoobert.id, "/graveyard")
                killGooberts([...deadGooberts, deadGoobert])
                newArray.splice(i, 1);
                goobertDeathRattle.play();
                break;
            }
        }
        setGooberts(newArray)
    }
    (window as any).kill = kill;


    // Update goobert position
    const updatePosition = (id: string, x: number, y: number) => {
        let newArray = [...gooberts];
        // Update goobert position
        for(let goobert of newArray) {
            if(goobert.id == id) {
                goobert.x = x;
                goobert.y = y;
            }
        }
        // Update gooberts array with new position
        setGooberts(newArray);
    }
    const updateProp = <K extends keyof Goobert>(id: string, property: K, value: any) => {
        let newArray: Goobert[] = [...gooberts];
        // Update goobert position
        for(let goobert of newArray) {
            if(goobert.id == id && !goobert.isUi) {
                goobert[property] = value;

                const saveSlot = localStorage.getItem("currentSlot");
                if(saveSlot) {
                    updateGoobertProperty(pid, parseInt(saveSlot), id, property, value);
                }
            }
        }
        // Update gooberts array with new position
        setGooberts(newArray);
    }


    // Update only the selected Goobert's accessories.
    const updateAccessories = (id: string, accessories: GoobertAccessories) => {
        setGooberts(previous =>
            previous.map(goobert => {
                if(goobert.id === id) {
                    // Update appearance on serverside
                    const saveSlot = localStorage.getItem("currentSlot");
                    if(saveSlot && goobert)
                        saveAccessories(pid, parseInt(saveSlot), { ...goobert, ...accessories });

                    return { ...goobert, ...accessories };
                } else {
                    return goobert
                } 
            })
        );
    };


        // Keep track of door references globally
        const doorRefs = {
        gameRoom: useRef<HTMLImageElement>(null),
        bedroom: useRef<HTMLImageElement>(null),
        shop: useRef<HTMLImageElement>(null),
        menu: useRef<HTMLImageElement>(null),
        dungeon: useRef<HTMLImageElement>(null),
        graveyard: useRef<HTMLImageElement>(null),

        gameRoomHub: useRef<HTMLImageElement>(null),
        bedroomHub: useRef<HTMLImageElement>(null),
        shopHub: useRef<HTMLImageElement>(null),
        menuHub: useRef<HTMLDivElement>(null),
        dungeonHub: useRef<HTMLImageElement>(null),
        graveyardHub: useRef<HTMLImageElement>(null)
    }

    // Render goobert context provider
    return (
        <GoobertContext.Provider value={{
            gooberts, deadGooberts,
            
            createGoobert, updatePosition, updateProp, updateAccessories, updateStat,
            getGoobertById, cureGoobert, summonGoobertsToHub,
            loadSlot, newGame, kill,
            
            doorRefs}}>
            {children}
        </GoobertContext.Provider>
    )
}

export function renderGoobert(
	name: string,
	location: string = rooms.hub,
	x = (Math.random() * (window.innerWidth - 64) /* world width */),
	y = ((Math.random() * (window.innerHeight - 550 - 64) /* world height */)) + 550,
    isUi = false,
): Goobert {
	let goobert = {
        name: name,
        x: x,
        y: y,
        room: location,
        id: name + new Date().getTime(), // unique identifier

        isMutant: false,
        MutantType: undefined,

        isUi: isUi,
        className: "",

        // Initialize stats with a random number between 30 and 70
        fullness: 30 + Math.floor(Math.random() * 41), // Eating, catch the food game
        entertainment: 30 + Math.floor(Math.random() * 41), // Exercise, Snake & Frogoobert
        awakeness: 30 + Math.floor(Math.random() * 41), // Sleeping
        cleanliness: 30 + Math.floor(Math.random() * 41), // Bathing, Flappy Goobert

        bodyType: Math.floor(Math.random() * MAX_BODY_TYPES),
        bodyColor: Math.floor(Math.random() * MAX_COLORS),
        legType: Math.floor(Math.random() * MAX_LEG_TYPES),
        legColor: Math.floor(Math.random() * MAX_COLORS),
        eyeType: Math.floor(Math.random() * MAX_EYE_TYPES),
        mouthType: Math.floor(Math.random() * MAX_MOUTH_TYPES),
        eyeExpression: 0,
        mouthExpression: 0,

        hatType: 0,
        hatStyle: 0,
        maskType: 0,
        maskStyle: 0,
        extraType: 0,
        extraStyle: 0,

        // Restore Goobert needs without exceeding 100.
        eat(amt = 10) {
            this.fullness = Math.min(100, this.fullness + amt);
        },

        sleep() {
            this.awakeness = 100;
        },

        // Entertainment is earned threnderGorough minigames.
        entertain(quality: number) {
            this.entertainment = Math.min(100, this.entertainment + quality);
        },

        bathe(amt: number) {
            this.cleanliness = Math.min(100, this.cleanliness + amt);
        },

        onGoobertSelected: (goobert: Goobert) => {
            // Setup by TopElement
        },

        sleeping: 0, 
        isDragged: false, 
        waitTime: 20, 
        target: null
    }

    return goobert;
}
export default function useGooberts() {
  const context = useContext(GoobertContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function getDeceased(){
    const {deadGooberts} = useGooberts(); 
    return deadGooberts;
}
