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

        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && navbar.classList.contains('open')) {
                navbar.classList.remove('open');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // --------------------------------------------------
    // 2. Sticky Header Scroll Effect
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
    // 3. Smooth Scroll for Anchor Links
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
    // 4. Statistics Animated Counter
    // --------------------------------------------------
    const statCards = document.querySelectorAll('.stat-card h2');
    let hasAnimatedStats = false;

    const animateCounters = () => {
        statCards.forEach(counter => {
            const targetText = counter.innerText.trim();
            const hasPlus = targetText.includes('+');
            const hasPercent = targetText.includes('%');
            const hasK = targetText.includes('K');

            // Parse target numerical value
            let numericValue = parseFloat(targetText.replace(/[^0-9.]/g, ''));
            if (hasK) numericValue = numericValue * 1000;

            let startValue = 0;
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Ease-out function for smooth counter effect
                const easeOutProgress = 1 - Math.pow(1 - progress, 3);
                let currentValue = Math.floor(easeOutProgress * numericValue);

                // Format display text
                let displayText = currentValue;
                if (hasK) {
                    displayText = (currentValue / 1000).toFixed(0) + 'K';
                }
                if (hasPlus) displayText += '+';
                if (hasPercent) displayText += '%';

                counter.innerText = displayText;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = targetText; // Ensure exact final text
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    // Trigger stat counters when the section comes into view
    const statsSection = document.querySelector('.statistics');
    if (statsSection && 'IntersectionObserver' in window) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimatedStats) {
                    hasAnimatedStats = true;
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(statsSection);
    }

    // --------------------------------------------------
    // 5. Scroll Animations for Cards (Fade & Slide In)
    // --------------------------------------------------
    const animatedElements = document.querySelectorAll('.service-card, .why-card, .process-card');

    if ('IntersectionObserver' in window && animatedElements.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
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

        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease';
            cardObserver.observe(el);
        });
    }
});