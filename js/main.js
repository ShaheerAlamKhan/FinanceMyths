/**
 * Main JavaScript file for Financial Myths
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Financial Myths application loaded');
    
    // Basic navigation highlighting
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
