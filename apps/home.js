// apps/home.js
document.addEventListener('DOMContentLoaded', () => {
    const heroTextElement = document.getElementById('hero-main-text'); // Changed ID
    if (heroTextElement) {
        // Add cursor element only if it doesn't exist to prevent duplicates on re-route
        if (!document.querySelector('.typing-cursor')) {
            const cursorSpan = document.createElement('span');
            cursorSpan.classList.add('typing-cursor');
            // Insert cursor after the text content of heroTextElement
            heroTextElement.appendChild(cursorSpan);
        }
    }

    // Call other init functions if any, e.g., for button event listeners
    initializeHomeButtonListeners();
});

function initializeHomeButtonListeners() {
    // Placeholder for any JS interactions with home page buttons.
    // Current requirements (color changes) are handled by CSS.
    // console.log("Home page specific JS (e.g., button listeners) can be initialized here.");
}