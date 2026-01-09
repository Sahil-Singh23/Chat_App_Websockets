import express from "express";
import { WebSocketServer,WebSocket } from "ws";
import cors from 'cors';
import random from "./utils.js";

const wss = new WebSocketServer({port:8000});

const app = express();
app.use(express.json());
app.use(cors());


const rooms = new Map<string,Set<WebSocket>>();



const users:WebSocket[] = []; 

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
    users.push(socket);
    //console.log(users);
    socket.on("message",(e)=>{
        for(let i=0 ; i<users.length ; i++){
            if(users[i]!==socket){
                users[i]!.send(e.toString());
            }
        }
    })
    socket.on("close",()=>{
        const idx = users.indexOf(socket);
        if(idx!=-1){
            users.splice(idx,1);
        }
    })
})