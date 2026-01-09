import express from "express";
import { WebSocketServer,WebSocket } from "ws";
import cors from 'cors';
import random from "./utils.js";

const wss = new WebSocketServer({port:8000});

const app = express();
app.use(express.json());
app.use(cors());


const rooms = new Map<string,Set<WebSocket>>();


app.post("/api/v1/create", (req,res)=>{
    const roomCode = random(6);
    rooms.set(roomCode,new Set<WebSocket>());
    res.json({
        roomCode
    })
})

app.post("/api/v1/:roomCode",(req,res)=>{
    if(rooms.has(req.params.roomCode))
        return res.json({messsage:"Valid room"})
    else 
        return res.status(404).json({messsage:"Invalid room"})
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
            const room = data.roomCode;
            if(!room || !rooms.has(room)){
                socket.send("Invalid room");
                return;
            }
            if (rooms.get(room)?.has(socket)) return;

            if ((socket as any).roomCode) {
                socket.send("Already joined a room");
                return;
            }

            (socket as any).roomCode = room;
            rooms.get(room)?.add(socket);
        }else if(data.type==="message"){
            const room = (socket as any).roomCode;
            if (!room) {
                socket.send("Join a room first");
                return;
            }
            if(!data.message){
                socket.send("Empty message not allowed")
                return;
            }
            const sockets = rooms.get(room);
            if(!sockets) return;
            for(const cur of sockets){
                if(cur!=socket){
                    cur.send(data.message);
                }
            }
        }
    })
    socket.on("close",()=>{
        const room = (socket as any).roomCode;
        if(rooms.get(room)?.has(socket)) rooms.get(room)?.delete(socket);
        if(rooms.get(room)?.size === 0) rooms.delete(room);
    })
})

app.listen(8001);