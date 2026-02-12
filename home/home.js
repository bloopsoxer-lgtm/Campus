const chat = document.getElementById("chat")
const profile = document.getElementById("profile")
const config = document.getElementById("config")
const info = document.getElementById("info")
const room = document.getElementById("room")

chat.addEventListener("click", function() {
    window.location.href = "/home/chat.html";
});

profile.addEventListener("click", function() {
    window.location.href = "/home/profile.html";
});

config.addEventListener("click", function() {
    window.location.href = "/home/config.html";
});

info.addEventListener("click", function() {
    window.location.href = "/home/about.html";
});

room.addEventListener("click", function() {
    window.location.href = "/home/room.html";
});
