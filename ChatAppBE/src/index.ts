
import { WebSocketServer,WebSocket } from "ws";

const wss = new WebSocketServer({port:8000});

const users:WebSocket[] = [];

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