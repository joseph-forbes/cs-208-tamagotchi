import Database from "better-sqlite3";
import { CorpseData, GoobertData, UserData } from "./initialize";

export const db = new Database("./dist/gooberts.db");

// POST
const goobertInsert = db.prepare(`
    INSERT OR IGNORE INTO gooberts (
        user_slot, id, name, room,

        mutant_type, 
        fullness, entertainment, awakeness, cleanliness,

        appearance, accessories
    ) VALUES (
        ?, ?, ?, ?, 
        
        ?, 
        ?, ?, ?, ?, 

        ?, ?
    )
`);
export const post = (user_slot: string, goobert: GoobertData) => {
    goobert.name, goobert.room,
    goobertInsert.run(
        user_slot, goobert.id, goobert.name, goobert.room, 

        goobert.mutantType,
        goobert.fullness, goobert.entertainment, goobert.awakeness, goobert.cleanliness,

        goobert.appearance, goobert.accessories
    );
}
const graveyardInsert = db.prepare(`
    INSERT OR IGNORE INTO graveyard (
        user_slot, id, name,

        appearance
    ) VALUES (
        ?, ?, ?,

        ?
    )
`);
export const postDeath = (user_slot: string, goobert: CorpseData) => {
    graveyardInsert.run(user_slot, goobert.id, goobert.name, goobert.appearance);
}
const userInsert = db.prepare(`
    INSERT OR IGNORE INTO users (
        pid,
        initialized,
        username,
        password
    ) VALUES (
        ?, ?, ?, ?
    )
`);
export const postUser = (user: UserData) => {
    if(selectUsername.all(user.username).length > 0) {
        return false;
    }
    userInsert.run(user.pid, user.initialized, user.username, user.password);
    return true;
}
// GET
const selectAll = db.prepare(`
    SELECT 
        uid, user_slot, id, name, room,

        mutant_type, 
        fullness, entertainment, awakeness, cleanliness,

        appearance, accessories
    FROM gooberts
    WHERE user_slot = ?
`);
export const get = (user_slot: string) => {
    let data = selectAll.all(user_slot);
    return data;
}
const selectGraveyard = db.prepare(`
    SELECT 
        uid, user_slot, id, name,

        appearance
    FROM graveyard
    WHERE user_slot = ?
`);
export const getGraveyard = (user_slot: string) => {
    let data = selectGraveyard.all(user_slot);
    return data;
}
const selectUser = db.prepare(`
    SELECT 
        pid, initialized, username
    FROM users
    WHERE pid = ?
`);
const selectUsername = db.prepare(`
    SELECT 
        pid, initialized, username
    FROM users
    WHERE username = ?
`);
export const getUser = (pid: string) => {
    let data = selectUser.all(pid);
    return data;
}


// PUT
export const validProperties = [
    "room",
    "is_mutant",
    "mutant_type",
    "sleeping", 
    "fullness", 
    "entertainment", 
    "awakeness", 
    "cleanliness",
    "appearance", 
    "accessories"
];
export const put = (user_slot: string, id: string, property: string, value: number | string) => {
    if(!validProperties.includes(property)) return;
    const updateOne = db.prepare(`
        UPDATE gooberts
        SET ${property} = ?
        WHERE user_slot = ? AND id = ?
    `);
    return updateOne.run(value, user_slot, id);
};
export const initializeUser = (pid: string, initialized: string) => {
    const updateOne = db.prepare(`
        UPDATE users
        SET initialized = ?
        WHERE pid = ?
    `);
    return updateOne.run(initialized, pid);
};

// DELETE
const deleteOne = db.prepare(`
    DELETE FROM gooberts WHERE user_slot = ? AND id = ?
`);
const deleteGraveyard = db.prepare(`
    DELETE FROM graveyard WHERE user_slot = ?
`);

export const remove = (user_slot: string, id: string) => {
    deleteOne.run(user_slot, id);
}
export const removeGraveyard = (user_slot: string) => {
    deleteGraveyard.run(user_slot);
}