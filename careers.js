/* ==========================================================================
   MEDICODE SERVICES - MAIN JAVASCRIPT (js/script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // 1. Mobile Menu Toggle
    // --------------------------------------------------
    const header = document.querySelector('.header');
    const headerContainer = document.querySelector('.header .container');
    const navbar = document.querySelector('.navbar');

    // Create and insert hamburger toggle button dynamically if not present in HTML
    let menuToggle = document.querySelector('.mobile-menu-toggle');
    if (!menuToggle && headerContainer) {
        menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Basic styling for the dynamic mobile toggle button
        menuToggle.style.display = 'none';
        menuToggle.style.background = 'none';
        menuToggle.style.border = 'none';
        menuToggle.style.fontSize = '22px';
        menuToggle.style.color = 'var(--primary-dark)';
        menuToggle.style.cursor = 'pointer';

        headerContainer.insertBefore(menuToggle, navbar);
    }

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('open');
            const isOpen = navbar.classList.contains('open');
            menuToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && navbar.classList.contains('open')) {
                navbar.classList.remove('open');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // --------------------------------------------------
    // 2. Sticky Header Elevation Effect
    // --------------------------------------------------
    const handleHeaderScroll = () => {
        if (window.scrollY > 30) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);

    // --------------------------------------------------
    // 3. Smooth Scrolling for In-Page Anchor Links
    // --------------------------------------------------
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                e.preventDefault();

                // Close mobile menu if open
                if (navbar && navbar.classList.contains('open')) {
                    navbar.classList.remove('open');
                    if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }

                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --------------------------------------------------
    // 4. Career Application Button Handlers
    // --------------------------------------------------
    const applyButtons = document.querySelectorAll('.career-card .btn');

    applyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const jobTitle = button.parentElement.querySelector('h3').innerText;
            
            // Redirect to contact/careers form page or open an alert
            const confirmApply = confirm(`You are applying for the position: ${jobTitle}.\n\nWould you like to proceed to the contact form?`);
            if (confirmApply) {
                window.location.href = `contact.html?job=${encodeURIComponent(jobTitle)}`;
            }
        });
    });

    // --------------------------------------------------
    // 5. Scroll Reveal Animation for Career Cards
    // --------------------------------------------------
    const careerCards = document.querySelectorAll('.career-card');

    if ('IntersectionObserver' in window && careerCards.length > 0) {
        const cardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        careerCards.forEach((card) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            cardObserver.observe(card);
        });
    }
});