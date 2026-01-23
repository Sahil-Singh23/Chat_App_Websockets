import express from "express";
import { WebSocketServer,WebSocket } from "ws";
import cors from 'cors';
import random from "./utils.js";
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

const app = express();
app.use(express.json());
app.use(cors());

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
const wss = new WebSocketServer({server});


interface Message{
    msg: string,
    user: string,
    time:number,
    sessionId: string,
}
interface RoomData{
    messageHistory: Message[],
    createdAt: number,
    clientsMap: Map<string,ClientInfo>
}
interface ClientInfo{
    socket: WebSocket,
    user: string,
    lastSeen: number,
    lastMessageTime: number,
    disconnectTimeout?: NodeJS.Timeout 
}

const rooms = new Map<string,RoomData>();
// const rooms = new Map<string,Set<WebSocket>>();
const clients = new Map<WebSocket,{user:string,roomCode:string, sessionId:string}>();

// Health check endpoint for Railway
app.get("/", (req,res)=>{
    res.json({status: "ok", message: "Chat server is running"})
})

app.post("/api/v1/create", (req,res)=>{
    const roomCode = random(6);
    rooms.set(roomCode,{
        messageHistory: [],
        createdAt: Date.now(),
        clientsMap: new Map<string,ClientInfo>()
    });
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
    //console.log("User connected ");
    socket.on("message",(e)=>{
        let data;
        try{
            data = JSON.parse(e.toString());
        }catch(e){
            socket.send("Invalid request")
            return;
        }
        if(data.type==="join"){
            const {roomCode,username,sessionId} = data.payload || {};
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
            clients.set(socket,{user:username,roomCode,sessionId});
            rooms.get(roomCode)!.clientsMap.set(sessionId,{
                socket:socket,
                user:username,
                lastSeen: Date.now(),
                lastMessageTime: Date.now()
            });
            const pastMsgs = rooms.get(roomCode)?.messageHistory;
            const userCount = rooms.get(roomCode)?.clientsMap.size;
            socket.send(JSON.stringify({
                type: "joined",
                payload: {
                    roomCode,
                    user: username,
                    userCount,
                    pastMsgs
                }
            }));
            let sockets: Map<string,ClientInfo> = rooms.get(roomCode)!.clientsMap;

            for(const cur of sockets){
                if(cur[0]!=sessionId){
                    cur[1].socket.send(JSON.stringify({
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
            const {msg} = data.payload || {};
            if (!msg || typeof msg !== "string") {
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Invalid message" }
                }));
                return;
            }
            const {user,roomCode,sessionId} = client
            const roomData = rooms.get(roomCode);
            if(!roomData) return ; 
            const time = Date.now();

            const msgObj : Message ={
                msg:msg,
                user,
                time,
                sessionId
            }
            roomData.messageHistory.push(msgObj);
            if(roomData.messageHistory.length > 100) {
                roomData.messageHistory.shift();
            }
            const sendingData = {type: "message",payload:msgObj} 
            let sockets: Map<string,ClientInfo> = rooms.get(roomCode)!.clientsMap;
            if(!sockets) return;
            for(const cur of sockets){
                cur[1].socket.send(JSON.stringify(sendingData)); 
            }
        } else if(data.type==="reconnect"){
            const {roomCode,sessionId,lastMessageTime} = data.payload || {};

            // Check if room exists
            // Check if sessionId was in this room before
            // Replace old socket with new socket
            // Send missed messages
            if(!sessionId) return;
            if(!roomCode || !rooms.get(roomCode)){
                socket.send(JSON.stringify({
                    type:"error",
                    payload:{
                        message:"Room closed"
                    }
                }))
                return;
            }
            const roomData = rooms.get(roomCode)
            if(!roomData) return;
            const userData : ClientInfo| undefined= roomData.clientsMap.get(sessionId);
            if(!userData){
                socket.send(JSON.stringify({
                    type:"error",
                    payload:{
                        message:"session expired"
                    }
                }))
                return;
            }
        
            if (userData.disconnectTimeout) {
                clearTimeout(userData.disconnectTimeout);
                
            }
            const oldSocket = userData.socket;
            oldSocket.close();
            const msgsToSend =roomData.messageHistory
                // roomData.messageHistory.filter(
                //     msg => msg.time > lastMessageTime 
                // );
            
            roomData?.clientsMap.set(sessionId,{
                socket,
                user: userData.user,
                lastSeen: Date.now(),
                lastMessageTime,
            });
            clients.set(socket, {user: userData.user, roomCode, sessionId});
            socket.send(JSON.stringify({
                type: "reconnected",
                payload:{
                    user: userData.user,
                    roomCode,
                    userCount: roomData?.clientsMap.size,
                    msgsToSend
                }
            }))
        } else if(data.type==="typing"){
            const clientData = clients.get(socket);
            if(!clientData) return;
            const {user,roomCode,sessionId} = clientData
            const roomData = rooms.get(roomCode);
            const roomClients = roomData?.clientsMap;
            if(!roomClients) return;
            for(let cur of roomClients){
                if(cur[1].socket!=socket){
                    cur[1].socket.send(JSON.stringify({
                        type: "typing",
                        payload:{
                            user,
                            isTyping: true
                        }
                    }))
                }
            }
            

        }
    })
    socket.on("close",()=>{
        const client = clients.get(socket);
        if(!client) return;
        
        const {user, roomCode, sessionId} = client;
        // Mark lastSeen timestamp
        // Set 30-second timeout
        // If no reconnect in 30s → then broadcast "user-left"
        const roomData = rooms.get(roomCode);
        if(!roomData) return;
        const clientData = roomData.clientsMap.get(sessionId);
        if(!clientData) return;
        clientData.lastSeen = Date.now();

        function deleteUser(){
            clients.delete(socket);
            roomData?.clientsMap.delete(sessionId);
            const roomClients = roomData?.clientsMap;
            if(roomClients && roomClients.size>0){
                for(const cur of roomClients){
                    cur[1].socket.send(JSON.stringify({
                    type:"user-left",
                    payload:{
                        user,
                        userCount:roomClients.size
                    }
                }))
                }
            }if(roomClients?.size===0){
                rooms.delete(roomCode);
            }
        }

        const timer = setTimeout(deleteUser,60*1000);
        clientData.disconnectTimeout = timer;
    })
}) 




 