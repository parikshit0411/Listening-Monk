// Karma Coin Payment System
class KarmaCoinSystem {
  constructor() {
    this.balance = parseInt(localStorage.getItem('karmaCoins')) || 100; // Starting balance
    this.chatCostPerMinute = 5; // 5 Karma Coins per minute
    this.voiceCallCostPerMinute = 10; // 10 Karma Coins per minute
    this.currentSession = null;
    this.sessionTimer = null;
    this.sessionCost = 0;
    
    this.packages = [
      {
        id: 'starter',
        name: 'Starter Pack',
        amount: 100,
        price: 4.99,
        icon: '🌱',
        description: 'Perfect for trying out our service',
        features: ['20 minutes of chat', '10 minutes of voice calls', 'Basic support'],
        popular: false
      },
      {
        id: 'popular',
        name: 'Popular Choice',
        amount: 500,
        price: 19.99,
        icon: '⭐',
        description: 'Most popular package for regular users',
        features: ['100 minutes of chat', '50 minutes of voice calls', 'Priority support', '10% bonus coins'],
        popular: true
      },
      {
        id: 'premium',
        name: 'Premium Pack',
        amount: 1000,
        price: 34.99,
        icon: '💎',
        description: 'Best value for frequent users',
        features: ['200 minutes of chat', '100 minutes of voice calls', 'Premium support', '20% bonus coins', 'Extended sessions'],
        popular: false
      },
      {
        id: 'ultimate',
        name: 'Ultimate Pack',
        amount: 2500,
        price: 79.99,
        icon: '👑',
        description: 'Ultimate package for heavy users',
        features: ['500 minutes of chat', '250 minutes of voice calls', 'VIP support', '25% bonus coins', 'Unlimited sessions', 'Priority matching'],
        popular: false
      }
    ];
    
    this.init();
  }

  init() {
    this.updateBalanceDisplay();
    this.bindEvents();
  }

  bindEvents() {
    // Buy coins button event
    document.getElementById('karmaShopBtn')?.addEventListener('click', () => {
      window.location.href = 'buy-coin.html';
    });
  }

  updateBalanceDisplay() {
    const balanceElements = document.querySelectorAll('.karma-balance-amount');
    balanceElements.forEach(element => {
      element.textContent = this.balance;
    });
    
    // Update localStorage
    localStorage.setItem('karmaCoins', this.balance.toString());
  }

  showPaymentModal() {
    this.createPaymentModal();
    document.getElementById('paymentModal').classList.add('active');
  }

  hidePaymentModal() {
    document.getElementById('paymentModal')?.classList.remove('active');
  }

  createPaymentModal() {
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.id = 'paymentModal';

    modal.innerHTML = `
      <div class="payment-content">
        <div class="payment-header">
          <button class="payment-close" id="closePaymentModal">×</button>
          <div class="payment-title">
            <span class="karma-balance-icon">🪙</span>
            Karma Coin Shop
          </div>
          <div class="payment-subtitle">Purchase Karma Coins to chat and call with monks</div>
        </div>
        <div class="payment-body">
          <div class="current-balance">
            <div class="balance-label">Your Current Balance</div>
            <div class="balance-amount">
              <span class="karma-balance-icon">🪙</span>
              <span class="karma-balance-amount">${this.balance}</span>
              <span style="font-size: 1.5rem;">Karma Coins</span>
            </div>
          </div>
          
          <div class="karma-packages">
            ${this.packages.map(pkg => this.createPackageHTML(pkg)).join('')}
          </div>
          
          <div class="payment-methods">
            <h3>Choose Payment Method</h3>
            <div class="payment-options">
              <div class="payment-option" data-method="paypal">
                <div class="payment-option-icon">💳</div>
                <div class="payment-option-name">PayPal</div>
              </div>
              <div class="payment-option" data-method="stripe">
                <div class="payment-option-icon">💰</div>
                <div class="payment-option-name">Credit Card</div>
              </div>
              <div class="payment-option" data-method="crypto">
                <div class="payment-option-icon">₿</div>
                <div class="payment-option-name">Cryptocurrency</div>
              </div>
              <div class="payment-option" data-method="applepay">
                <div class="payment-option-icon">📱</div>
                <div class="payment-option-name">Apple Pay</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind events for this modal
    document.getElementById('closePaymentModal').addEventListener('click', () => {
      this.hidePaymentModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hidePaymentModal();
      }
    });

    // Bind package purchase events
    document.querySelectorAll('.buy-package-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const packageId = e.target.dataset.packageId;
        this.purchasePackage(packageId);
      });
    });

    // Bind payment method events
    document.querySelectorAll('.payment-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.selectPaymentMethod(e.currentTarget.dataset.method);
      });
    });
  }

  createPackageHTML(pkg) {
    return `
      <div class="karma-package ${pkg.popular ? 'popular' : ''}">
        ${pkg.popular ? '<div class="package-badge">Most Popular</div>' : ''}
        <div class="package-icon">${pkg.icon}</div>
        <div class="package-amount">
          <span class="karma-balance-icon">🪙</span>
          ${pkg.amount}
        </div>
        <div class="package-price">$${pkg.price}</div>
        <div class="package-description">${pkg.description}</div>
        <ul class="package-features">
          ${pkg.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <button class="buy-package-btn" data-package-id="${pkg.id}">
          Purchase ${pkg.name}
        </button>
      </div>
    `;
  }

  purchasePackage(packageId) {
    const pkg = this.packages.find(p => p.id === packageId);
    if (!pkg) return;

    // Simulate payment processing
    this.showProcessingState(packageId);
    
    setTimeout(() => {
      this.balance += pkg.amount;
      this.updateBalanceDisplay();
      this.showPurchaseSuccess(pkg);
      
      // Hide modal after success
      setTimeout(() => {
        this.hidePaymentModal();
      }, 2000);
    }, 1500);
  }

  showProcessingState(packageId) {
    const btn = document.querySelector(`[data-package-id="${packageId}"]`);
    if (btn) {
      btn.textContent = 'Processing...';
      btn.disabled = true;
    }
  }

  showPurchaseSuccess(pkg) {
    const modal = document.getElementById('paymentModal');
    const content = modal.querySelector('.payment-body');
    
    content.innerHTML = `
      <div class="purchase-success">
        <div class="success-icon">✅</div>
        <div class="success-message">Purchase Successful!</div>
        <div class="success-details">
          You've purchased ${pkg.amount} Karma Coins for $${pkg.price}
          <br>
          Your new balance: <span class="karma-balance-icon">🪙</span> ${this.balance} Karma Coins
        </div>
      </div>
    `;
  }

  selectPaymentMethod(method) {
    // Remove previous selections
    document.querySelectorAll('.payment-option').forEach(option => {
      option.style.borderColor = '';
      option.style.background = '';
    });

    // Highlight selected method
    const selectedOption = document.querySelector(`[data-method="${method}"]`);
    if (selectedOption) {
      selectedOption.style.borderColor = '#f59e0b';
      selectedOption.style.background = 'rgba(245, 158, 11, 0.1)';
    }
  }

  // Session cost management
  startSession(type, monk) {
    if (this.currentSession) {
      this.endSession();
    }

    const costPerMinute = type === 'voice' ? this.voiceCallCostPerMinute : this.chatCostPerMinute;
    
    if (this.balance < costPerMinute) {
      this.showInsufficientFundsWarning(costPerMinute);
      return false;
    }

    this.currentSession = {
      type: type,
      monk: monk,
      startTime: Date.now(),
      costPerMinute: costPerMinute
    };

    this.sessionCost = 0;
    this.startSessionTimer();
    this.showCostInfo(type, costPerMinute);
    
    return true;
  }

  startSessionTimer() {
    this.sessionTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.currentSession.startTime) / 60000); // minutes
      const newCost = elapsed * this.currentSession.costPerMinute;
      
      if (newCost > this.sessionCost) {
        const additionalCost = newCost - this.sessionCost;
        if (this.balance >= additionalCost) {
          this.balance -= additionalCost;
          this.sessionCost = newCost;
          this.updateBalanceDisplay();
          this.updateCostInfo();
        } else {
          // Insufficient funds, end session
          this.endSession(true);
        }
      }
    }, 60000); // Check every minute
  }

  endSession(insufficient = false) {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.currentSession) {
      const duration = Math.floor((Date.now() - this.currentSession.startTime) / 60000);
      
      if (insufficient) {
        this.showNotification('⚠️', 'Session ended due to insufficient Karma Coins');
      } else {
        this.showNotification('✅', `Session ended. Duration: ${duration} minutes, Cost: ${this.sessionCost} Karma Coins`);
      }
    }

    this.currentSession = null;
    this.sessionCost = 0;
    this.hideCostInfo();
  }

  showCostInfo(type, costPerMinute) {
    const costInfo = document.querySelector('.chat-cost-info');
    if (costInfo) {
      costInfo.classList.add('show');
      const typeText = type === 'voice' ? 'Voice Call' : 'Chat';
      costInfo.innerHTML = `
        <div class="cost-title">
          <span class="karma-balance-icon">🪙</span>
          ${typeText} Cost
        </div>
        <div class="cost-details">
          ${costPerMinute} Karma Coins per minute<br>
          Current session cost: <span id="sessionCost">0</span> Karma Coins
        </div>
      `;
    }
  }

  updateCostInfo() {
    const sessionCostElement = document.getElementById('sessionCost');
    if (sessionCostElement) {
      sessionCostElement.textContent = this.sessionCost;
    }
  }

  hideCostInfo() {
    const costInfo = document.querySelector('.chat-cost-info');
    if (costInfo) {
      costInfo.classList.remove('show');
    }
  }

  showInsufficientFundsWarning(requiredCoins) {
    const warning = document.querySelector('.insufficient-funds');
    if (warning) {
      warning.classList.add('show');
      warning.innerHTML = `
        <div class="insufficient-title">
          <span>⚠️</span>
          Insufficient Karma Coins
        </div>
        <div class="insufficient-message">
          You need at least ${requiredCoins} Karma Coins to start this session. 
          Your current balance is ${this.balance} Karma Coins.
          <br><br>
          <button class="karma-shop-btn" onclick="karmaCoin.showPaymentModal()">
            <span class="karma-balance-icon">🪙</span>
            Buy More Coins
          </button>
        </div>
      `;
    }
  }

  hideInsufficientFundsWarning() {
    const warning = document.querySelector('.insufficient-funds');
    if (warning) {
      warning.classList.remove('show');
    }
  }

  // Utility function for notifications
  showNotification(icon, message) {
    const toast = document.getElementById('notificationToast');
    if (toast) {
      const iconElement = toast.querySelector('.toast-icon');
      const messageElement = toast.querySelector('.toast-message');

      iconElement.textContent = icon;
      messageElement.textContent = message;

      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }
  }

  // Admin functions
  addCoins(amount) {
    this.balance += amount;
    this.updateBalanceDisplay();
    this.showNotification('🪙', `Added ${amount} Karma Coins to your balance`);
  }

  getBalance() {
    return this.balance;
  }

  setBalance(amount) {
    this.balance = Math.max(0, amount);
    this.updateBalanceDisplay();
  }
}

// Initialize Karma Coin system
let karmaCoin;

document.addEventListener('DOMContentLoaded', () => {
  karmaCoin = new KarmaCoinSystem();
  
  // Make it globally accessible
  window.karmaCoin = karmaCoin;
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KarmaCoinSystem;
}
