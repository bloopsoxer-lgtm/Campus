const home = document.getElementById("leave")

home.addEventListener("click", function() {
    window.location.href = "/home/";
});


document.addEventListener("DOMContentLoaded", () => {
    const toggleNight = document.getElementById("toggleNightMode");
    if (!toggleNight) return;
    
    function applyMode(mode) {
        const html = document.documentElement;
        html.classList.remove('dia', 'noite');
        document.body.classList.remove('dia', 'noite');
        if (mode === 'noite') {
            html.classList.add('noite');
            document.body.classList.add('noite');
            toggleNight.checked = true;
        } else {
            html.classList.add('dia');
            document.body.classList.add('dia');
            toggleNight.checked = false;
        }
        html.setAttribute('data-theme', mode);
    }

    const saved = localStorage.getItem('mode');
    applyMode(saved === 'noite' ? 'noite' : 'dia');

    toggleNight.addEventListener('change', () => {
        const mode = toggleNight.checked ? 'noite' : 'dia';
        applyMode(mode);
        localStorage.setItem('mode', mode);
    });

    const toggleNotif = document.getElementById('toggleNotifications');
    if (toggleNotif) {
        const notifSaved = localStorage.getItem('notifications');
        toggleNotif.checked = notifSaved === 'true';
        toggleNotif.addEventListener('change', () => {  
            localStorage.setItem('notifications', toggleNotif.checked ? 'true' : 'false');
        });
    }
});
