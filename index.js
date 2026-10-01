document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const headerContainer = document.querySelector('.header .container');
    const navbar = document.querySelector('.navbar');

    if (header && headerContainer && navbar) {
        const menuToggle = document.createElement('button');
        menuToggle.type = 'button';
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
        headerContainer.insertBefore(menuToggle, navbar);

        const closeMenu = () => {
            navbar.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open navigation menu');
            menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
        };

        menuToggle.addEventListener('click', () => {
            const isOpen = navbar.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
            menuToggle.innerHTML = isOpen
                ? '<i class="fas fa-times" aria-hidden="true"></i>'
                : '<i class="fas fa-bars" aria-hidden="true"></i>';
        });

        document.addEventListener('click', (event) => {
            if (!header.contains(event.target)) closeMenu();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMenu();
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) closeMenu();
        });

        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            const offset = header ? header.offsetHeight : 0;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        });
    });

    const form = document.querySelector('.contact-form form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            const button = form.querySelector('button[type="submit"]');
            if (!button) return;
            const label = button.textContent;
            button.disabled = true;
            button.textContent = 'Sending...';
            window.setTimeout(() => {
                form.reset();
                button.disabled = false;
                button.textContent = label;
                alert('Thank you! Your message has been sent successfully.');
            }, 700);
        });
    }

});
