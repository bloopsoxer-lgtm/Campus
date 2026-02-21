(function(){
    function applyMode(mode) {
        const html = document.documentElement;
        html.classList.remove('dia','noite');
        document.body && document.body.classList.remove('dia','noite');
        html.classList.add(mode);
        if (document.body) document.body.classList.add(mode);
        html.setAttribute('data-theme', mode);
    }

    const initial = localStorage.getItem('mode') === 'noite' ? 'noite' : 'dia';
    applyMode(initial);

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyMode(initial));

    window.addEventListener('storage', (e) => {
        if (e.key === 'mode') applyMode(e.newValue === 'noite' ? 'noite' : 'dia');
    });
})();
