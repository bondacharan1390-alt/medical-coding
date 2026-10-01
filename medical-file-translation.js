document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navbar');
    if (!toggle || !navigation) return;
    toggle.addEventListener('click', () => {
        const open = navigation.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        toggle.innerHTML = open ? '<i class="fas fa-times" aria-hidden="true"></i>' : '<i class="fas fa-bars" aria-hidden="true"></i>';
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => navigation.classList.remove('open')));
});
