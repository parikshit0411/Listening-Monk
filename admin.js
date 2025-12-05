// Admin Dashboard JavaScript
class AdminDashboard {
  constructor() {
    this.monks = [
      {
        id: 1,
        name: 'Monk Tenzin',
        avatar: '🧘‍♂️',
        specialty: 'Anxiety & Stress Relief',
        status: 'online',
        rating: 4.9,
        bio: 'Specializes in mindfulness and anxiety management with over 10 years of experience.',
        joinedDate: '2023-01-15'
      },
      {
        id: 2,
        name: 'Sister Maya',
        avatar: '🧘‍♀️',
        specialty: 'Depression & Emotional Support',
        status: 'online',
        rating: 4.8,
        bio: 'Compassionate listener focusing on depression and emotional healing.',
        joinedDate: '2023-03-22'
      },
      {
        id: 3,
        name: 'Monk Dharma',
        avatar: '🧘‍♂️',
        specialty: 'Grief & Loss Counseling',
        status: 'away',
        rating: 4.7,
        bio: 'Helps people navigate through difficult times of loss and grief.',
        joinedDate: '2023-02-10'
      },
      {
        id: 4,
        name: 'Sister Priya',
        avatar: '🧘‍♀️',
        specialty: 'Relationship Guidance',
        status: 'busy',
        rating: 4.9,
        bio: 'Provides guidance on relationships and interpersonal conflicts.',
        joinedDate: '2023-04-05'
      },
      {
        id: 5,
        name: 'Monk Bodhi',
        avatar: '🧘‍♂️',
        specialty: 'Life Transitions',
        status: 'online',
        rating: 4.6,
        bio: 'Supports individuals through major life changes and decisions.',
        joinedDate: '2023-05-18'
      },
      {
        id: 6,
        name: 'Sister Lotus',
        avatar: '🧘‍♀️',
        specialty: 'Self-Esteem & Confidence',
        status: 'online',
        rating: 4.8,
        bio: 'Helps build self-confidence and overcome limiting beliefs.',
        joinedDate: '2023-06-30'
      }
    ];

    this.schedules = [];
    this.currentEditingMonk = null;
    this.confirmCallback = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadMonksTable();
    this.populateMonkSelects();
    this.initializeScheduleDate();
    this.updateStats();
    this.loadScheduleGrid();
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout();
    });

    // Add monk
    document.getElementById('addMonkBtn').addEventListener('click', () => {
      this.showAddMonkModal();
    });

    // Monk form
    document.getElementById('monkForm').addEventListener('submit', (e) => {
      this.handleMonkForm(e);
    });

    document.getElementById('cancelMonkForm').addEventListener('click', () => {
      this.hideMonkModal();
    });

    document.getElementById('closeMonkModal').addEventListener('click', () => {
      this.hideMonkModal();
    });

    // Schedule form
    document.getElementById('addScheduleBtn').addEventListener('click', () => {
      this.showAddScheduleModal();
    });

    document.getElementById('scheduleForm').addEventListener('submit', (e) => {
      this.handleScheduleForm(e);
    });

    document.getElementById('cancelScheduleForm').addEventListener('click', () => {
      this.hideScheduleModal();
    });

    document.getElementById('closeScheduleModal').addEventListener('click', () => {
      this.hideScheduleModal();
    });

    // Schedule date change
    document.getElementById('scheduleDate').addEventListener('change', () => {
      this.loadScheduleGrid();
    });

    document.getElementById('scheduleMonkSelect').addEventListener('change', () => {
      this.loadScheduleGrid();
    });

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('resetSettingsBtn').addEventListener('click', () => {
      this.resetSettings();
    });

    // Confirmation modal
    document.getElementById('confirmYes').addEventListener('click', () => {
      if (this.confirmCallback) {
        this.confirmCallback();
        this.hideConfirmModal();
      }
    });

    document.getElementById('confirmNo').addEventListener('click', () => {
      this.hideConfirmModal();
    });

    document.getElementById('closeConfirmModal').addEventListener('click', () => {
      this.hideConfirmModal();
    });
  }

  switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
  }

  logout() {
    this.showConfirm('Are you sure you want to logout?', () => {
      localStorage.removeItem('adminLoggedIn');
      window.location.href = 'login.html';
    });
  }

  // Monk Management
  loadMonksTable() {
    const tbody = document.getElementById('monksTableBody');
    tbody.innerHTML = '';

    this.monks.forEach(monk => {
      const row = this.createMonkTableRow(monk);
      tbody.appendChild(row);
    });
  }

  createMonkTableRow(monk) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="table-avatar">${monk.avatar}</div>
      </td>
      <td>
        <div style="font-weight: 600;">${monk.name}</div>
      </td>
      <td>${monk.specialty}</td>
      <td>
        <span class="status-badge ${monk.status}">${this.capitalizeFirst(monk.status)}</span>
      </td>
      <td>⭐ ${monk.rating}</td>
      <td>${this.formatDate(monk.joinedDate)}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit" data-monk-id="${monk.id}" title="Edit Monk">✏️</button>
          <button class="action-btn delete" data-monk-id="${monk.id}" title="Delete Monk">🗑️</button>
        </div>
      </td>
    `;

    // Add event listeners
    const editBtn = row.querySelector('.edit');
    const deleteBtn = row.querySelector('.delete');

    editBtn.addEventListener('click', () => {
      this.editMonk(monk.id);
    });

    deleteBtn.addEventListener('click', () => {
      this.deleteMonk(monk.id);
    });

    return row;
  }

  showAddMonkModal() {
    this.currentEditingMonk = null;
    document.getElementById('monkModalTitle').textContent = 'Add New Monk';
    document.getElementById('monkForm').reset();
    this.showMonkModal();
  }

  editMonk(monkId) {
    const monk = this.monks.find(m => m.id === monkId);
    if (!monk) return;

    this.currentEditingMonk = monk;
    document.getElementById('monkModalTitle').textContent = 'Edit Monk';
    
    // Populate form
    document.getElementById('monkName').value = monk.name;
    document.getElementById('monkAvatar').value = monk.avatar;
    document.getElementById('monkSpecialty').value = monk.specialty;
    document.getElementById('monkStatus').value = monk.status;
    document.getElementById('monkBio').value = monk.bio;

    this.showMonkModal();
  }

  deleteMonk(monkId) {
    const monk = this.monks.find(m => m.id === monkId);
    if (!monk) return;

    this.showConfirm(`Are you sure you want to delete ${monk.name}?`, () => {
      this.monks = this.monks.filter(m => m.id !== monkId);
      this.loadMonksTable();
      this.updateStats();
      this.populateMonkSelects();
      this.showNotification('🗑️', 'Monk deleted successfully');
    });
  }

  handleMonkForm(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('monkName').value,
      avatar: document.getElementById('monkAvatar').value,
      specialty: document.getElementById('monkSpecialty').value,
      status: document.getElementById('monkStatus').value,
      bio: document.getElementById('monkBio').value
    };

    if (this.currentEditingMonk) {
      // Edit existing monk
      Object.assign(this.currentEditingMonk, formData);
      this.showNotification('✅', 'Monk updated successfully');
    } else {
      // Add new monk
      const newMonk = {
        ...formData,
        id: Math.max(...this.monks.map(m => m.id)) + 1,
        rating: 4.5,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      this.monks.push(newMonk);
      this.showNotification('✅', 'Monk added successfully');
    }

    this.loadMonksTable();
    this.updateStats();
    this.populateMonkSelects();
    this.hideMonkModal();
  }

  showMonkModal() {
    document.getElementById('monkModal').classList.add('active');
  }

  hideMonkModal() {
    document.getElementById('monkModal').classList.remove('active');
  }

  // Schedule Management
  populateMonkSelects() {
    const selects = [
      document.getElementById('scheduleMonkSelect'),
      document.getElementById('scheduleMonk')
    ];

    selects.forEach(select => {
      if (!select) return;
      
      // Keep "All Monks" option for the filter select
      if (select.id === 'scheduleMonkSelect') {
        const allOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (allOption) select.appendChild(allOption);
      } else {
        select.innerHTML = '';
      }

      this.monks.forEach(monk => {
        const option = document.createElement('option');
        option.value = monk.id;
        option.textContent = monk.name;
        select.appendChild(option);
      });
    });
  }

  initializeScheduleDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleDate').value = today;
  }

  showAddScheduleModal() {
    document.getElementById('scheduleForm').reset();
    this.showScheduleModal();
  }

  handleScheduleForm(e) {
    e.preventDefault();

    const scheduleData = {
      id: Date.now(),
      monkId: parseInt(document.getElementById('scheduleMonk').value),
      date: document.getElementById('scheduleDate').value || new Date().toISOString().split('T')[0],
      startTime: document.getElementById('scheduleStartTime').value,
      endTime: document.getElementById('scheduleEndTime').value,
      repeat: document.getElementById('scheduleRepeat').value
    };

    this.schedules.push(scheduleData);
    this.loadScheduleGrid();
    this.hideScheduleModal();
    this.showNotification('📅', 'Schedule added successfully');
  }

  loadScheduleGrid() {
    const grid = document.getElementById('scheduleGrid');
    const selectedDate = document.getElementById('scheduleDate').value;
    const selectedMonk = document.getElementById('scheduleMonkSelect').value;
    
    if (!selectedDate) return;

    // Create days of the week
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);

    grid.innerHTML = '';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + i);
      
      const dayElement = document.createElement('div');
      dayElement.className = 'schedule-day';
      
      const header = document.createElement('div');
      header.className = 'schedule-day-header';
      header.textContent = `${dayNames[i]} ${currentDay.getDate()}`;
      dayElement.appendChild(header);

      // Filter schedules for this day
      const daySchedules = this.schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const isSameDay = scheduleDate.toDateString() === currentDay.toDateString();
        const matchesMonk = !selectedMonk || schedule.monkId.toString() === selectedMonk;
        return isSameDay && matchesMonk;
      });

      // Add schedule slots
      daySchedules.forEach(schedule => {
        const monk = this.monks.find(m => m.id === schedule.monkId);
        if (!monk) return;

        const slot = document.createElement('div');
        slot.className = 'schedule-slot';
        slot.innerHTML = `
          <div style="font-weight: 600;">${monk.name}</div>
          <div>${schedule.startTime} - ${schedule.endTime}</div>
        `;
        dayElement.appendChild(slot);
      });

      grid.appendChild(dayElement);
    }
  }

  showScheduleModal() {
    document.getElementById('scheduleModal').classList.add('active');
  }

  hideScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
  }

  // Settings
  saveSettings() {
    const settings = {
      enableRegistration: document.getElementById('enableRegistration').checked,
      enableVoiceCalls: document.getElementById('enableVoiceCalls').checked,
      enableNotifications: document.getElementById('enableNotifications').checked,
      sessionTimeout: document.getElementById('sessionTimeout').value,
      maxConcurrentUsers: document.getElementById('maxConcurrentUsers').value
    };

    localStorage.setItem('adminSettings', JSON.stringify(settings));
    this.showNotification('💾', 'Settings saved successfully');
  }

  resetSettings() {
    this.showConfirm('Are you sure you want to reset all settings to defaults?', () => {
      document.getElementById('enableRegistration').checked = true;
      document.getElementById('enableVoiceCalls').checked = true;
      document.getElementById('enableNotifications').checked = true;
      document.getElementById('sessionTimeout').value = 60;
      document.getElementById('maxConcurrentUsers').value = 1000;
      
      localStorage.removeItem('adminSettings');
      this.showNotification('🔄', 'Settings reset to defaults');
    });
  }

  // Stats
  updateStats() {
    document.getElementById('totalMonks').textContent = this.monks.length;
    // Other stats would be updated from real data in production
  }

  // Utility functions
  showConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    this.confirmCallback = callback;
    this.showConfirmModal();
  }

  showConfirmModal() {
    document.getElementById('confirmModal').classList.add('active');
  }

  hideConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    this.confirmCallback = null;
  }

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

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Check if admin is logged in
  const isLoggedIn = localStorage.getItem('adminLoggedIn');
  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  new AdminDashboard();
});

// Export monks data for use in chat application
window.getMonksData = function() {
  const adminDashboard = window.adminDashboard;
  return adminDashboard ? adminDashboard.monks : [];
};
