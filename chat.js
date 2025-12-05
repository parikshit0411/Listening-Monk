// Chat Application JavaScript
class ChatApp {
  constructor() {
    this.selectedMonk = null;
    this.messages = [];
    this.isTyping = false;
    this.callDuration = 0;
    this.callTimer = null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    
    // Mock monk data
    this.monks = [
      {
        id: 1,
        name: 'Monk Tenzin',
        avatar: '🧘‍♂️',
        specialty: 'Anxiety & Stress Relief',
        status: 'online',
        rating: 4.9,
        bio: 'Specializes in mindfulness and anxiety management with over 10 years of experience.'
      },
      {
        id: 2,
        name: 'Sister Maya',
        avatar: '🧘‍♀️',
        specialty: 'Depression & Emotional Support',
        status: 'online',
        rating: 4.8,
        bio: 'Compassionate listener focusing on depression and emotional healing.'
      },
      {
        id: 3,
        name: 'Monk Dharma',
        avatar: '🧘‍♂️',
        specialty: 'Grief & Loss Counseling',
        status: 'away',
        rating: 4.7,
        bio: 'Helps people navigate through difficult times of loss and grief.'
      },
      {
        id: 4,
        name: 'Sister Priya',
        avatar: '🧘‍♀️',
        specialty: 'Relationship Guidance',
        status: 'busy',
        rating: 4.9,
        bio: 'Provides guidance on relationships and interpersonal conflicts.'
      },
      {
        id: 5,
        name: 'Monk Bodhi',
        avatar: '🧘‍♂️',
        specialty: 'Life Transitions',
        status: 'online',
        rating: 4.6,
        bio: 'Supports individuals through major life changes and decisions.'
      },
      {
        id: 6,
        name: 'Sister Lotus',
        avatar: '🧘‍♀️',
        specialty: 'Self-Esteem & Confidence',
        status: 'online',
        rating: 4.8,
        bio: 'Helps build self-confidence and overcome limiting beliefs.'
      }
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadMonks();
    this.setupWebRTC();
  }

  bindEvents() {
    // Monk selection
    document.getElementById('selectMonkBtn').addEventListener('click', () => {
      this.toggleMonkSidebar();
    });

    document.getElementById('closeSidebarBtn').addEventListener('click', () => {
      this.hideMonkSidebar();
    });

    // Message input
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    messageInput.addEventListener('input', () => {
      sendBtn.disabled = !messageInput.value.trim();
    });

    sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    // Call buttons
    document.getElementById('voiceCallBtn').addEventListener('click', () => {
      this.startVoiceCall();
    });


    // Call controls
    document.getElementById('endCallBtn').addEventListener('click', () => {
      this.endCall();
    });

    document.getElementById('closeCallBtn').addEventListener('click', () => {
      this.endCall();
    });


    document.getElementById('muteBtn').addEventListener('click', () => {
      this.toggleMute();
    });

    document.getElementById('speakerBtn').addEventListener('click', () => {
      this.toggleSpeaker();
    });


    // End session
    document.getElementById('endSessionBtn').addEventListener('click', () => {
      this.endSession();
    });

    // Emoji button (placeholder)
    document.getElementById('emojiBtn').addEventListener('click', () => {
      this.showNotification('😊', 'Emoji picker coming soon!');
    });

    // Attach button (placeholder)
    document.getElementById('attachBtn').addEventListener('click', () => {
      this.showNotification('📎', 'File attachment coming soon!');
    });
  }

  loadMonks() {
    const monksList = document.getElementById('monksList');
    monksList.innerHTML = '';

    this.monks.forEach(monk => {
      const monkCard = this.createMonkCard(monk);
      monksList.appendChild(monkCard);
    });
  }

  createMonkCard(monk) {
    const card = document.createElement('div');
    card.className = 'monk-card';
    card.dataset.monkId = monk.id;

    card.innerHTML = `
      <div class="monk-card-header">
        <div class="monk-avatar-sm">${monk.avatar}</div>
        <div class="monk-name-sm">${monk.name}</div>
      </div>
      <div class="monk-specialty">${monk.specialty}</div>
      <div class="monk-status-info">
        <div class="monk-availability">
          <div class="status-dot ${monk.status}"></div>
          <span>${this.capitalizeFirst(monk.status)}</span>
        </div>
        <div class="monk-rating">
          <span>⭐</span>
          <span>${monk.rating}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      this.selectMonk(monk);
    });

    return card;
  }

  selectMonk(monk) {
    this.selectedMonk = monk;
    
    // Check if user can start chat session
    if (window.karmaCoin && !window.karmaCoin.startSession('chat', monk)) {
      return; // Insufficient funds, session not started
    }
    
    // Update UI
    this.updateCurrentMonkInfo(monk);
    this.enableChatInput();
    this.hideMonkSidebar();
    this.clearMessages();
    this.addWelcomeMessage(monk);
    
    // Update selected monk card
    document.querySelectorAll('.monk-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.querySelector(`[data-monk-id="${monk.id}"]`).classList.add('selected');
    
    this.showNotification('✅', `Connected with ${monk.name}`);
    this.playMessageSound();
  }

  updateCurrentMonkInfo(monk) {
    document.querySelector('.avatar-placeholder').textContent = monk.avatar;
    document.querySelector('.monk-name').textContent = monk.name;
    document.querySelector('.monk-status').textContent = monk.specialty;
    document.querySelector('.status-indicator').className = `status-indicator ${monk.status}`;
    
    // Enable action buttons
    document.getElementById('voiceCallBtn').disabled = false;
  }

  enableChatInput() {
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = false;
    messageInput.placeholder = `Type your message to ${this.selectedMonk.name}...`;
  }

  clearMessages() {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';
  }

  addWelcomeMessage(monk) {
    const welcomeMsg = {
      type: 'monk',
      content: `Hello! I'm ${monk.name}. ${monk.bio} I'm here to listen and support you. How are you feeling today?`,
      timestamp: new Date(),
      monk: monk
    };
    
    this.addMessage(welcomeMsg);
  }

  sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !this.selectedMonk) return;
    
    // Add user message
    const userMessage = {
      type: 'user',
      content: content,
      timestamp: new Date()
    };
    
    this.addMessage(userMessage);
    messageInput.value = '';
    document.getElementById('sendBtn').disabled = true;
    
    // Simulate monk typing and response
    this.simulateMonkResponse(content);
    this.playMessageSound();
  }

  addMessage(message) {
    const messagesList = document.getElementById('messagesList');
    const messageElement = this.createMessageElement(message);
    messagesList.appendChild(messageElement);
    
    // Scroll to bottom
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    const avatar = message.type === 'monk' 
      ? this.selectedMonk.avatar 
      : 'You';
    
    const time = this.formatTime(message.timestamp);
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-bubble">
          <p class="message-text">${message.content}</p>
        </div>
        <div class="message-time">${time}</div>
      </div>
    `;
    
    return messageDiv;
  }

  simulateMonkResponse(userMessage) {
    // Show typing indicator
    this.showTypingIndicator();
    
    // Simulate delay
    setTimeout(() => {
      this.hideTypingIndicator();
      
      // Generate response based on user message
      const response = this.generateMonkResponse(userMessage);
      const monkMessage = {
        type: 'monk',
        content: response,
        timestamp: new Date()
      };
      
      this.addMessage(monkMessage);
      this.playMessageSound();
    }, 2000 + Math.random() * 2000); // Random delay between 2-4 seconds
  }

  generateMonkResponse(userMessage) {
    const responses = [
      "I hear you, and I want you to know that your feelings are valid. Can you tell me more about what's on your mind?",
      "Thank you for sharing that with me. It takes courage to open up. How has this been affecting you?",
      "I'm here to listen without judgment. Take your time to express whatever you need to share.",
      "Your experience sounds challenging. What would feel most supportive for you right now?",
      "I appreciate you trusting me with your thoughts. How are you taking care of yourself during this time?",
      "That sounds like a lot to carry. You don't have to go through this alone. What brings you comfort?",
      "I can sense the weight of what you're sharing. Your strength in reaching out is admirable.",
      "Every feeling you're experiencing is important. What has been the hardest part for you?",
      "Thank you for being so open. Your willingness to share shows great self-awareness.",
      "I'm honored that you've chosen to share this with me. What would you like to focus on today?"
    ];
    
    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      return "I understand you're feeling anxious. Anxiety can be overwhelming, but you're taking a positive step by reaching out. Would you like to explore some breathing exercises or talk about what's causing these feelings?";
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      return "I hear that you're going through a difficult time. It's okay to feel sad - these emotions are part of being human. You're not alone in this. What has been weighing on your heart?";
    }
    
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
      return "It sounds like you're experiencing some strong emotions. Anger can be a signal that something important needs attention. Can you help me understand what's triggering these feelings?";
    }
    
    // Default to random supportive response
    return responses[Math.floor(Math.random() * responses.length)];
  }

  showTypingIndicator() {
    const messagesList = document.getElementById('messagesList');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
      <div class="typing-avatar">${this.selectedMonk.avatar}</div>
      <div class="typing-bubble">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="typing-text">${this.selectedMonk.name} is typing...</span>
      </div>
    `;
    
    messagesList.appendChild(typingDiv);
    
    // Scroll to bottom
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  toggleMonkSidebar() {
    const sidebar = document.getElementById('monkSidebar');
    sidebar.classList.toggle('active');
  }

  hideMonkSidebar() {
    const sidebar = document.getElementById('monkSidebar');
    sidebar.classList.remove('active');
  }

  // Voice Call Functions
  async startVoiceCall() {
    if (!this.selectedMonk) return;
    
    // End current chat session if active
    if (window.karmaCoin && window.karmaCoin.currentSession) {
      window.karmaCoin.endSession();
    }
    
    // Check if user can start voice call session
    if (window.karmaCoin && !window.karmaCoin.startSession('voice', this.selectedMonk)) {
      return; // Insufficient funds, session not started
    }
    
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.showCallModal();
      this.startCallTimer();
      this.playCallSound();
      
      document.getElementById('callMonkName').textContent = this.selectedMonk.name;
      document.getElementById('callStatus').textContent = 'Connected';
      
      this.showNotification('📞', `Voice call started with ${this.selectedMonk.name}`);
    } catch (error) {
      console.error('Error starting voice call:', error);
      this.showNotification('❌', 'Could not start voice call. Please check microphone permissions.');
      
      // End Karma Coin session if call failed to start
      if (window.karmaCoin && window.karmaCoin.currentSession) {
        window.karmaCoin.endSession();
      }
    }
  }

  showCallModal() {
    document.getElementById('callModal').classList.add('active');
  }

  hideCallModal() {
    document.getElementById('callModal').classList.remove('active');
  }

  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.stopCallTimer();
    this.hideCallModal();
    
    // End Karma Coin session
    if (window.karmaCoin && window.karmaCoin.currentSession) {
      window.karmaCoin.endSession();
    }
    
    this.showNotification('📞', 'Call ended');
  }

  startCallTimer() {
    this.callDuration = 0;
    const durationElement = document.getElementById('callDuration');
    
    this.callTimer = setInterval(() => {
      this.callDuration++;
      const minutes = Math.floor(this.callDuration / 60).toString().padStart(2, '0');
      const seconds = (this.callDuration % 60).toString().padStart(2, '0');
      durationElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  stopCallTimer() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
  }

  toggleMute() {
    const muteBtn = document.getElementById('muteBtn');
    const icon = muteBtn.querySelector('.icon');
    
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        icon.textContent = audioTrack.enabled ? '🎤' : '🔇';
        muteBtn.classList.toggle('muted', !audioTrack.enabled);
      }
    }
  }

  toggleSpeaker() {
    const speakerBtn = document.getElementById('speakerBtn');
    const icon = speakerBtn.querySelector('.icon');
    
    // This is a placeholder - actual speaker toggle would require more complex audio routing
    speakerBtn.classList.toggle('active');
    icon.textContent = speakerBtn.classList.contains('active') ? '🔊' : '🔈';
  }


  // WebRTC Setup (Placeholder for future real implementation)
  setupWebRTC() {
    // This would be expanded for actual peer-to-peer communication
    // For now, it's just a placeholder structure
    this.peerConnection = null;
  }

  endSession() {
    if (confirm('Are you sure you want to end this session?')) {
      // Clean up any ongoing calls
      this.endCall();
      
      // End Karma Coin session
      if (window.karmaCoin && window.karmaCoin.currentSession) {
        window.karmaCoin.endSession();
      }
      
      // Reset UI
      this.selectedMonk = null;
      this.clearMessages();
      this.resetCurrentMonkInfo();
      this.hideMonkSidebar();
      
      // Add welcome back message
      this.addWelcomeBackMessage();
      
      this.showNotification('👋', 'Session ended. Thank you for using Listening Monk.');
    }
  }

  resetCurrentMonkInfo() {
    document.querySelector('.avatar-placeholder').textContent = '🧘‍♂️';
    document.querySelector('.monk-name').textContent = 'Select a Monk';
    document.querySelector('.monk-status').textContent = 'Choose a monk to start your conversation';
    document.querySelector('.status-indicator').className = 'status-indicator online';
    
    // Disable action buttons
    document.getElementById('voiceCallBtn').disabled = true;
    
    // Disable message input
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = true;
    messageInput.placeholder = 'Select a monk to start chatting...';
    document.getElementById('sendBtn').disabled = true;
    
    // Clear selected monk card
    document.querySelectorAll('.monk-card').forEach(card => {
      card.classList.remove('selected');
    });
  }

  addWelcomeBackMessage() {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">🙏</div>
        <h3>Welcome to your safe space</h3>
        <p>Select a monk from the sidebar to start your conversation. Remember, all conversations are completely anonymous and confidential.</p>
      </div>
    `;
  }

  // Utility Functions
  showNotification(icon, message) {
    const toast = document.getElementById('notificationToast');
    const iconElement = toast.querySelector('.toast-icon');
    const messageElement = toast.querySelector('.toast-message');
    
    iconElement.textContent = icon;
    messageElement.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  playMessageSound() {
    const sound = document.getElementById('messageSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Could not play message sound:', e));
  }

  playCallSound() {
    const sound = document.getElementById('callSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Could not play call sound:', e));
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChatApp();
});

// Handle page visibility change for better performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause any ongoing processes when page is not visible
  } else {
    // Resume processes when page becomes visible
  }
});
