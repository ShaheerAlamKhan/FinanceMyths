/**
 * Main JavaScript file for Financial Myths Debunked
 * Handles common functionality across the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active section in the navigation
    highlightNavigation();
    
    // Add smooth scrolling for navigation links
    setupSmoothScrolling();
    
    // Add fade-in animations to sections
    setupAnimations();
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
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }
            }
        });
    });
}

/**
 * Set up fade-in animations for sections as they enter the viewport
 */
function setupAnimations() {
    // Add the fade-in class to elements that should animate
    const animatedElements = document.querySelectorAll('.viz-container, .card');
    
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
        element.style.opacity = '0'; // Start with opacity 0
    });
    
    // Function to check if an element is in the viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Function to handle animation on scroll
    function handleScroll() {
        animatedElements.forEach(element => {
            if (isInViewport(element) && element.style.opacity === '0') {
                element.style.opacity = '1';
                element.style.animation = 'fadeIn ease 1s forwards';
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Check elements on initial page load
    setTimeout(handleScroll, 100);
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