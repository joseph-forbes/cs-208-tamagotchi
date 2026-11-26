import { CorpseData, UserData } from "./initialize";
import {  db, get, getGraveyard, getUser as findUser, initializeUser, post, postDeath, postAccount, put, remove, validProperties, removeGraveyard, postUser, putAccount } from "./manipulate";

export type RequestBody = {
	pid: string;
	saveSlot: number;
	data: any;
}
export const getSaveState = async (req: RequestBody) => {
	const gooberts = get(getUserSlot(req.pid, req.saveSlot));
	const graveyard = getGraveyard(getUserSlot(req.pid, req.saveSlot));
	const saveState = {
		gooberts: gooberts,
		graveyard: graveyard
	}
	return saveState;
}
export const getUser = async (pid: string) => {
	return findUser(pid);
}


export const createGoobert = async (req: RequestBody) => {
	post(getUserSlot(req.pid, req.saveSlot), req.data);

	return getSaveState(req);
}
export const postToGraveyard = async (req: RequestBody) => {
	const goobert = req.data;
	const corpse: CorpseData = {
		name: goobert.name,
		id: goobert.id,
		appearance: goobert.appearance
	}
	postDeath(getUserSlot(req.pid, req.saveSlot), corpse);

	return getSaveState(req);
}
export const createAccount = async (pid: string, username: string, password: string) => {
	console.log("Creating: " + pid);
	const user: UserData = {
		pid: pid,
		initialized: "000",
		username: username,
		password: password
	}
	return postAccount(user);
}
export const createUser = async (pid: string) => {
	console.log("Creating: " + pid);
	const user = {
		pid: pid,
		initialized: "000",
	}
	return postUser(user);
}


export const updateGoobertProperty = async (req: any) => {
	const goobertId = req.data.goobertId;
	const property = req.data.stat;
	const value = req.data.value;
	put(getUserSlot(req.pid, req.saveSlot), goobertId, property, value);

	return getSaveState(req);
}
export const updateGoobert = async (req: RequestBody) => {
	if (!req.pid || req.saveSlot === undefined) {
        throw new Error("Missing pid or saveSlot in updateGoobert request");
    }

	const goobert = req.data;

	const user_slot = getUserSlot(req.pid, req.saveSlot);

	for(let property of validProperties) {
		const result = put(
			user_slot,
			goobert.id,
			property,
			goobert[property]
		);
	}

	return getSaveState(req);
}
export const updateUser = async (req: any) => {
	if(req.initialized) {
		initializeUser(req.pid, req.initialized);
	} else if(req.username && req.password) {
		putAccount(req.pid, req.username, req.password);
	}

	return getUser(req.pid);
}

export const deleteGoobert = async (req: RequestBody) => {
	const goobertId = req.data;
	remove(getUserSlot(req.pid, req.saveSlot), goobertId);

	return getSaveState(req);
}
export const deleteGraveyard = async (req: any) => {
	removeGraveyard(getUserSlot(req.pid, req.saveSlot));

	return getSaveState(req);
}

const getUserSlot = (userId: string, saveSlot: number) => {
	return userId + "_slot" + saveSlot;
}