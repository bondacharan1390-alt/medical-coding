/* ==========================================================================
   MEDICODE SERVICES - MAIN JAVASCRIPT (js/script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --------------------------------------------------
    // 1. Responsive Mobile Menu Toggle
    // --------------------------------------------------
    const header = document.querySelector('.header');
    const headerContainer = document.querySelector('.header .container');
    const navbar = document.querySelector('.navbar');

    // Create mobile menu toggle button dynamically if missing in HTML
    let menuToggle = document.querySelector('.mobile-menu-toggle');
    if (!menuToggle && headerContainer) {
        menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        headerContainer.insertBefore(menuToggle, navbar);
    }

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('open');
            const isOpen = navbar.classList.contains('open');
            menuToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        // Close dropdown when clicking outside navigation
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && navbar.classList.contains('open')) {
                navbar.classList.remove('open');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // --------------------------------------------------
    // 2. Header Scroll Shadow Effect
    // --------------------------------------------------
    const handleHeaderScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);

    // --------------------------------------------------
    // 3. Smooth Scrolling for Internal Links
    // --------------------------------------------------
    const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                e.preventDefault();

                // Close mobile dropdown menu if active
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
    // 4. Staggered Scroll Animation for Service Cards
    // --------------------------------------------------
    const serviceCards = document.querySelectorAll('.service-card');

    if ('IntersectionObserver' in window && serviceCards.length > 0) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        };

        const cardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        serviceCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s, box-shadow 0.3s ease`;
            cardObserver.observe(card);
        });
    }

    // --------------------------------------------------
    // 5. Active Link Highlight on Scroll (Scrollspy)
    // --------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar ul li a');

    const updateActiveLink = () => {
        const scrollPosition = window.pageYOffset + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    } else if (link.getAttribute('href').startsWith('#')) {
                        link.classList.remove('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink);
});