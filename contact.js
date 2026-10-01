/* ==========================================================================
   MEDICODE SERVICES - MAIN JAVASCRIPT (js/script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

    // --------------------------------------------------
    // 1. Mobile Menu Toggle
    // --------------------------------------------------
    const header = document.querySelector('.header');
    const headerContainer = document.querySelector('.header .container');
    const navbar = document.querySelector('.navbar');

    let menuToggle = document.querySelector('.mobile-menu-toggle');
    if (!menuToggle && headerContainer) {
        menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Inline layout fallback for the mobile button
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

        // Close navbar when clicking outside
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
    // 4. Contact Form Processing & Validation
    // --------------------------------------------------
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        // Pre-fill subject if redirected from a job application link
        const urlParams = new URLSearchParams(window.location.search);
        const jobParam = urlParams.get('job');
        const serviceParam = urlParams.get('service');
        const subjectInput = contactForm.querySelector('input[placeholder="Subject"]');
        if (serviceParam && subjectInput) {
            subjectInput.value = `Service Request: ${serviceParam}`;
        } else if (jobParam && subjectInput) {
            subjectInput.value = `Job Application: ${jobParam}`;
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const status = contactForm.querySelector('#contact-status');

            if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }

            // Visual feedback on submission
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            status.textContent = 'Sending your message...';
            try {
                const response = await fetch(`${apiBase}/api/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
                });
                const body = await response.text();
                let result;
                try { result = JSON.parse(body); } catch { result = { error: body || 'The backend returned an invalid response.' }; }
                if (!response.ok) throw new Error(result.error || 'Unable to send your message.');
                status.textContent = result.message;
                contactForm.reset();
            } catch (error) {
                status.textContent = error.message;
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // --------------------------------------------------
    // 5. Scroll Reveal Animation for Contact Section
    // --------------------------------------------------
    const contactCards = document.querySelectorAll('.contact-info, .contact-form');

    if ('IntersectionObserver' in window && contactCards.length > 0) {
        const contactObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        contactCards.forEach((card) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(25px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            contactObserver.observe(card);
        });
    }
});
