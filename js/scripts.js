window.addEventListener('DOMContentLoaded', event => {

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
