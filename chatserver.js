const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let chatters = [];

const sendToAllChatters = (msg, sender = null) => {
    const onlineUsers = chatters.map((client, index) => ({ id: index, name: client.username }));
    msg.online = onlineUsers;
    console.log(onlineUsers);

    chatters.forEach((client, index) => {
        client.id = index;
        const message = JSON.stringify(msg);
        if (client !== sender) {
            client.send(message);
        } else {
            client.send(JSON.stringify({ online: onlineUsers }));
            console.log(client.id);
        }
    });
};

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        console.log(`Data received: ${data}`);
        let msgToSend = {};
        const msgContent = JSON.parse(data);
        console.log(msgContent, typeof msgContent);

        if (msgContent.type === 'login') {
            ws.username = msgContent.username;
            console.log(ws.username);
            msgToSend.body = `${ws.username} has been connected`;
            msgToSend.type = 'login';
        } else if (msgContent.type === 'chat') {
            msgToSend.body = msgContent.body;
            msgToSend.type = 'chat';
        }

        sendToAllChatters(msgToSend, ws);
    });

    ws.on('close', () => {
        console.log(`${ws._socket.remoteAddress} closed`);
        chatters = chatters.filter(client => client !== ws);
        // Send message to all users that user has left
        let msgToSend = {};
        msgToSend.type = 'logout';
        msgToSend.body = `${ws.username} has been disconnected`;
        sendToAllChatters(msgToSend);
    });

    console.log(`${ws._socket.remoteAddress} connected`);
    chatters.push(ws);
    console.log(chatters);
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
