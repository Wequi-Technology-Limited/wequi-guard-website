/**
 * Wequi Guard Privacy Policy - JavaScript Utilities
 * Provides interactive functionality for the privacy policy page
 */

// Print Page Function
function printPage() {
    window.print();
}

// Copy Link Function
function copyLink() {
    const url = window.location.href;
    
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
            .then(() => {
                showCopyFeedback('Link copied to clipboard!');
            })
            .catch((err) => {
                console.error('Failed to copy using Clipboard API:', err);
                fallbackCopyToClipboard(url);
            });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(url);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback('Link copied to clipboard!');
        } else {
            showCopyFeedback('Failed to copy link', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyFeedback('Failed to copy link', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Show temporary feedback message
function showCopyFeedback(message, type = 'success') {
    // Remove existing feedback if present
    const existingFeedback = document.getElementById('copy-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.id = 'copy-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.3s ease;
        opacity: 1;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds with fade out
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
            feedback.remove();
        }, 300);
    }, 3000);
}

// Smooth scrolling for anchor links (enhanced)
document.addEventListener('DOMContentLoaded', () => {
    // Handle all anchor links with smooth scrolling
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip empty anchors
            if (href === '#' || href === '') {
                return;
            }
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Scroll to target with smooth behavior
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    window.location.hash = href;
                }
                
                // Focus the target for accessibility
                targetElement.focus({ preventScroll: true });
            }
        });
    });
    
    // Highlight active section in TOC on scroll
    highlightActiveSection();
    
    // Add scroll listener for active section highlighting
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                highlightActiveSection();
                ticking = false;
            });
            ticking = true;
        }
    });
});

// Highlight active section in table of contents
function highlightActiveSection() {
    const sections = document.querySelectorAll('.section[id]');
    const tocLinks = document.querySelectorAll('.toc nav a');
    
    let currentSection = null;
    const scrollPosition = window.scrollY + 100; // Offset for better UX
    
    // Find the current section
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.id;
        }
    });
    
    // Highlight corresponding TOC link
    tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.style.color = '#2563eb';
            link.style.fontWeight = '600';
        } else {
            link.style.color = '';
            link.style.fontWeight = '';
        }
    });
}

// Keyboard navigation enhancement
document.addEventListener('keydown', (e) => {
    // Press 'P' to print
    if ((e.key === 'p' || e.key === 'P') && e.ctrlKey) {
        e.preventDefault();
        printPage();
    }
});

// Add loading performance optimization
if ('loading' in HTMLImageElement.prototype) {
    // Browser supports lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

// Accessibility: Announce dynamic content changes
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// Export functions for inline usage
window.printPage = printPage;
window.copyLink = copyLink;
