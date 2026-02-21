const chat = document.getElementById("chat");
const profile = document.getElementById("profile");
const config = document.getElementById("config");
const info = document.getElementById("info");
const room = document.getElementById("room");
const mapa = document.getElementById("map");
const files = document.getElementById("notes");
const grafic = document.getElementById("grafics");

let codigo = "A1B234"

chat.addEventListener("click", function() {
    window.location.href = `/home/chat.html?code=${codigo}`;
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

mapa.addEventListener("click", function() {
    window.location.href = "/home/map.html";
});

files.addEventListener("click", function() {
    window.location.href = "/home/files.html";
});

grafic.addEventListener("click", function() {
    window.location.href = "/home/grafics.html";
});
