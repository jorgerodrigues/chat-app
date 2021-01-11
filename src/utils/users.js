const users = [];

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, userName, room }) => {
  // clean the data
  userName = userName.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data

  if (!userName || !room) {
    return {
      error: "Username and room are required!",
    };
  }
  // check for existing user

  const existingUser = users.find((user) => {
    return user.room === room && user.userName === userName;
  });

  if (existingUser) {
    return {
      error: "This username is already taken",
    };
  }

  // store user

  const user = { id, userName, room };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUsers = (id) => {
  const userFound = users.find((user) => {
    if (user.id === id) {
      return user;
    }
  });
  return userFound;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => {
    return user.room === room;
  });
};

module.exports = {
  addUser,
  removeUser,
  getUsers,
  getUsersInRoom,
};
