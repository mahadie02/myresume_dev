// apps/resume.js

const profilePicLightSrc = '../assets/images/profile-light.jpg';
const profilePicDarkSrc = '../assets/images/profile-dark.jpg';

function updateProfilePictureForTheme() {
    const profilePicElement = document.getElementById('profile-picture');
    if (profilePicElement) {
        if (document.body.classList.contains('dark-theme')) {
            profilePicElement.src = profilePicDarkSrc;
            profilePicElement.alt = "Md Rezaul Hasan Mahadie - Dark Theme";
        } else {
            profilePicElement.src = profilePicLightSrc;
            profilePicElement.alt = "Md Rezaul Hasan Mahadie - Light Theme";
        }
    }
}

function initializeResumePageScripts() {
    // console.log("RESUME.JS: initializeResumePageScripts called");
    const downloadButton = document.getElementById('download-pdf-button');
    if (downloadButton) {
        // Ensure listener is attached only once
        if (!downloadButton.hasAttribute('data-pdf-listener-attached')) {
            downloadButton.addEventListener('click', function (event) {
                // event.preventDefault(); // Good practice, though button shouldn't navigate
                generateAndDownloadPDF();
            });
            downloadButton.setAttribute('data-pdf-listener-attached', 'true');
            // console.log("RESUME.JS: Download PDF button listener attached.");
        }
    } else {
        // console.warn("RESUME.JS: Download PDF button not found.");
    }

    updateProfilePictureForTheme(); // Initial update

    // Listen for theme changes from index.js
    document.addEventListener('themeChanged', (event) => {
        // console.log("RESUME.JS: themeChanged event received", event.detail.theme);
        if (window.location.hash.includes('resume')) { // Only update if on resume page
            updateProfilePictureForTheme();
        }
    });
}

// REMOVE the standalone call:
// if (document.getElementById('download-pdf-button') && typeof initializeResumePageScripts === 'function') {
//     initializeResumePageScripts();
// }
// RELY on index.js to call initializeResumePageScripts


async function generateAndDownloadPDF() {
    // console.log("RESUME.JS: generateAndDownloadPDF called");
    const downloadButton = document.getElementById('download-pdf-button');
    const originalButtonHTML = downloadButton ? downloadButton.innerHTML : 'Download PDF <img src="../assets/images/download_icon.svg" alt="Download icon" class="icon-svg">';

    if (downloadButton) {
        downloadButton.textContent = 'Generating...';
        downloadButton.disabled = true;
    }

    const elementToPrint = document.getElementById('resume-content-to-pdf');
    if (!elementToPrint) {
        console.error('Resume content area not found!');
        if (downloadButton) {
            downloadButton.innerHTML = originalButtonHTML;
            downloadButton.disabled = false;
        }
        return;
    }

    const isDarkTheme = document.body.classList.contains('dark-theme');
    document.body.classList.add('pdf-generating');

    const pdfPageBackgroundColor = isDarkTheme ? '#1a1d24' : '#ffffff';
    const pdfPageTextColor = isDarkTheme ? '#e0e0e0' : '#333333';
    const pdfCardBackgroundColor = isDarkTheme ? '#252932' : '#ffffff';
    const pdfSkillCardBackgroundColor = isDarkTheme ? '#252932' : '#f0f0f0';
    const pdfAccentColor = '#40E0D0';
    const pdfBorderColor = isDarkTheme ? '#3a3f4c' : '#dddddd';

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    await new Promise(resolve => setTimeout(resolve, 300));

    const opt = { /* ... (options remain the same as your last working PDF generation code) ... */ };
    // Make sure the 'opt' variable has the full correct configuration from your last working PDF code.
    // For brevity, I'm not repeating the entire 'opt' block, but it should be the one
    // that was generating the PDF content correctly, even if the background was an issue.
    // The key change for the background was html2canvas: { backgroundColor: pdfPageBackgroundColor }

    // Re-inserting the full opt from your provided code:
    opt.margin = 0;
    opt.filename = 'Mahadie_Resume.pdf';
    opt.image = { type: 'jpeg', quality: 0.98 };
    opt.html2canvas = {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: pdfPageBackgroundColor, // Tell html2canvas the BG
        onclone: (clonedDoc) => {
            const rootElement = clonedDoc.documentElement;
            rootElement.classList.remove('light-theme', 'dark-theme');
            rootElement.classList.add(isDarkTheme ? 'dark-theme' : 'light-theme');
            rootElement.style.backgroundColor = pdfPageBackgroundColor;
            clonedDoc.body.style.backgroundColor = pdfPageBackgroundColor;
            clonedDoc.body.style.color = pdfPageTextColor;
            clonedDoc.body.style.padding = "0";
            clonedDoc.body.style.margin = "0";

            const elementToPrintCloned = clonedDoc.getElementById('resume-content-to-pdf');
            if (elementToPrintCloned) {
                elementToPrintCloned.style.backgroundColor = pdfPageBackgroundColor;
                elementToPrintCloned.style.color = pdfPageTextColor;
                elementToPrintCloned.style.padding = '20px';
                elementToPrintCloned.style.boxSizing = 'border-box';
                elementToPrintCloned.style.width = '100%';
            }

            // Fix for connect icons (GitHub, LinkedIn, Email, WhatsApp) in dark mode
            if (isDarkTheme) {
                const connectIcons = clonedDoc.querySelectorAll('.connect-icon.skill-icon-like');
                connectIcons.forEach(icon => {
                    icon.style.filter = 'brightness(0) invert(1)';
                    icon.style.color = '#ffffff';
                });
            }

            const style = clonedDoc.createElement('style');
            style.innerHTML = ` /* ... (your extensive onclone styles) ... */ `; // Keep your detailed onclone styles
            clonedDoc.head.appendChild(style);

            const profilePic = clonedDoc.getElementById('profile-picture');
            if (profilePic) {
                profilePic.src = isDarkTheme ? profilePicDarkSrc : profilePicLightSrc;
                profilePic.style.border = `2px solid ${pdfBorderColor}`;
                profilePic.style.boxShadow = 'none';
                // Make the profile picture bigger in PDF
                profilePic.style.width = '150px';
                profilePic.style.height = '150px';
            }
        }
    };
    opt.jsPDF = { unit: 'in', format: 'a4', orientation: 'portrait' };


    try {
        await html2pdf().from(elementToPrint).set(opt).save();
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setTimeout(() => {
            document.body.classList.remove('pdf-generating');
            document.body.style.overflow = originalBodyOverflow;
            if (downloadButton) {
                downloadButton.innerHTML = originalButtonHTML;
                downloadButton.disabled = false;
                const icon = downloadButton.querySelector('img.icon-svg');
                if (icon) {
                    if (document.body.classList.contains('dark-theme')) {
                        icon.style.filter = 'brightness(0) invert(1)';
                    } else {
                        icon.style.filter = 'invert(1) brightness(0)';
                    }
                }
            }
        }, 100);
    }
}