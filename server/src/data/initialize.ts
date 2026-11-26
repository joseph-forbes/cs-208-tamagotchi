import Database from "better-sqlite3";

const db = new Database("./dist/gooberts.db");


export type GoobertData = {
    name: string;
    room: string;
    id: string;

    is_mutant: boolean;
    mutantType: number;

    fullness: number;
    entertainment: number;
    awakeness: number;
    cleanliness: number;

    appearance: string;
    accessories: string;
};
export type CorpseData = {
    name: string;
    id: string;

    appearance: string;
};
export type UserData = {
    pid: string,
    initialized: string,
    username: string,
    password: string
}



const createUserTable = `CREATE TABLE IF NOT EXISTS users (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    pid TEXT NOT NULL,
    initialized TEXT NOT NULL,
    username TEXT,
    password TEXT
)`;
db.exec(createUserTable);

const createGoobertTable = `CREATE TABLE IF NOT EXISTS gooberts (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    user_slot TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    room TEXT,

    is_mutant INTEGER,
    mutant_type INTEGER,
    sleeping INTEGER,

    fullness INTEGER,
    entertainment INTEGER,
    awakeness INTEGER,
    cleanliness INTEGER,

    appearance TEXT,
    accessories TEXT
)`;
db.exec(createGoobertTable);
const createGraveyardTable = `CREATE TABLE IF NOT EXISTS graveyard (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    user_slot TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT NOT NULL,

    appearance TEXT
)`;
db.exec(createGraveyardTable);



db.close();