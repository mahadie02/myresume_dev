// apps/index.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContentArea = document.getElementById('main-content-area');
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer-container');

    const routes = {
        'home': 'pages/home.html',
        'projects': 'pages/projects.html',
        'resume': 'pages/resume.html',
        'contact': 'pages/contact.html'
    };

    const pageStyles = {
        'home': 'styles/home_style.css',
        'projects': 'styles/projects_style.css',
        'resume': 'styles/resume_style.css',
        'contact': 'styles/contact_style.css'
    };

    const pageScripts = {
        'home': 'apps/home.js',
        'projects': 'apps/projects.js',
        'resume': 'apps/resume.js',
        'contact': 'apps/contact.js'
    };

    let currentStyleSheet = null;
    let currentPageScriptElement = null;
    let isNavbarJsInitialized = false; // Flag to ensure navbar JS features are initialized only once

    async function loadHTML(url, container) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.statusText}`);
            }
            const html = await response.text();
            container.innerHTML = html;

            if (url.endsWith('navbar.html')) {
                if (!isNavbarJsInitialized) {
                    initializeNavbarFeatures();
                    isNavbarJsInitialized = true;
                } else {
                    // Fallback if navbar HTML is reloaded (should ideally not happen)
                    syncThemeIconWithBodyState(); // Function defined in initializeNavbarFeatures scope
                    updateActiveLinkBasedOnHash(); // Function defined below
                }
            }
        } catch (error) {
            console.error('Error loading HTML:', url, error);
            container.innerHTML = `<p>Error loading content from ${url}. Please try again later.</p>`;
        }
    }

    function loadCSS(path) {
        if (currentStyleSheet) {
            currentStyleSheet.remove();
            currentStyleSheet = null;
        }
        if (path) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            document.head.appendChild(link);
            currentStyleSheet = link;
        }
    }

    function loadPageScript(pageName, scriptPath) {
        if (currentPageScriptElement) {
            currentPageScriptElement.remove();
            currentPageScriptElement = null;
        }

        if (scriptPath) {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.defer = true;

            script.onload = () => {
                if (pageName === 'home' && typeof initializeHomeButtonListeners === 'function') {
                    initializeHomeButtonListeners();
                } else if (pageName === 'resume' && typeof initializeResumePageScripts === 'function') {
                    initializeResumePageScripts();
                } else if (pageName === 'contact' && typeof initializeContactForm === 'function') {
                    initializeContactForm();
                }
            };
            script.onerror = () => {
                console.error(`Failed to load script: ${scriptPath}`);
            };
            document.body.appendChild(script);
            currentPageScriptElement = script;
        }
    }

    async function loadPage(pageName) {
        const resolvedPageName = routes[pageName] ? pageName : 'home';
        const pagePath = routes[resolvedPageName];
        const stylePath = pageStyles[resolvedPageName];
        const scriptPath = pageScripts[resolvedPageName];

        loadCSS(stylePath);
        await loadHTML(pagePath, mainContentArea);

        if (scriptPath) {
            loadPageScript(resolvedPageName, scriptPath);
        }

        updateActiveLink(resolvedPageName);
        window.scrollTo(0, 0);
    }

    function updateActiveLink(currentPage) {
        if (!navbarContainer || navbarContainer.innerHTML.trim() === "") return;

        const desktopLinks = navbarContainer.querySelectorAll('.desktop-nav-links .nav-link');
        const mobileLinks = navbarContainer.querySelectorAll('.mobile-nav-links .nav-link');

        const allLinks = [...desktopLinks, ...mobileLinks];

        allLinks.forEach(link => {
            link.classList.remove('active');
            const linkHash = link.getAttribute('href');
            if (linkHash === `#${currentPage}`) {
                link.classList.add('active');
            }
        });
    }

    function updateActiveLinkBasedOnHash() {
        const currentHash = window.location.hash.substring(1) || 'home';
        updateActiveLink(currentHash);
    }

    // Store listeners to remove them if navbar reinitializes (defensive coding)
    let themeToggleClickListener = null;
    let hamburgerClickListener = null;
    let closeSidebarClickListener = null;
    let overlayClickListener = null;
    let resizeListener = null;


    function syncThemeIconWithBodyState() { // Moved to be accessible by loadHTML fallback
        const body = document.body;
        const themeIconElement = document.getElementById('theme-icon');
        const sunIconSrc = '../assets/images/sun.svg';
        const moonIconSrc = '../assets/images/moon.svg';
        if (themeIconElement) {
            themeIconElement.src = body.classList.contains('dark-theme') ? sunIconSrc : moonIconSrc;
        }
    }

    function initializeNavbarFeatures() {
        const body = document.body;
        const themeToggleButton = document.getElementById('theme-toggle-button');
        const themeIconElement = document.getElementById('theme-icon'); // Used by syncThemeIconWithBodyState

        // Theme Toggle Click Handler
        function handleThemeToggleClick() {
            const currentThemeIsDark = body.classList.contains('dark-theme');
            const newTheme = currentThemeIsDark ? 'light' : 'dark';

            body.classList.remove('dark-theme', 'light-theme');
            body.classList.add(newTheme === 'dark' ? 'dark-theme' : 'light-theme');

            syncThemeIconWithBodyState(); // Update icon

            localStorage.setItem('theme', newTheme);
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        }

        if (themeToggleButton && themeIconElement) {
            // Set initial icon state
            syncThemeIconWithBodyState();
            document.addEventListener('initialThemeClassApplied', () => {
                syncThemeIconWithBodyState();
            }, { once: true });

            // Remove old listener if it exists and re-add
            if (themeToggleClickListener && themeToggleButton._hasThemeListener) {
                themeToggleButton.removeEventListener('click', themeToggleClickListener);
            }
            themeToggleClickListener = handleThemeToggleClick;
            themeToggleButton.addEventListener('click', themeToggleClickListener);
            themeToggleButton._hasThemeListener = true; // Mark that listener is attached

        } else {
            console.warn("index.js: Theme toggle button or icon element NOT FOUND during navbar init.");
        }

        // Hamburger Menu, Sidebar, etc.
        const hamburgerButton = document.getElementById('hamburger-button');
        const mobileNavSidebar = document.getElementById('mobile-nav-sidebar');
        const closeSidebarButton = document.getElementById('close-sidebar-button');
        const navOverlay = document.getElementById('nav-overlay');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-links .nav-link');

        function openMobileMenu() {
            if (mobileNavSidebar && navOverlay && hamburgerButton) {
                mobileNavSidebar.classList.add('active');
                navOverlay.classList.add('active');
                hamburgerButton.setAttribute('aria-expanded', 'true');
            }
        }

        function closeMobileMenu() {
            if (mobileNavSidebar && navOverlay && hamburgerButton) {
                mobileNavSidebar.classList.remove('active');
                navOverlay.classList.remove('active');
                hamburgerButton.setAttribute('aria-expanded', 'false');
            }
        }

        if (hamburgerButton) {
            if (hamburgerClickListener && hamburgerButton._hasHamburgerListener) hamburgerButton.removeEventListener('click', hamburgerClickListener);
            hamburgerClickListener = openMobileMenu;
            hamburgerButton.addEventListener('click', hamburgerClickListener);
            hamburgerButton._hasHamburgerListener = true;
        }
        if (closeSidebarButton) {
            if (closeSidebarClickListener && closeSidebarButton._hasCloseSidebarListener) closeSidebarButton.removeEventListener('click', closeSidebarClickListener);
            closeSidebarClickListener = closeMobileMenu;
            closeSidebarButton.addEventListener('click', closeSidebarClickListener);
            closeSidebarButton._hasCloseSidebarListener = true;
        }
        if (navOverlay) {
            if (overlayClickListener && navOverlay._hasOverlayListener) navOverlay.removeEventListener('click', overlayClickListener);
            overlayClickListener = closeMobileMenu;
            navOverlay.addEventListener('click', overlayClickListener);
            navOverlay._hasOverlayListener = true;
        }

        mobileNavLinks.forEach(link => {
            // For links, multiple event listeners are fine if they don't conflict
            // but usually we attach these once. If navbar reloads, these will be new elements.
            link.addEventListener('click', closeMobileMenu);
        });

        // Remove old resize listener before adding a new one
        if (resizeListener) {
            window.removeEventListener('resize', resizeListener);
        }
        resizeListener = handleResponsiveDisplay; // Store the current handler
        window.addEventListener('resize', resizeListener);
        handleResponsiveDisplay(); // Initial check

        updateActiveLinkBasedOnHash();
    }

    function handleResponsiveDisplay() {
        const isMobile = window.innerWidth <= 768;
        const mobileNavSidebar = document.getElementById('mobile-nav-sidebar'); // Re-fetch in case DOM changed
        const navOverlay = document.getElementById('nav-overlay');
        const hamburgerButton = document.getElementById('hamburger-button');

        if (!isMobile && mobileNavSidebar && mobileNavSidebar.classList.contains('active')) {
            mobileNavSidebar.classList.remove('active');
            if (navOverlay) navOverlay.classList.remove('active');
            if (hamburgerButton) hamburgerButton.setAttribute('aria-expanded', 'false');
        }
    }

    function handleRouteChange() {
        const hash = window.location.hash.substring(1);
        const pageName = routes[hash] ? hash : 'home';
        loadPage(pageName);
    }

    async function init() {
        await Promise.all([
            loadHTML('pages/navbar.html', navbarContainer),
            loadHTML('pages/footer.html', footerContainer)
        ]);

        handleRouteChange();
        window.addEventListener('hashchange', handleRouteChange);
    }

    init();
});