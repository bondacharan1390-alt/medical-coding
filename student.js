/* ==========================================================================
   MEDICODE SERVICES - MAIN JAVASCRIPT (js/script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // 1. Mobile Navigation Toggle
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
        
        // Dynamic styling for mobile toggle button
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
    // 3. Student Portal Form Processing & Authentication Mock
    // --------------------------------------------------
    const portalForm = document.querySelector('.portal-form');

    if (portalForm) {
        portalForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const studentIdInput = document.getElementById('student-id');
            const passwordInput = document.getElementById('password');
            const submitBtn = portalForm.querySelector('.btn-portal');

            const studentId = studentIdInput.value.trim();
            const password = passwordInput.value.trim();

            // Validation check
            if (!studentId || !password) {
                alert('Please enter both your Student ID/Email and Password.');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            // Visual feedback on submission
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            submitBtn.disabled = true;

            // Mock authentication delay
            setTimeout(() => {
                alert(`Welcome back, ${studentId}! Redirecting to your student dashboard...`);
                
                // Reset form fields
                portalForm.reset();
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;

                // Example redirection logic:
                // window.location.href = "dashboard.html";
            }, 1500);
        });
    }

    // --------------------------------------------------
    // 4. Contact Form Handler (Fallback for Contact Page)
    // --------------------------------------------------
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = contactForm.querySelector('input[placeholder="Full Name"]');
            const emailInput = contactForm.querySelector('input[placeholder="Email Address"]');
            const phoneInput = contactForm.querySelector('input[placeholder="Phone Number"]');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim()) {
                alert('Please fill in all required fields.');
                return;
            }

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                alert('Thank you! Your message has been sent successfully.');
                contactForm.reset();
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }, 1200);
        });
    }

    // --------------------------------------------------
    // 5. Scroll Reveal Animations
    // --------------------------------------------------
    const revealElements = document.querySelectorAll('.portal-card, .contact-info, .contact-form');

    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach((element) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(25px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            revealObserver.observe(element);
        });
    }
});