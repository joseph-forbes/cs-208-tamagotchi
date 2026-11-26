import express, { Express, NextFunction, Request, Response } from "express";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { createGoobert, createAccount, deleteGoobert, deleteGraveyard, getSaveState, getUser, postToGraveyard, updateGoobert, updateGoobertProperty, updateUser, createUser } from "./data/dataProvider";
import Database from "better-sqlite3";
import { postAccount } from "./data/manipulate";

const PORT = process.env.PORT || 3000;

const app: Express = express();
const server = http.createServer(app);
const wss = new WebSocketServer({server});
const db = new Database("./dist/gooberts.db");

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
})


// ===== GET Requests =====
app.get("/gooberts", async (request: Request, response: Response) =>{
    const pidString = request.query.pid;
    const pid = pidString as string;
    const slotString = request.query.slot;
    let slot: number = slotString as unknown as number;

    const data = await getSaveState({pid: pid, saveSlot: slot, data: {}});
    response.status(200).json(data);
});
app.get("/users", async (request: Request, response: Response) => {
    console.log("Getting " + request.query.pid);
    const pidString = request.query.pid;
    const pid = pidString as string;

    const data = await getUser(pid);
    console.log(data);
    response.status(200).json(data);
})


// ===== POST and PUT Gooberts
app.post("/gooberts", async (request: Request, response: Response) =>{
    console.log("Creating a goobert...");
    const req = await JSON.parse(request.body.body);
    const data = await createGoobert(req);

    response.status(201).json(data);
});
app.put("/gooberts", async (request: Request, response: Response) =>{
    const req = await JSON.parse(request.body.body);
    let data: any;
    if(req.data.goobertId != undefined) { // Update one stat
        console.log("Updating " + req.data.goobertId + " " + req.data.stat + " to " + req.data.value);
        data = await updateGoobertProperty(req);
    } else { // Update all stats
        console.log("Updating " + req.data.id + ".");
        data = await updateGoobert(req);
    }

    response.status(201).json(data);
});

// POST Goobert deaths to the graveyard
app.post("/graveyard", async (request: Request, response: Response) =>{
    const req = await JSON.parse(request.body.body);
    
    console.log("Killing " + req.data.id);
    postToGraveyard(req);
    const data = await deleteGoobert(req);
    
    response.status(201).json(data);
});

// ===== POST and PUT Users =====
app.post("/users", async (request: Request, response: Response) => {
    const req = await JSON.parse(request.body.body);
    let result;
    if(req.username && req.password) {
        result = await createAccount(req.pid, req.username, req.password);
    } else {
        console.log("Creating User...");
        result = await createUser(req.pid);
    }
    if(result) {
        response.status(201).json({message: "User created successfully!"});
    } else {
        response.status(403).json({message: "Username already taken."});
    }
});
app.put("/users", async (request: Request, response: Response) => {
    const req = await JSON.parse(request.body.body);
    const data = updateUser(req);

    response.status(201).json(data);
});

// ===== DELETE Save Data =====
app.delete("/gooberts", async (request: Request, response: Response) =>{
    const pidString = request.query.pid;
    const pid = pidString as string;
    const slotString = request.query.slot;
    const slot = parseInt(slotString as string);
    const goobertId = request.query.goobertId;

    const data = deleteGoobert({pid: pid, saveSlot: slot, data: goobertId});

    response.status(201).json(data);
});
app.delete("/graveyard", async (request: Request, response: Response) =>{
    const pidString = request.query.pid;
    const pid = pidString as string;
    const slotString = request.query.slot;
    const slot = parseInt(slotString as string);

    const data = deleteGraveyard({pid: pid, saveSlot: slot});

    response.status(201).json(data);
});


// ===== WebSocket Connections =====
wss.on("connection", (observer: WebSocket) => {
    console.log("User connected!");
    
    const pid = "pid" + new Date().getTime();

    observer.send(encodeMessage("connect", pid));
    observer.on("message", (message) => {
        const data = message;
    })
    
});
const encodeMessage = (type: string, data: any) => {
    return JSON.stringify({type: type, content: data});
}

const parseMessage = (messageType: string, data: any) => {
    switch (messageType) {
        case "":

        break;

        default:
            break;
    }
}

server.listen(PORT, () => {
    console.log(`HTTP & WS server running on http://localhost:${PORT}`);
});

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  // 1. Stop accepting new HTTP connections
  server.close(() => {
    console.log('HTTP server closed.');

    // 2. Close the database once active requests finish
    try {
      db.close();
      console.log('Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
  });
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));