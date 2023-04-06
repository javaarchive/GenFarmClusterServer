import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

let socketData = new Map();

io.on("connection", function (socket) {
    socketData.set(socket.id, {
        name: socket.id,
        runningTasks: [],
        weight: 1,
        joinedAt: Date.now()
    });
    socket.on("controller", function(){
        let cData = socketData.get(socket.id);
        cData.weight = 0;
        if(cData.runningTasks.length){
            // redist tasks

        }
    });
    socket.on("rename", function(name){
        socketData.get(socket.id).name = name;
    });
    socket.on("modify", function(target, overlay, cb = null){
        socketData.set(target, Object.assign(socketData.get(target), overlay));
        if(cb) cb(socketData.get(target));
    });
    socket.on("requestNodeData", function(onSocketData){
        onSocketData(Array.from(socketData.entries()).map(pair => {
            let data = pair[1];
            data.sid = pair[0];
            return data;
        }));
    });
    socket.on("ping", function(cd, cb) {
        cd.serverTime = Date.now();
        cb(cd);
    });
    socket.on("disconnect",function(){
        // TODO: redist tasks
        let forgotTasks = socketData.get(socket.id).runningTasks;
        socketData.delete(socket.id);
    });
});

app.get("/", function (req, res) {
    if(req.query.a != "test"){
        console.log("bad req");
        res.status(400).send("antiscrape lol. ").end();
        return;
    }
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});
app.use(express.static("public"));

server.listen(3137, function () {
    console.log("listening on 127.0.0.1:3137");
});