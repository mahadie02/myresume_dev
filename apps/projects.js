// apps/projects.js
// console.log("Projects page script loaded.");
// Hover effects are handled by CSS.

// Apply custom styling to tech tags based on theme
document.addEventListener('DOMContentLoaded', () => {
    // Function to apply styles based on theme
    function applyTechTagStyles() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const techTags = document.querySelectorAll('.tech-tag');

        techTags.forEach(tag => {
            if (isDarkTheme) {
                // Dark theme styling
                tag.style.backgroundColor = '#303030';
                tag.style.color = '#ffffff';
                tag.style.border = '1px solid #444444';
            } else {
                // Light theme styling
                tag.style.backgroundColor = '#e8eaed';
                tag.style.color = '#333333';
                tag.style.border = '1px solid #d0d0d0';
            }
        });
    }

    // Apply styles on page load
    applyTechTagStyles();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' &&
                (mutation.target.classList.contains('dark-theme') ||
                    mutation.target.classList.contains('light-theme'))) {
                applyTechTagStyles();
            }
        });
    });

    // Observe the body for class changes
    observer.observe(document.body, { attributes: true });
});