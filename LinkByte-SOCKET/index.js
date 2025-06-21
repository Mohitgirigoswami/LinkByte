const { Server: IOServer } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const beurl = process.env.BEURL;
const io = new IOServer(server, {
    cors: {
        origin: [beurl , "https://link-byte-nine.vercel.app"]
    }
});


const server = http.createServer((req, res) => {
    // Health check route
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), timestamp: new Date() }));
        return; // Important: return to prevent further processing
    }

    // Optional: Serve a simple HTML page or 404 for other HTTP requests
    // If your server is ONLY for WebSockets, you might just return 404 for other paths
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
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
fetch(`${beurl}/api/messages`, {
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