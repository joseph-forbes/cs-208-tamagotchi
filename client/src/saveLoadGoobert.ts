import axios from 'axios';
import type { Corpse, Goobert } from './Goobert';
import { body } from './games/games-global';
import type { MutantType } from './Mutant';
import type { Ref } from 'react';

type RequestBody = {
	pid: string;
	saveSlot: number;
	data: any;
}
export type GoobertData = {
    name: string;
    room: string;
    id: string;

    is_mutant: number;
    mutant_type: number;

    fullness: number;
    entertainment: number;
    awakeness: number;
    cleanliness: number;

    appearance: string;
    accessories: string;

    sleeping: number;
};
export type CorpseData = {
    name: string;
    id: string;
    appearance: string;
};
export const validProperties = [
    "room",
    "mutant_type", 
    "fullness", 
    "entertainment", 
    "awakeness", 
    "cleanliness",
    "appearance", 
    "accessories",
    "sleeping"
];

let pid = localStorage.getItem("pid");
const filePath = "http://localhost:3000";

export type GoobertProps = {
    room: string;
    name: any;
    x?: number;
    y?: number;
    id: string;
    isUi: boolean;
    styleGoobert?: boolean;

    isMutant: boolean;
    mutantType?: MutantType;

    bodyType: number;
    bodyColor: number;
    legColor: number;
    legType: number;
    eyeType: number;
    mouthType: number;
    mouthExpression: number;
    eyeExpression: number;

    hatType: number;
    hatStyle: number;
    maskType: number;
    maskStyle: number;
    extraType: number;
    extraStyle: number;

    onGoobertSelected?: Function;
    className?: string;
    ref?: Ref<HTMLElement>;
};

export async function createUser(pid: string, username: string, password: string) {
  const data = {pid: pid, username: username, password: password, initialized: "000"}
  const json = JSON.stringify(data);
  try {    
    const response = await axios.post(`${filePath}/users`, {
      headers: {
        Accept: "application/json"
      },
      body: json
    });

  } catch(error) {
    // Server not running
    console.log(error);
  }
}
(window as any).createUser = createUser;
export async function getUserByPid(pid: string): Promise<{pid: string, username: string, initialized: string} | undefined> {
  try {
    const params = new URLSearchParams({
      pid: pid
    });
    const response = await axios.get(`${filePath}/users?${params.toString()}`, {
    headers: {
      Accept: "application/json"
      }
    });

    // Get data from Server
    const data = await response.data;
    return data[0];

  } catch(error) {
    console.log(error);
  }
}
(window as any).getUserByPid = getUserByPid;
export async function updateUser(pid: string, initialized: string) {
  const data = {pid: pid, initialized: initialized}
  const json = JSON.stringify(data);
  try {    
    const response = await axios.put(`${filePath}/users`, {
      headers: {
        Accept: "application/json"
      },
      body: json
    });
  } catch(error) {
    // Server not running
    console.log(error);
  }
}
(window as any).updateUser = updateUser;

export async function getState(pid: string, saveSlot: number) {
  try {
    const params = new URLSearchParams({
      pid: pid,
      slot: saveSlot.toString()
    });
    const response = await axios.get(`${filePath}/gooberts?${params.toString()}`, {
    headers: {
      Accept: "application/json"
      }
    });

    // Get data from Server
    const data = await response.data;
    const gooberts: GoobertProps[] = data.gooberts ? data.gooberts.map((goobert: GoobertData) => {
      const appearanceArray = goobert.appearance.split("_");
      const appearanceProps = {
        bodyType: parseInt(appearanceArray[0]!),
        bodyColor: parseInt(appearanceArray[1]!),
        legType: parseInt(appearanceArray[2]!),
        legColor: parseInt(appearanceArray[3]!),
        eyeType: parseInt(appearanceArray[4]!),
        eyeExpression: parseInt(appearanceArray[5]!),
        mouthType: parseInt(appearanceArray[6]!),
        mouthExpression: parseInt(appearanceArray[7]!)
      };
      const accessoriesArray = goobert.accessories.split("_");
      const accessoriesProps = {
        hatType: parseInt(accessoriesArray[0]!),
        hatStyle: parseInt(accessoriesArray[1]!),
        maskType: parseInt(accessoriesArray[2]!),
        maskStyle: parseInt(accessoriesArray[3]!),
        extraType: parseInt(accessoriesArray[4]!),
        extraStyle: parseInt(accessoriesArray[5]!)
      };
      delete (goobert as any).appearance;
      delete (goobert as any).accessories;

      const isMutant = goobert.is_mutant == 1;
      delete (goobert as any).mutant_type;

      return {
        ...goobert,
        isUi: false,
        fromServer: true,
        isMutant: isMutant,

        ...appearanceProps,

        ...accessoriesProps
      };
    }) : [];
    const deadGooberts: Corpse[] = data.graveyard ? data.graveyard.map((goobert: CorpseData) => {
      const appearanceArray = goobert.appearance.split("_");
      const appearanceProps = {
        bodyType: parseInt(appearanceArray[0]!),
        bodyColor: parseInt(appearanceArray[1]!),
        legType: parseInt(appearanceArray[2]!),
        legColor: parseInt(appearanceArray[3]!),
        eyeType: parseInt(appearanceArray[4]!),
        eyeExpression: parseInt(appearanceArray[5]!),
        mouthType: parseInt(appearanceArray[6]!),
        mouthExpression: parseInt(appearanceArray[7]!)
      };
      delete (goobert as any).appearance;

      return {
        ...goobert,
        isUi: false,
        fromServer: true,
        isMutant: false,

        ...appearanceProps,
      };
    }) : [];

    // Return gooberts
    return {gooberts: gooberts, deadGooberts: deadGooberts};
  } catch(error) {
    // Server not running
    console.log("failed to connect.");
    console.log(error);

    const json = await localStorage.getItem("slot" + saveSlot);
    if(!json) return;
    const data = JSON.parse(json) as GoobertProps[];

    return {gooberts: data};
  }
}
(window as any).getState = getState;


export async function saveState(pid: string, gooberts: Goobert[], saveSlot: string) {
  const json = JSON.stringify(gooberts);

  // Save to localStorage
  localStorage.setItem(saveSlot, json);
}
(window as any).saveState = saveState;

export async function saveGoobertToDatabase(pid: string, saveSlot: number, goobert: Goobert) {
    const data: GoobertData = getGoobertData(goobert);
    const request: RequestBody = {
      pid: pid,
      saveSlot: saveSlot,
      data: data
    }
    const json = JSON.stringify(request);
  try {    
    const response = await axios.post(`${filePath}/gooberts`, {
    headers: {
      Accept: "application/json"
      },
      body: json
    });

  } catch(error) {
    // Server not running
    console.log(error);
  }
}
export async function sendKill(pid: string, saveSlot: number, goobert: Goobert) {
  const data = {
    name: goobert.name,
    id: goobert.id,
    appearance: stringifyAppearance(goobert)
  }
    const request: RequestBody = {
      pid: pid,
      saveSlot: saveSlot,
      data: data
    }
    const json = JSON.stringify(request);
  try {    
    const response = await axios.post(`${filePath}/graveyard`, {
    headers: {
      Accept: "application/json"
      },
      body: json
    });

  } catch(error) {
    // Server not running
    console.log(error);
  }
}
export async function updateGoobertProperty(pid: string, saveSlot: number, goobertId: string, stat: string, value: number | string) {
    if(!validProperties.includes(stat)) return;
    const data = {
      goobertId: goobertId,
      stat: stat,
      value: value
    }
    const request: RequestBody = {
      pid: pid,
      saveSlot: saveSlot,
      data: data
    }
    const json = JSON.stringify(request);
  try {    
    const response = await axios.put(`${filePath}/gooberts`, {
    headers: {
      Accept: "application/json"
      },
      body: json
    });

  } catch(error) {
    console.log(error);
  }
}
export async function updateGoobert(pid: string, saveSlot: number, goobert: Goobert) {
    const data = getGoobertData(goobert);
    const request: RequestBody = {
      pid: pid,
      saveSlot: saveSlot,
      data: data
    }
    const json = JSON.stringify(request);
  try {    
    const response = await axios.put(`${filePath}/gooberts`, {
    headers: {
      Accept: "application/json"
      },
      body: json
    });

  } catch(error) {
    console.log(error);
  }
}
export const saveAccessories = async (pid: string, saveSlot: number, goobert: Goobert) => {
  await updateGoobertProperty(
    pid, 
    saveSlot, 
    goobert.id, 
    "accessories", 
    stringifyAccessories(goobert)
  );
}
export async function deleteGoobert(pid: string, saveSlot: number, goobertId: string) {
    const params = new URLSearchParams({
      pid: pid,
      slot: saveSlot.toString(),
      goobertId: goobertId
    });
  try {    
    const response = await axios.delete(`${filePath}/gooberts?${params.toString()}`, {
      headers: {
        Accept: "application/json"
      }
    });

  } catch(error) {
    console.log(error);
  }
}
export async function deleteGraveyard(pid: string, saveSlot: number) {
    const params = new URLSearchParams({
      pid: pid,
      slot: saveSlot.toString()
    });
  try {    
    const response = await axios.delete(`${filePath}/graveyard?${params.toString()}`, {
      headers: {
        Accept: "application/json"
      }
    });

  } catch(error) {
    console.log(error);
  }
}

const getGoobertData = (goobert: Goobert) => {
  const appearance = stringifyAppearance(goobert);

    const accessories = stringifyAccessories(goobert);
  
  return {
      name: goobert.name,
      room: goobert.room,
      id: goobert.id,

      is_mutant: goobert.isMutant ? 1 : 0,
      mutant_type: goobert.mutantType ?? -1, 
      sleeping: goobert.sleeping,

      fullness: goobert.fullness, 
      entertainment: goobert.entertainment,
      awakeness: goobert.awakeness, 
      cleanliness: goobert.cleanliness,

      appearance: appearance,
      accessories: accessories
    };
}
const stringifyAppearance = (goobert: Goobert) => {
  return `
      ${goobert.bodyType}_
      ${goobert.bodyColor}_
      ${goobert.legType}_
      ${goobert.legColor}_
      ${goobert.eyeType}_
      ${goobert.eyeExpression}_
      ${goobert.mouthType}_
      ${goobert.mouthExpression}
    `.replace(/\s+/g, '');
}

const stringifyAccessories = (goobert: Goobert) => {
  return `
    ${goobert.hatType}_
    ${goobert.hatStyle}_
    ${goobert.maskType}_
    ${goobert.maskStyle}_
    ${goobert.extraType}_
    ${goobert.extraStyle}
  `.replace(/\s+/g, '');
}