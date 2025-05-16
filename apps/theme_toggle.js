// apps/theme_toggle.js
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    function applyBodyThemeClass(theme) {
        body.classList.remove('dark-theme', 'light-theme'); // Clear previous
        body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');

        // Dispatch an event so index.js knows the initial theme class is set on the body
        document.dispatchEvent(new CustomEvent('initialThemeClassApplied', { detail: { theme: theme } }));
    }

    function setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        let currentTheme;

        if (savedTheme) {
            currentTheme = savedTheme;
        } else if (prefersDark) {
            currentTheme = 'dark';
        } else {
            currentTheme = 'light'; // Default to light
        }
        applyBodyThemeClass(currentTheme);
    }

    setInitialTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only if user hasn't manually set a theme
            const newTheme = e.matches ? 'dark' : 'light';
            applyBodyThemeClass(newTheme);
            // Let index.js handle UI updates for the button icon via themeChanged event
            document.dispatchEvent(new CustomEvent('themeChangedByOS', { detail: { theme: newTheme } }));
        }
    });
});