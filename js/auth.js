/**
 * Authentication management for the Stock Portfolio Dashboard
 */

const Auth = (function() {
  // DOM Elements
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnLarge = document.getElementById('loginBtnLarge');
  const logoutBtn = document.getElementById('logoutBtn');
  const userPic = document.getElementById('user-pic');
  const userName = document.getElementById('user-name');
  const userContainer = document.getElementById('user-container');
  const authLanding = document.getElementById('auth-landing');
  const dashboardContent = document.getElementById('dashboard-content');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  // Current user
  let currentUser = null;
  
  // Initialize auth functionality
  function init() {
    setupEventListeners();
    checkAuthState();
  }
  
  // Set up event listeners for login/logout
  function setupEventListeners() {
    if (loginBtn) loginBtn.addEventListener('click', signIn);
    if (loginBtnLarge) loginBtnLarge.addEventListener('click', signIn);
    if (logoutBtn) logoutBtn.addEventListener('click', signOut);
  }
  
  // Sign in with Google
  function signIn() {
    showLoading();
    
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        // User signed in
        Utils.showNotification('Successfully signed in!', 'success');
      })
      .catch((error) => {
        Utils.showNotification(`Error signing in: ${error.message}`, 'error');
        hideLoading();
      });
  }
  
  // Sign out
  function signOut() {
    auth.signOut()
      .then(() => {
        Utils.showNotification('You have signed out', 'info');
      })
      .catch((error) => {
        Utils.showNotification(`Error signing out: ${error.message}`, 'error');
      });
  }
  
  // Show loading overlay
  function showLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.add('active');
    }
  }
  
  // Hide loading overlay
  function hideLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.remove('active');
    }
  }
  
  // Check authentication state
  function checkAuthState() {
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        currentUser = user;
        displayUserInfo(user);
        showDashboard();
        
        // Initialize portfolio for this user
        Portfolio.init(user.uid);
        
        // Trigger an authenticated event
        document.dispatchEvent(new CustomEvent('user-authenticated', {
          detail: { user }
        }));
        
        hideLoading();
      } else {
        // User is signed out
        currentUser = null;
        showAuthLanding();
        
        // Trigger user signed out event
        document.dispatchEvent(new CustomEvent('user-signed-out'));
      }
    });
  }
  
  // Display user info
  function displayUserInfo(user) {
    // Set user's profile pic and name
    if (user.photoURL) {
      userPic.style.backgroundImage = `url(${user.photoURL})`;
    } else {
      // Default profile image
      userPic.style.backgroundImage = `url("https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=1a73e8&color=fff")`;
    }
    
    if (user.displayName) {
      userName.textContent = user.displayName;
    } else {
      userName.textContent = user.email || 'User';
    }
    
    loginBtn.style.display = 'none';
    userContainer.style.display = 'flex';
  }
  
  // Show auth landing page
  function showAuthLanding() {
    if (authLanding) authLanding.style.display = 'flex';
    if (dashboardContent) dashboardContent.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'block';
    if (userContainer) userContainer.style.display = 'none';
  }
  
  // Show dashboard
  function showDashboard() {
    if (authLanding) authLanding.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
  }
  
  // Get the current user
  function getCurrentUser() {
    return currentUser;
  }
  
  // Get the current user's UID
  function getCurrentUserId() {
    return currentUser ? currentUser.uid : null;
  }
  
  // Check if user is authenticated
  function isAuthenticated() {
    return currentUser !== null;
  }
  
  // Public API
  return {
    init,
    getCurrentUser,
    getCurrentUserId,
    isAuthenticated,
    showLoading,
    hideLoading
  };
})();

// Initialize Auth when the script loads
document.addEventListener('DOMContentLoaded', function() {
  Auth.init();
});
