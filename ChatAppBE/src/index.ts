import express from "express";
import { WebSocketServer,WebSocket } from "ws";
import cors from 'cors';
import random from "./utils.js";
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
const wss = new WebSocketServer({server});

const rooms = new Map<string,Set<WebSocket>>();
const clients = new Map<WebSocket,{user:string,roomCode:string}>();

// Health check endpoint for Railway
app.get("/", (req,res)=>{
    res.json({status: "ok", message: "Chat server is running"})
})

app.post("/api/v1/create", (req,res)=>{
    const roomCode = random(6);
    rooms.set(roomCode,new Set<WebSocket>());
    res.json({
        roomCode
    })
})

app.post("/api/v1/room/:roomCode",(req,res)=>{
    if(rooms.has(req.params.roomCode))
        return res.json({message:"Valid room"})
    else 
        return res.status(404).json({message:"Invalid room"})
})


wss.on("connection",(socket)=>{
    console.log("User connected ");
    socket.on("message",(e)=>{
        let data;
        try{
            data = JSON.parse(e.toString());
        }catch(e){
            socket.send("Invalid request")
            return;
        }
        if(data.type==="join"){
            const {roomCode,username} = data.payload || {};
           if(!data.payload) {
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Missing payload" }
                }));
                return;
            }
            if(!roomCode || !rooms.has(roomCode)){
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Invalid room" }
                }));

                return;
            }
            if(!username || typeof username !=='string'){
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Invalid username" }
                }));
                return;
            }
            if(clients.has(socket)){
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Already joined a room" }
                }));
                return;
            }
            clients.set(socket,{user:username,roomCode});
            rooms.get(roomCode)!.add(socket);
            const userCount = rooms.get(roomCode)?.size;
            socket.send(JSON.stringify({
                type: "joined",
                payload: {
                    roomCode,
                    user: username,
                    userCount
                }
            }));
            const sockets = rooms.get(roomCode)!;
            for(const cur of sockets){
                if(cur!=socket){
                    cur.send(JSON.stringify({
                    type: "user-joined",
                    payload: { user: username, userCount }
                }));
                }
            }

        }else if(data.type==="message"){
            const client = clients.get(socket);
            if(!client){
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Join a room first" }
                }));
                return;
            }
            const {msg, sessionId} = data.payload || {};
            if (!msg || typeof msg !== "string") {
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Invalid message" }
                }));
                return;
            }
            const {user,roomCode} = client
            const time = Date.now();
            const sockets = rooms.get(roomCode);
            if(!sockets) return;
            const sendingData = {type: "message",payload:{
                msg,
                user,
                time,
                sessionId
            }} 
            for(const cur of sockets){
                cur.send(JSON.stringify(sendingData)); 
            }
        }  
    })
    socket.on("close",()=>{
        const client = clients.get(socket);
        if(!client) return;
        const {user,roomCode} = client;
        rooms.get(roomCode)?.delete(socket);
        const remainingSockets = rooms.get(roomCode);
        if(remainingSockets && remainingSockets.size > 0 ){
            for(const cur of remainingSockets){
                cur.send(JSON.stringify({
                    type:"user-left",
                    payload:{
                        user,
                        userCount:remainingSockets.size
                    }
                }))
            }
        }
        if(rooms.get(roomCode)?.size === 0) rooms.delete(roomCode);
        clients.delete(socket);
        console.log("user left")
    })
}) 