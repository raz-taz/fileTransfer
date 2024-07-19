const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.get('/', (req, res) => {
    res.send('Server is running');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    let fileStream;
    let fileName;

    socket.on('start-upload', (data) => {
        fileName = data.fileName;
        fileStream = fs.createWriteStream(path.join(UPLOAD_DIR, fileName));
        console.log('Starting upload:', fileName);
    });

    socket.on('upload-chunk', (data) => {
        fileStream.write(Buffer.from(new Uint8Array(data.chunk)));
        socket.emit('chunk-received', { receivedSize: data.chunk.length });
    });

    socket.on('end-upload', () => {
        fileStream.end();
        console.log('Upload completed:', fileName);
        socket.emit('file-upload-status', { success: true, message: 'File uploaded successfully.' });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, '127.0.0.1', () => {
    console.log('listening on *:3000');
});
