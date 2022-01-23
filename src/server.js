import express from 'express';
const app = express();
import http from 'http';
import eventLoopStats from 'event-loop-stats';
import { resourceUsage, cpuUsage, memoryUsage } from 'process';
import json from 'body-parser';
const server = http.createServer(app);
import { Server } from 'socket.io';
const io = new Server(server);
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', (reason) => {
    console.log('user disconnected');
    console.log(reason);
  });
  // ** send current memory and cpu usage usage for every 500 millisconds
  setInterval(() => {
    // **from library processs
    io.emit('resource', resourceUsage());
    io.emit('cpu', cpuUsage());
    io.emit('memory', memoryUsage());
    // ** from event-loop-stats package
    io.emit('eventloop', eventLoopStats.sense());
  }, 5000);
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
