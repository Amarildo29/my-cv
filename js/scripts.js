window.addEventListener('DOMContentLoaded', event => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Reading progress bar
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    document.body.appendChild(scrollProgress);

    const updateScrollProgress = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollRange > 0 ? Math.min(scrollTop / scrollRange, 1) : 0;
        scrollProgress.style.transform = `scaleX(${progress})`;
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    // Scroll reveal animation for section content
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealTargets = [];

        document.querySelectorAll('.resume-section .resume-section-content').forEach((contentBlock) => {
            Array.from(contentBlock.children).forEach((child, index) => {
                child.classList.add('scroll-reveal');
                child.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 65}ms`);
                revealTargets.push(child);
            });
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px',
        });

        revealTargets.forEach((target) => revealObserver.observe(target));
    }

    // Set footer year dynamically
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = String(new Date().getFullYear());
    }

    // Share the current page URL (Web Share API + clipboard fallback)
    const sharePageBtn = document.querySelector('.share-page-btn');
    if (sharePageBtn) {
        const defaultTitle = sharePageBtn.getAttribute('title') || '';
        const copiedTitle = sharePageBtn.dataset.copiedTitle || 'Copied!';

        const showCopiedState = () => {
            sharePageBtn.classList.add('is-copied');
            sharePageBtn.setAttribute('title', copiedTitle);
            window.setTimeout(() => {
                sharePageBtn.classList.remove('is-copied');
                sharePageBtn.setAttribute('title', defaultTitle);
            }, 1400);
        };

        sharePageBtn.addEventListener('click', async () => {
            const shareData = {
                title: document.title,
                text: document.title,
                url: window.location.href,
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                    return;
                }

                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                    showCopiedState();
                    return;
                }

                window.prompt('Copy this URL:', window.location.href);
            } catch (error) {
                // Ignore cancellation/errors from system share dialogs
            }
        });
    }

});
