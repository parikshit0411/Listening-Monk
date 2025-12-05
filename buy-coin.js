// Buy Coins Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Stripe (using test key - replace with actual publishable key)
    const stripe = Stripe('pk_test_51234567890abcdef'); // Replace with actual key
    const elements = stripe.elements();
    
    // Create card element
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '14px',
                color: '#2d1b4e',
                '::placeholder': {
                    color: '#666',
                },
            },
        },
    });
    
    // Mount card element
    cardElement.mount('#card-element');
    
    // Handle real-time validation errors from the card element
    cardElement.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Package selection
    const packageCards = document.querySelectorAll('.package-card');
    const orderSummary = {
        name: document.querySelector('.package-name'),
        total: document.querySelector('.package-total'),
        totalAmount: document.querySelector('.total-amount'),
        submitBtn: document.getElementById('submit-payment')
    };
    
    let selectedPackage = null;
    
    // Package selection handlers
    packageCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected state from all cards
            packageCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected state to clicked card
            this.classList.add('selected');
            
            // Get package data
            selectedPackage = {
                name: this.getAttribute('data-package'),
                price: parseInt(this.getAttribute('data-price')),
                coins: parseInt(this.getAttribute('data-coins')),
                title: this.querySelector('.package-title').textContent
            };
            
            // Update order summary
            updateOrderSummary();
            
            // Enable submit button
            updateSubmitButton();
        });
    });
    
    function updateOrderSummary() {
        if (selectedPackage) {
            const price = selectedPackage.price / 100; // Convert from cents
            orderSummary.name.textContent = `${selectedPackage.title} (${selectedPackage.coins} coins)`;
            orderSummary.total.textContent = `$${price.toFixed(2)}`;
            orderSummary.totalAmount.textContent = `$${price.toFixed(2)}`;
        } else {
            orderSummary.name.textContent = 'Please select a package';
            orderSummary.total.textContent = '$0.00';
            orderSummary.totalAmount.textContent = '$0.00';
        }
    }
    
    // Form validation
    const form = document.getElementById('payment-form');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('billing-name');
    const countryInput = document.getElementById('billing-country');
    const termsCheckbox = document.getElementById('terms');
    
    function updateSubmitButton() {
        const isFormValid = selectedPackage && 
                           emailInput.value && 
                           nameInput.value && 
                           countryInput.value && 
                           termsCheckbox.checked;
        
        orderSummary.submitBtn.disabled = !isFormValid;
    }
    
    // Add event listeners for form validation
    [emailInput, nameInput, countryInput, termsCheckbox].forEach(input => {
        input.addEventListener('change', updateSubmitButton);
        input.addEventListener('input', updateSubmitButton);
    });
    
    // Form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!selectedPackage) {
            alert('Please select a package');
            return;
        }
        
        // Show loading state
        const submitBtn = orderSummary.submitBtn;
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        try {
            // Create payment method
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: nameInput.value,
                    email: emailInput.value,
                },
            });
            
            if (error) {
                throw new Error(error.message);
            }
            
            // In a real application, you would send this to your server
            // For demo purposes, we'll simulate a successful payment
            await simulatePayment(paymentMethod, selectedPackage);
            
        } catch (error) {
            console.error('Payment failed:', error);
            showError(error.message);
            
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'inline-flex';
            btnLoading.style.display = 'none';
            updateSubmitButton();
        }
    });
    
    // Simulate payment processing (replace with actual server integration)
    async function simulatePayment(paymentMethod, package) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure (90% success rate for demo)
                if (Math.random() > 0.1) {
                    showSuccess(package);
                    resolve();
                } else {
                    reject(new Error('Payment processing failed. Please try again.'));
                }
            }, 2000);
        });
    }
    
    function showSuccess(package) {
        // Create success modal
        const modal = createModal(`
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #10b981; margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 1rem;">Payment Successful!</h3>
                <p style="margin-bottom: 1.5rem;">
                    You have successfully purchased ${package.coins} Karma Coins for $${(package.price / 100).toFixed(2)}.
                </p>
                <p style="color: #666; font-size: 0.875rem; margin-bottom: 2rem;">
                    Your coins have been added to your account and you'll receive a confirmation email shortly.
                </p>
                <button onclick="window.location.href='index.html'" class="btn btn--primary btn--lg">
                    <i class="fas fa-home"></i>
                    Return Home
                </button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    function showError(message) {
        // Create error modal
        const modal = createModal(`
            <div style="text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 1rem;">Payment Failed</h3>
                <p style="margin-bottom: 2rem;">
                    ${message}
                </p>
                <button onclick="this.closest('.modal').remove()" class="btn btn--primary btn--lg">
                    <i class="fas fa-times"></i>
                    Close
                </button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    function createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 3rem;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        modalContent.innerHTML = content;
        modal.appendChild(modalContent);
        
        // Close modal on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
    
    // Dark mode support for card element
    function updateCardElementTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        cardElement.update({
            style: {
                base: {
                    fontSize: '14px',
                    color: isDarkMode ? '#e2d6ff' : '#2d1b4e',
                    backgroundColor: isDarkMode ? '#2d1b4e' : '#f9f9f9',
                    '::placeholder': {
                        color: isDarkMode ? '#b5a4d4' : '#666',
                    },
                },
            },
        });
    }
    
    // Watch for theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateCardElementTheme();
            }
        });
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // Initialize theme
    updateCardElementTheme();
    
    // Auto-select popular package on load
    setTimeout(() => {
        const popularCard = document.querySelector('.package-card.popular');
        if (popularCard) {
            popularCard.click();
        }
    }, 500);
    
    // Form field enhancements
    const formFields = document.querySelectorAll('.payment-form input, .payment-form select');
    
    formFields.forEach(field => {
        // Add floating label effect
        field.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        field.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Real-time validation
        field.addEventListener('input', function() {
            validateField(this);
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        switch (field.type || field.tagName.toLowerCase()) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case 'text':
                isValid = value.length >= 2;
                break;
            case 'select':
            case 'select-one':
                isValid = value !== '';
                break;
        }
        
        field.classList.toggle('invalid', !isValid && value !== '');
        field.classList.toggle('valid', isValid && value !== '');
        
        return isValid;
    }
    
    // Add country flag support (simplified)
    const countrySelect = document.getElementById('billing-country');
    const countryFlags = {
        'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'AU': '🇦🇺',
        'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
        'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
        'FI': '🇫🇮', 'JP': '🇯🇵', 'KR': '🇰🇷', 'SG': '🇸🇬',
        'HK': '🇭🇰', 'IN': '🇮🇳', 'BR': '🇧🇷', 'MX': '🇲🇽'
    };
    
    // Update select options with flags
    Array.from(countrySelect.options).forEach(option => {
        if (option.value && countryFlags[option.value]) {
            option.textContent = `${countryFlags[option.value]} ${option.textContent}`;
        }
    });
    
    // Security indicator
    const securityIndicator = document.createElement('div');
    securityIndicator.className = 'security-indicator';
    securityIndicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #10b981; margin-top: 0.5rem;">
            <i class="fas fa-shield-alt"></i>
            <span>256-bit SSL encryption active</span>
        </div>
    `;
    
    const cardElementContainer = document.getElementById('card-element');
    cardElementContainer.parentNode.insertBefore(securityIndicator, cardElementContainer.nextSibling);
});

// Additional utility functions
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
