const socket = io();

const textField = document.getElementById("chatText");
const messageSubmitButton = document.getElementById("messageSubmitButton");
const form = document.querySelector("form");
const sendLocation = document.getElementById("send-location");
const messages = document.getElementById("all-messages");

// templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const urlTemplate = document.getElementById("url-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { userName, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  // new message element
  const newMessage = messages.lastElementChild;

  // heigh of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = messages.offsetHeight;

  // height of the container
  const containerHeight = messages.scrollHeight;

  //how far have the user scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }

  console.log(newMessageHeight);
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    userName: message.userName,
    createdAt: moment(message.createdAt).format("hh:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(urlTemplate, {
    userName: message.userName,
    title: `Location`,
    url: message.url,
    createdAt: moment(message.createdAt).format("hh:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  messageSubmitButton.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", textField.value, (error) => {
    messageSubmitButton.removeAttribute("disabled");
    if (error) {
      return console.log(error);
    }
    console.log("Message was delivered");
    textField.value = "";
    textField.focus();
  });
});

sendLocation.addEventListener("click", () => {
  sendLocation.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        sendLocation.removeAttribute("disabled");
        console.log("Coordinates delivered successfully");
      }
    );
  });
});

socket.emit("join", { userName, room }, (error) => {
  if (error) {
    console.log(error);
    alert(error);
    location.href = "/";
  }
});

//
