// Wait for both DOM content and header to be loaded
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    // If elements don't exist yet, try again after a short delay
    if (!mobileMenuToggle || !mainNav) {
        setTimeout(initMobileMenu, 100);
        return;
    }
    
    // Check if already initialized
    if (mobileMenuToggle.dataset.initialized === 'true') {
        return;
    }
    
    const menuLinks = document.querySelectorAll('.menu a');
    let overlay = document.querySelector('.overlay');
    
    // Create overlay if it doesn't exist
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    // Mark as initialized
    mobileMenuToggle.dataset.initialized = 'true';

    // Toggle mobile menu
    function toggleMenu() {
        const isOpening = !mainNav.classList.contains('active');
        
        // Toggle classes
        mobileMenuToggle.classList.toggle('active', isOpening);
        mainNav.classList.toggle('active', isOpening);
        overlay.classList.toggle('active', isOpening);
        document.body.classList.toggle('menu-open', isOpening);
        
        // Update aria-expanded attribute for accessibility
        mobileMenuToggle.setAttribute('aria-expanded', isOpening);
        
        // Set focus to the first menu item when opening
        if (isOpening) {
            setTimeout(() => {
                const firstLink = mainNav.querySelector('a');
                if (firstLink) firstLink.focus();
            }, 100);
        } else {
            // Return focus to menu button when closing
            mobileMenuToggle.focus();
        }
    }

    // Close menu when clicking outside
    function closeMenu() {
        if (mainNav.classList.contains('active')) {
            toggleMenu();
        }
    }

    // Event Listeners
    function handleMenuToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    }

    // Remove any existing event listeners to prevent duplicates
    mobileMenuToggle.removeEventListener('click', handleMenuToggle);
    overlay.removeEventListener('click', closeMenu);
    
    // Add event listeners
    mobileMenuToggle.addEventListener('click', handleMenuToggle);
    overlay.addEventListener('click', closeMenu);

    // Close menu when a menu item is clicked
    menuLinks.forEach(link => {
        link.removeEventListener('click', closeMenu); // Remove old listener
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Update active state for current page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Close menu when pressing Escape key
    function handleKeyDown(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMenu();
        }
    }
    
    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);
    
    // Close menu when window is resized to desktop
    let resizeTimer;
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        }, 250);
    }
    
    window.removeEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
}

// Initialize the mobile menu when the page loads
function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        // DOMContentLoaded has already fired
        initMobileMenu();
    }
}

// Start initialization
init();

// Also reinitialize if the DOM is modified (for dynamic content loading)
const observer = new MutationObserver(() => {
    if (document.querySelector('.mobile-menu-toggle')) {
        initMobileMenu();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
