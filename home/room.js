const home = document.getElementById("cancel")
const create = document.getElementById("enter")

home.addEventListener("click", function() {
    window.location.href = "/home/";
});

create.addEventListener("click", function() {
    const codeInput = document.getElementById("codeInput");
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;
    fetch(`/create?code=CAMPUS`);
    window.location.href = `/home/chat.html?code=${code}`;
});