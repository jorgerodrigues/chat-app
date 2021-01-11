const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUsers, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

io.on("connection", (socket) => {
  console.log("New connection detected!!");

  socket.on("join", ({ userName, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, userName, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast.to(user.room).emit("message", generateMessage(`${user.userName} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    const user = getUsers(socket.id);

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    io.to(user.room).emit("message", generateMessage(user.userName, message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUsers(socket.id);
    io.to(user.room).emit("locationMessage", generateLocationMessage(user.userName, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
    callback();
  });

  socket.on("disconnect", () => {
    const removedUser = removeUser(socket.id);
    if (removedUser) {
      io.to(removedUser.room).emit("message", generateMessage(`${removedUser.userName} has left`));
      io.to(removedUser.room).emit("roomData", {
        room: removedUser.room,
        users: getUsersInRoom(removedUser.room),
      });
    }
  });
});

app.use(express.static(publicDirectoryPath));

server.listen(port, () => {
  console.log("Application is live on http://localhost:3000");
});
