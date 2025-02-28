/**
 * Main JavaScript file for Financial Myths Debunked
 * Handles common functionality across the site
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Financial Myths application loaded');
    
    // Highlight active section in the navigation
    highlightNavigation();
    
    // Add smooth scrolling for navigation links
    setupSmoothScrolling();
});

/**
 * Highlight the current section in the navigation
 */
function highlightNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Function to determine which section is currently in view
    function updateNavigation() {
        let currentSectionId = '';
        let minDistance = Number.MAX_VALUE;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const distance = Math.abs(sectionTop - window.scrollY - 100);
            
            if (distance < minDistance) {
                minDistance = distance;
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to the current section link
        if (currentSectionId) {
            const currentLink = document.querySelector(`.nav-link[href="#${currentSectionId}"]`);
            if (currentLink) {
                currentLink.classList.add('active');
            }
        }
    }
    
    // Update navigation on scroll
    window.addEventListener('scroll', updateNavigation);
    
    // Initialize on page load
    updateNavigation();
}

/**
 * Set up smooth scrolling for navigation links
 */
function setupSmoothScrolling() {
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target section id from the href
            const targetId = this.getAttribute('href');
            
            // Only process if it's an internal link
            if (targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Scroll to the target element
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Adjust for navbar height
                        behavior: 'smooth'
                    });
                    
                    // Close the mobile navbar if open
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }
            }
        });
    });
}

/**
 * Format numbers with commas for thousands
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Load JSON data from the given URL
 */
async function loadJsonData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to load data from ${url}:`, error);
        return null;
    }
}