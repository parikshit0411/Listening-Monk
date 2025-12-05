document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');

  // Loading Screen
  const loadingScreen = document.querySelector('#loadingScreen');
  const appContainer = document.querySelector('#appContainer');
  if (loadingScreen && appContainer) {
    console.log('Loading screen and app container found');
    setTimeout(() => {
      console.log('Hiding loading screen');
      loadingScreen.classList.add('hidden');
      appContainer.style.display = 'block';
    }, 2000);
  } else {
    console.error('Loading screen or app container not found', { loadingScreen, appContainer });
    if (appContainer) appContainer.style.display = 'block';
  }

  // Page Navigation
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-page]');
  const sectionLinks = document.querySelectorAll('[data-section]');
  const navToggle = document.querySelector('#navToggle');
  const navList = document.querySelector('.nav-list');

  function switchPage(pageId) {
    if (!document.querySelector(`#${pageId}Page`)) return;
    pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.querySelector(`#${pageId}Page`);
    if (targetPage) targetPage.classList.add('active');
    navLinks.forEach(link => link.classList.remove('active'));
    const targetLink = document.querySelector(`[data-page="${pageId}"]`);
    if (targetLink) targetLink.classList.add('active');
    if (window.innerWidth <= 768) {
      navList.classList.remove('active');
      navToggle.classList.remove('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.dataset.page;
      if (pageId === 'landing') {
        window.location.href = 'index.html';
      } else if (pageId === 'about') {
        window.location.href = 'about.html';
      } else if (pageId === 'auth') {
        window.location.href = 'login.html';
      } else {
        switchPage(pageId);
      }
    });
  });

  sectionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      const section = document.querySelector(`#${sectionId}`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        navLinks.forEach(l => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');
      } else if (sectionId === 'features' || sectionId === 'pricing') {
        window.location.href = `index.html#${sectionId}`;
      }
    });
  });

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }

  // Theme Toggle
  const themeToggle = document.querySelector('#themeToggle');
  if (themeToggle) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
  }

  // Auth Tabs
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');
  if (authTabs && authForms) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        authTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        authForms.forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.querySelector(`#${tabId}Form`).classList.add('active');
      });
    });
  }
});

// Fallback for loading screen
window.addEventListener('load', () => {
  console.log('Window load fired');
  const loadingScreen = document.querySelector('#loadingScreen');
  const appContainer = document.querySelector('#appContainer');
  if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
    console.log('Fallback: Hiding loading screen');
    loadingScreen.classList.add('hidden');
    if (appContainer) appContainer.style.display = 'block';
  }
});

// Login and Signup Handling
function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // Check for admin credentials
  if (email === 'admin@lm.com' && password === 'MONK@123') {
    localStorage.setItem('adminLoggedIn', 'true');
    window.location.href = 'admin.html';
    return;
  }

  // Regular user login validation
  if (email && password) {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    window.location.href = 'chat.html';
  } else {
    alert('Please enter both email and password.');
  }
}

function handleSignup() {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  // Store user data
  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userEmail', email);
  localStorage.setItem('userName', username);
  
  window.location.href = 'chat.html';
}
