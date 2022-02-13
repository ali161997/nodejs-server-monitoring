/*jshint esversion: 6 */
import express from 'express';
const app = express();
import http, { STATUS_CODES } from 'http';
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
const usersRoom = 12345;
const adminRoom = 67891;

app.get('/user', (req, res) => {
  res.sendFile(__dirname + '/user.html');
});
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

io.on('connection', (socket) => {
  socket.on('joinAdmin', ({ name }, callback) => {
    socket.join(adminRoom);
    console.log('admin joined', name);
    socket.on('disconnect', (reason) => {
      console.log(`${name} disconnected from admin =>${reason}`);
    });
    setInterval(() => {
      // **from library processs
      socket.to(adminRoom).emit('data', {
        resources: resourceUsage(),
        cpu: cpuUsage(),
        memory: memoryUsage(),
        eventloop: eventLoopStats.sense(),
      });
    }, 5000);
  });
  socket.on('joinUser', ({ name }, callback) => {
    console.log('joined', name);
    socket.join(usersRoom);
    io.to(adminRoom).emit('join', {
      name,
    });
    socket.on('disconnect', (reason) => {
      console.log('disconnection', reason, name);
      console.log(`${name} disconnected from users =>${reason}`);
      io.to(adminRoom).emit('leave', {
        name: name,
        reason: reason,
      });
    });
  });
  // ** send current memory and cpu usage usage for every 5000 millisconds
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});
