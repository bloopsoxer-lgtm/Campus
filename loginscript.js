const button = document.getElementById("enter");

enter.addEventListener("click", function() {
    window.location.href = "/home/";
    
});

const codeInput = document.getElementById("code");
if (codeInput) {
    codeInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
}