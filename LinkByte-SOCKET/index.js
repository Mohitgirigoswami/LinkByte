const { Server: IOServer } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const server = http.createServer();
const io = new IOServer(server, {
    cors: {
        origin: "*"
    }
});
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            socket.sub = decoded.sub;
            socket.token = token
            next();
            console.log(socket.sub)
        } catch (err) {
            console.error("Authentication error:", err.message);
            const authError = new Error("Authentication failed");
            authError.data = { message: "Invalid or expired token" };
            next(authError); 
        }
    } else {
        console.warn("Authentication error: No token provided");
        const authError = new Error("Authentication failed");
        authError.data = { message: "No token provided" };
        next(authError);
    }
});
io.on('connection', (socket) => {
    socket.join(socket.sub);

    socket.on('message', (data) => {
        if(!data.uuid){
            return;
        }
fetch('http://localhost:5000/api/messages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${socket.token}`
    },
    body: JSON.stringify(data)
})
.then(async response => {
    if (response.ok) {
        const responseData = await response.json(); // Parse the JSON response
        console.log('Message saved successfully:', responseData);
        io.to(data.uuid).emit('message', {...data,'from':socket.sub, msg_uuid: responseData.msg_uuid});
    } else {
        socket.emit('error', { message: 'Failed to save message' });
    }
})
.catch(error => {
    socket.emit('error', { message: 'Error occurred while saving message', error: error.message });
});
console.log(data.uuid, data.msg);
});


socket.on('disconnect', (reason) => {
        console.log(`Client ${socket.sub ? socket.sub : 'unauthenticated'} disconnected. Reason: ${reason}`);
    });
});

server.listen(8000, () => {
    console.log('WebSocket server is running on ws://localhost:8000');
});