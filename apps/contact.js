// apps/contact.js
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm && !contactForm.hasAttribute('data-listener-attached')) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
        contactForm.setAttribute('data-listener-attached', 'true');

        const messageTextarea = document.getElementById('message');
        const charCountDisplay = document.querySelector('.char-count'); // Assuming only one on the page

        if (messageTextarea && charCountDisplay) {
            const maxLength = parseInt(messageTextarea.getAttribute('maxlength'), 10);
            messageTextarea.addEventListener('input', () => {
                const currentLength = messageTextarea.value.length;
                charCountDisplay.textContent = `${currentLength} / ${maxLength} characters.`;
                if (currentLength > maxLength) {
                    // Optionally add a class for error styling
                    charCountDisplay.style.color = 'red';
                } else {
                    charCountDisplay.style.color = 'var(--secondary-text-color)'; // Reset color
                }
            });
            // Initial update
            const initialLength = messageTextarea.value.length;
            charCountDisplay.textContent = `Max ${maxLength} characters.`; // Or show current count
        }
    }

    // Create notification element if it doesn't exist
    if (!document.querySelector('.notification')) {
        createNotificationElement();
    }
}

function createNotificationElement() {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span class="notification-message">Message Sent!</span>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Add click event to close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideNotification();
        });
    }
}

function showNotification(message = "Message Sent!") {
    const notification = document.querySelector('.notification');
    if (notification) {
        const messageElement = notification.querySelector('.notification-message');
        if (messageElement) {
            messageElement.textContent = message;
        }

        notification.classList.add('show');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }
}

function hideNotification() {
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

function handleContactFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const submitButton = event.target.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }
    if (message.length > 500) {
        alert('Message exceeds 500 characters.');
        return;
    }


    const recipientEmail = 'mahadie02@gmail.com';
    const subject = `Contact Form Submission from ${name}`;

    // Construct the mailto body.
    // Using encodeURIComponent for each part of the body is safer.
    let body = `You have a new message from your portfolio contact form:\n\n`;
    body += `Name: ${name}\n`;
    body += `Email: ${email}\n\n`;
    body += `Message:\n${message}\n\n`;
    body += `----------------------------------\n`;
    body += `This email was generated from the contact form on your portfolio website.`;

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Attempt to open the mail client
    try {
        window.location.href = mailtoLink;

        // Show the notification
        showNotification("Message Sent!");

        // Reset the form
        document.getElementById('contact-form').reset();
        if (document.querySelector('.char-count')) {
            const maxLength = parseInt(document.getElementById('message').getAttribute('maxlength'), 10);
            document.querySelector('.char-count').textContent = `Max ${maxLength} characters.`;
        }
    } catch (e) {
        console.error("Failed to open mailto link:", e);
        alert("Could not open your email client. Please copy the details manually or try again.");
    }
}


// Call initialization if this script is loaded after the HTML.
// If loaded before by index.js, index.js should call initializeContactForm()
if (document.getElementById('contact-form')) {
    initializeContactForm();
}
// Remember to update index.js to call initializeContactForm similar to initializeResumePageScripts