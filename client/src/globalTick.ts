import { rooms } from "./App";
import { goobertDeathRattle } from "./components/audio";
import { SPRITE_SIZE, type Corpse, type Goobert } from "./Goobert"
import { arrived, randomTarget, step, type Bounds, type Point } from "./GoobertAI";
import { MutantType } from "./Mutant";
import { catchGoobert, chooseGoobert, findGoobert, getMutantSpeed } from "./MutantAI";
import { sendKill, updateGoobert, updateGoobertProperty } from "./saveLoadGoobert";

export type GameState = {
    gooberts: Goobert[],
    deadGooberts: Corpse[],

    pid?: string,
    saveSlot?: number
}
const FPS = 60
const DRAIN_TIME = 20 * FPS; // Wait DRAIN_TIME frames between draining stats 
const GOOBERT_VELOCITY = 4; // Pixels per frame
const GROUND_LIMIT = 350; // Minimum Y value for goobert wandering

let drainTimer = DRAIN_TIME;

let newGooberts: Goobert[] = [];
let newDeadGooberts: Corpse[] = [];
/**
 * Updates gooberts and returns the new gooberts upon update being completed
 * 
 * @param gameState state of the game at the start of the loop
 */
export const globalTick = ({ gooberts, deadGooberts, pid}: GameState): GameState => {
    newGooberts = [...gooberts];
    newDeadGooberts = [...deadGooberts];

    drainTimer--;
    if(drainTimer <= 0) {
        drainGooberts(pid);
        drainTimer = DRAIN_TIME;
    }

    for(let goobert of newGooberts) {
        goobert = goobertTick(goobert);
    }

    return {gooberts: newGooberts, deadGooberts: newDeadGooberts};
}
const getGoobertById = (id: string, gooberts: Goobert[]) => {
    for(let goobert of gooberts) {
        if(goobert.id == id) return goobert;
    }
    return undefined;
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

const drainGooberts = (pid: string | undefined) => {
    newGooberts = newGooberts.map(goobert => {
        if (goobert.isMutant) {
            return goobert;
        }
        
        const updated = {
            ...goobert,
            fullness: Math.max(0, goobert.fullness - Math.floor(Math.random() * 3)),
            awakeness: Math.max(0, goobert.awakeness - Math.floor(Math.random() * 3)),
            cleanliness: Math.max(0, goobert.cleanliness - Math.floor(Math.random() * 3)),
            entertainment: Math.max(0, goobert.entertainment - Math.floor(Math.random() * 3))
        };
        const saveSlot = localStorage.getItem("currentSlot");
        if(saveSlot && pid) {
            updateGoobertProperty(pid, parseInt(saveSlot), goobert.id, "fullness", goobert.fullness);
            updateGoobertProperty(pid, parseInt(saveSlot), goobert.id, "awakeness", goobert.awakeness);
            updateGoobertProperty(pid, parseInt(saveSlot), goobert.id, "entertainment", goobert.entertainment);
            updateGoobertProperty(pid, parseInt(saveSlot), goobert.id, "cleanliness", goobert.cleanliness);
        }
        
        const depleted = (
            updated.fullness <= 0 ||
            updated.awakeness <= 0 ||
            updated.cleanliness <= 0 ||
            updated.entertainment <= 0
        );
        
        if (depleted && !goobert.isMutant) {
            const newGoobert = {
                ...updated,
                isMutant: true,
                mutantType: getMutationType(updated)
            };
            
            const saveSlot = localStorage.getItem("currentSlot");
            if(saveSlot && pid) {
                updateGoobert(pid, parseInt(saveSlot), newGoobert);
            }

            return newGoobert;
        }
        
        return updated;
    });
}
// ====== GOOBERT EMOTIONS ======
// EYE EMOTIONS:
// 0 > Neutral; 1 > Judgemental/Bored; 2 > Bored/Sad/Tired;
// 3 > Sad; 4 > Angry; 5 > Excited; 6 > Alarmed
enum eyeEmotions {
    neutral, judgemental, bored, sad, angry, excited, alarmed
}

// MOUTH EMOTIONS:
// 0 > Neutral; 1 > Slightly Open; 2 > Open;
// 3 > Sad; 4 > Angry; 5 > Happy
enum mouthEmotions {
    neutral, partOpen, fullOpen, sad, angry, happy
}


/* 
* Wandering AI allows Gooberts to move across the screen when not being dragged.
* Goobies will wander around the Hub and other rooms, avoiding doors and staying 
* within boundaries. The wandering behavior is paused when the player interacts 
* with a Goobert.
*/
const getWanderBounds = (goobert: Goobert): Bounds => {
    const hub = document.querySelector(".hub");
    const isMobile = window.innerWidth <= 768;

    // Adjusts wandering boundaries for the Hub room
    if (goobert.room === rooms.hub && hub) {
        const maxX = Math.max(0, hub.clientWidth - SPRITE_SIZE);
        const maxY = Math.max(
            0,
            (isMobile ? hub.clientHeight : hub.scrollHeight) - SPRITE_SIZE
        );

        // Keeps Gooberts on the ground on desktop, but allows them to wander freely on mobile.
        return {
            minX: 0,
            maxX,
            minY: isMobile ? 0 : Math.min(GROUND_LIMIT, maxY),
            maxY
        };
    }

    // Default wandering boundaries for other rooms
    return {
        minX: 0,
        maxX: Math.max(0, window.innerWidth - SPRITE_SIZE),
        minY: 0,
        maxY: Math.max(0, innerHeight - SPRITE_SIZE)
    };
};
function goobertTick(goobert: Goobert): Goobert {
    // MUTANT AI TO CHASE GOOBERTS
    if (goobert.isMutant) {
        if(!goobert.mutantType) goobert.mutantType = getMutationType(goobert);
        return mutantTick(goobert);
    }

    if(goobert.sleeping > 0) { // Don't wander while sleeping
        goobert.eyeExpression = (eyeEmotions.bored);
        goobert.awakeness = Math.min(100, goobert.awakeness + 0.01);

        // Save sleeping data to server
        const saveSlot = localStorage.getItem("currentSlot");
        const pid = localStorage.getItem("pid");
        // Update awakeness on the server such that only one update is sent per integer increase in awakeness
        if(saveSlot && pid && (goobert.awakeness - Math.floor(goobert.awakeness)) < 0.01 && goobert.awakeness != 100)
            updateGoobertProperty(pid, parseInt(saveSlot), goobert.id, "awakeness", Math.floor(goobert.awakeness));
        
        return goobert;
    }
    handleEmotion(goobert.id);

    // Skip wandering behavior if the Goobert is being dragged or waiting.
    if (goobert.isDragged) {
        if (!goobert.isMutant) {
            goobert.eyeExpression = (eyeEmotions.alarmed);
        }
        return goobert;
    }

    // Decrease the wait time before selecting a new wandering target.
    if (goobert.waitTime > 0) {
        goobert.waitTime -= 1;
        return goobert;
    }

    // If no target is set, generate a new random target within the wandering bounds.
    if (goobert.target === null) {
        goobert.target = randomTarget(getWanderBounds(goobert));
        return goobert;
    }

    // Move the Goobert towards the current target. 
    // If it has arrived, reset the target and set a new wait time.
    if (arrived({x: goobert.x, y: goobert.y}, goobert.target as Point)) {
        goobert.target = null;
        goobert.waitTime = 20 + Math.floor(Math.random() * 60);
        return goobert;
    }

    const next = step({x: goobert.x, y: goobert.y}, goobert.target as Point, GOOBERT_VELOCITY);
    const worked = move(goobert, next.x, next.y);

    // If the move was unsuccessful due to boundaries, reset the target 
    // and set a short wait time before trying again.
    if (!worked) {
        goobert.target = null;
        goobert.waitTime = 25 + Math.random() * 120;
    }
        
    return goobert;
}
const handleEmotion = (id: string) => {
    const goobert = newGooberts.find(other => other.id === id);
    if(!goobert) return;

    goobert.eyeExpression = 0; 
    goobert.mouthExpression = 0;

    // Goobert gets excited when another friendly Goobert is in the same room
    if (newGooberts.some(other =>
        !other.isMutant &&
        other.id !== goobert.id &&
        other.room === goobert.room
    )) {
        goobert.eyeExpression = (eyeEmotions.excited);
        goobert.mouthExpression = (mouthEmotions.happy);
    }

    if(
        (goobert.awakeness + goobert.cleanliness + 
            goobert.entertainment + goobert.fullness) / 4 > 60
    ) {
        // Fairly well taken care of
        goobert.mouthExpression = (mouthEmotions.happy);
    }

    if(
        (goobert.awakeness + goobert.cleanliness + 
            goobert.entertainment + goobert.fullness) / 4 > 90
    ) {
        // Very well taken care of
        goobert.eyeExpression = (eyeEmotions.excited);
    }
    
    if(goobert.awakeness < 20) {
        // Tired
        goobert.eyeExpression = (eyeEmotions.judgemental);
    }

    if(
        (goobert.awakeness + goobert.cleanliness + 
            goobert.entertainment + goobert.fullness) / 4 < 20
    ) {
        // Neglected
        goobert.mouthExpression = (mouthEmotions.angry);
        goobert.eyeExpression = (eyeEmotions.angry);
    }

    if(goobert.room == rooms.graveyard) {
        goobert.mouthExpression = (mouthEmotions.sad);
        goobert.eyeExpression = (eyeEmotions.sad);
    }


    // Goobert becomes angry when very hungry
    if (goobert.fullness < 20) {
        goobert.eyeExpression = (eyeEmotions.angry);
        goobert.mouthExpression = (mouthEmotions.angry);
    }

    // Goobert becomes alarmed when a mutant is in the same room
    if (!goobert.isMutant && newGooberts.some(other =>
        other.isMutant && other.room === goobert.room
    )) {
        goobert.eyeExpression = (eyeEmotions.alarmed);
    }

}
/*
    * Updates the Goobert's position while enforcing movement boundaries.
    * Keeps Gooberts within the Hub, prevents door overlap, and restricts
    * desktop movement to the ground area.
    *
    * Mobile uses different boundaries to support the responsive layout.
    */
const move = (goobert: Goobert, newX: number, newY: number) => {
    const hub = document.querySelector(".hub");

    let boundedX = Math.max(0, newX);
    let boundedY = Math.max(0, newY);

    if (goobert.room === rooms.hub && hub) {
        /*
        * Adjusts Goobert movement boundaries for mobile screens.
        * Mobile uses the visible Hub height instead of its scrollable height
        * to prevent Gooberts from being dragged off-screen.
        * Desktop keeps its original movement boundaries.
        */
        const isMobile = window.innerWidth <= 768;
        const maxX = Math.max(
            0,
            hub.clientWidth - SPRITE_SIZE
        );

        const maxY = Math.max(
            0,
            (isMobile ? hub.clientHeight : hub.scrollHeight) - SPRITE_SIZE
        );

        boundedX = Math.min(boundedX, maxX);
        boundedY = Math.min(boundedY, maxY);

        // Keep Gooberts on the ground on desktop.
        // Mobile uses a different, responsive Hub layout.
        if (window.innerWidth > 768) {
            boundedY = Math.max(
                Math.min(0, maxY),
                boundedY
            );
        }

        // Keep desktop door collision behavior.
        // Allow Goobert to approach doors on mobile.
        if (
            window.innerWidth > 768 &&
            overlapsDoor(goobert, boundedX, boundedY)
        ) {
            return;
        }
    }

    const nextPosition = {
        x: boundedX,
        y: boundedY
    };

    goobert.x = boundedX 
    goobert.y = boundedY;

    return true;
};
/*
* Checks whether two rectangular areas overlap.
* Used to detect collisions with doors and nearby objects.
*/
const overlaps = (
    a: { left: number; right: number; top: number; bottom: number },
    b: { left: number; right: number; top: number; bottom: number },
    padding = 0
): boolean => {
    return (
        a.left < b.right + padding &&
        a.right > b.left - padding &&
        a.top < b.bottom + padding &&
        a.bottom > b.top - padding
    );
};
/*
* Converts the Goobert's position into viewport coordinates.
* Accounts for the Hub's position and scrolling so collision
* detection works across desktop and mobile layouts.
*/
const getGoobertRect = (x: number, y: number) => {
    const hub = document.querySelector(".hub");

    if (!hub) {
        return {
            left: x,
            right: x + SPRITE_SIZE,
            top: y,
            bottom: y + SPRITE_SIZE
        };
    }

    const hubRect = hub.getBoundingClientRect();

    return {
        left: hubRect.left + x - hub.scrollLeft,
        right: hubRect.left + x - hub.scrollLeft + SPRITE_SIZE,
        top: hubRect.top + y - hub.scrollTop,
        bottom: hubRect.top + y - hub.scrollTop + SPRITE_SIZE
    };
};
/*
* Prevents Gooberts from occupying the same space as Hub doors.
* The tree is excluded so Gooberts can walk in front of it.
*/
const overlapsDoor = (goobert: Goobert, x: number, y: number): boolean => {
    if (goobert.room !== rooms.hub) return false;

    const hub = document.querySelector(".hub");
    if (!hub) return false;

    const goobertRect = getGoobertRect(x, y);

    const doors = hub.querySelectorAll(
        "#sleep-door, #game-door, #shop-door, #leave-door, #dungeon-door, #graveyard-arrow"
    );

    return Array.from(doors).some(door => {
        return overlaps(
            goobertRect,
            door.getBoundingClientRect()
        );
    });
};
const mutantTick = (goobert: Goobert) => {
    // Bored mutants don't wander
    if(goobert.mutantType === MutantType.BORED) return goobert;

    // Locate Gooberts 
    const targets = findGoobert(newGooberts, goobert.id, goobert.room);

    // Determine previous target Goobert available to chase
    let target = getGoobertById(goobert.target as string ?? "", newGooberts);

    // Randomly choose another Goobert to chase
    if (!target) {
        target = chooseGoobert(targets) ?? undefined
        goobert.target = target?.id ?? null;
    }

    // Mutant chases target Goobert
    if (target) {
        const speed = getMutantSpeed(goobert.mutantType!);
        const next = step({x: goobert.x, y: goobert.y}, {x: target.x, y: target.y}, speed);
        move(goobert, next.x, next.y);
    }

    // Find Gooberts in same room
    const mutantTargets = findGoobert(newGooberts, goobert.id, goobert.room);

    // Check Gooberts are near Mutant
    for (const target of mutantTargets) {
        const mutant = {x: goobert.x, y: goobert.y};

        if(catchGoobert(mutant.x, mutant.y, target.x, target.y)) {
            newGooberts.splice(newGooberts.indexOf(target), 1);
            newDeadGooberts.push(target);
            goobertDeathRattle.play();

            const pid = localStorage.getItem("pid");
            const saveSlot = localStorage.getItem("currentSlot");
            if(pid && saveSlot)
                sendKill(pid, parseInt(saveSlot), target);
        }
    }

    return goobert;
}