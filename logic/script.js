/**
 * Nuvaro - Tech Services & Consulting
 * Main JavaScript File
 */

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });
    
    
    // Initialize mobile touch support for expertise cards
    initMobileExpertiseCards();
});

// ============================================
// Mobile Touch Support for Flip Cards
// ============================================
function initMobileExpertiseCards() {
    // Handle expertise/service flip cards
    const flipCards = document.querySelectorAll('.flip-card');
    let activeFlipCard = null;
    
    flipCards.forEach(card => {
        // Touch support - tap to toggle flip
        card.addEventListener('touchstart', function(e) {
            // If another card is active, deactivate it
            if (activeFlipCard && activeFlipCard !== this) {
                activeFlipCard.classList.remove('active');
            }
            
            // Toggle current card
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                activeFlipCard = null;
            } else {
                this.classList.add('active');
                activeFlipCard = this;
            }
        }, { passive: true });
        
        // Make cards focusable for keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', 'false');
        
        // Keyboard support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('active');
                const isActive = this.classList.contains('active');
                this.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            }
        });
    });
    
    // Handle process flip cards
    const processFlipCards = document.querySelectorAll('.process-flip-card');
    let activeProcessCard = null;
    
    processFlipCards.forEach(card => {
        // Touch support - tap to toggle flip
        card.addEventListener('touchstart', function(e) {
            // If another card is active, deactivate it
            if (activeProcessCard && activeProcessCard !== this) {
                activeProcessCard.classList.remove('active');
            }
            
            // Toggle current card
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                activeProcessCard = null;
            } else {
                this.classList.add('active');
                activeProcessCard = this;
            }
        }, { passive: true });
        
        // Make cards focusable for keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', 'false');
        
        // Keyboard support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('active');
                const isActive = this.classList.contains('active');
                this.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            }
        });
    });
    
    // Close cards when tapping outside on mobile
    document.addEventListener('touchstart', function(e) {
        if (activeFlipCard && !activeFlipCard.contains(e.target)) {
            activeFlipCard.classList.remove('active');
            activeFlipCard = null;
        }
        if (activeProcessCard && !activeProcessCard.contains(e.target)) {
            activeProcessCard.classList.remove('active');
            activeProcessCard = null;
        }
    }, { passive: true });
}


// Navbar Scroll Effect
const navbar = document.getElementById('mainNav');
let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

// Active Navigation Link Update
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', function() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// Contact Form Handling with EmailJS
// ============================================

// Initialize EmailJS - Replace with your own credentials
// Sign up at https://www.emailjs.com/ (free tier available)
// 1. Create an account at EmailJS
// 2. Add an email service (Gmail, Outlook, etc.)
// 3. Create an email template with variables: {{name}}, {{company}}, {{email}}, {{phone}}, {{projectBrief}}
// 4. Replace the IDs below with your own

const EMAILJS_PUBLIC_KEY = 'WWkSHMszK5z_kKfRi';
const EMAILJS_SERVICE_ID = 'service_3zpjp9f';
const EMAILJS_TEMPLATE_ID = 'template_q9c9n4t';

// Initialize EmailJS
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
})();

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            company: document.getElementById('company').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            projectBrief: document.getElementById('projectBrief').value.trim()
        };
        
        // Validate required fields
        if (!formData.name || !formData.company || !formData.email || !formData.projectBrief) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(formData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        // Check if EmailJS is configured
        if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
            // EmailJS not configured - simulate success for demo
            setTimeout(() => {
                setLoadingState(false);
                showNotification('Your request successfully submitted! We\'ll get back to you as soon as possible.', 'success');
                contactForm.reset();
                console.log('Form Data:', formData);
                console.log('Note: Configure EmailJS to actually send emails. See script.js for instructions.');
            }, 1500);
            return;
        }
        
        // Send email using EmailJS
        // Note: Emails will be sent FROM your Gmail account (this is an email security requirement)
        // The sender's info is in the subject and body, and Reply-To is set to their email
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: 'sunny.200745@gmail.com',
            from_name: formData.name,
            from_email: formData.email,
            company: formData.company,
            phone: formData.phone || 'Not provided',
            message: formData.projectBrief,
            reply_to: formData.email,
            subject: 'Contact from ' + formData.name + ' - ' + formData.company
        })
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            setLoadingState(false);
            showNotification('Your request successfully submitted! We\'ll get back to you as soon as possible.', 'success');
            contactForm.reset();
        })
        .catch(function(error) {
            console.error('FAILED...', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            setLoadingState(false);
            showNotification('Oops! Something went wrong. Please try again or contact us directly. Error: ' + (error.text || error.message || 'Unknown error'), 'error');
        });
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Loading state toggle
function setLoadingState(isLoading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const btnIcon = submitBtn.querySelector('.bi-send');
    
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
        if (btnIcon) btnIcon.classList.add('d-none');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
        if (btnIcon) btnIcon.classList.remove('d-none');
    }
}

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="Close notification">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    // Add styles
    const styles = `
        .notification-toast {
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 16px 20px;
            background: #1a1a25;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            animation: slideIn 0.3s ease-out;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #ffffff;
        }
        
        .notification-success .notification-content i {
            color: #10b981;
            font-size: 1.25rem;
        }
        
        .notification-error .notification-content i {
            color: #ef4444;
            font-size: 1.25rem;
        }
        
        .notification-content span {
            font-size: 0.9375rem;
            line-height: 1.5;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #6b6b7a;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
        }
        
        .notification-close:hover {
            color: #ffffff;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @media (max-width: 480px) {
            .notification-toast {
                left: 20px;
                right: 20px;
                max-width: none;
            }
        }
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
}

function closeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Form Input Animations
const formInputs = document.querySelectorAll('.form-floating .form-control');

formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Parallax Effect for Hero Section (subtle)
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const shapes = document.querySelectorAll('.shape');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
    
    shapes.forEach((shape, index) => {
        const speed = 0.1 + (index * 0.05);
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Typing Effect for Hero (optional enhancement)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const suffix = counter.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current) + suffix;
                setTimeout(updateCounter, stepTime);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Initialize counter animation
document.addEventListener('DOMContentLoaded', animateCounters);

// Console Easter Egg
console.log('%c🚀 Nuvaro', 'font-size: 24px; font-weight: bold; color: #6366f1;');
console.log('%cBuilding Innovative Web & Mobile Experiences', 'font-size: 14px; color: #a0a0b0;');
console.log('%c---', 'color: #333;');
console.log('%cInterested in working with us? Visit our contact section!', 'font-size: 12px; color: #818cf8;');
