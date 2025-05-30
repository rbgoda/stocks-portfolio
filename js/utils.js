/**
 * Utility functions for the Stock Portfolio Dashboard
 */

const Utils = (function() {
  /**
   * Format a number as currency
   * @param {number} value - The value to format
   * @param {string} currency - The currency symbol
   * @return {string} The formatted currency string
   */
  function formatCurrency(value, currency = '$') {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    
    return currency + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }
  
  /**
   * Format a number as percentage
   * @param {number} value - The value to format
   * @param {boolean} includeSign - Whether to include a plus sign for positive values
   * @return {string} The formatted percentage string
   */
  function formatPercentage(value, includeSign = true) {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    
    let sign = '';
    if (includeSign && value > 0) {
      sign = '+';
    }
    
    return sign + value.toFixed(2) + '%';
  }
  
  /**
   * Format a number with commas for thousands
   * @param {number} value - The value to format
   * @param {number} decimals - The number of decimal places
   * @return {string} The formatted number string
   */
  function formatNumber(value, decimals = 2) {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    
    return value.toFixed(decimals).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }
  
  /**
   * Format a date in a readable format
   * @param {string|Date} date - The date to format
   * @param {string} format - The format to use (short, medium, long)
   * @return {string} The formatted date string
   */
  function formatDate(date, format = 'short') {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) {
      return '';
    }
    
    switch(format) {
      case 'short':
        return d.toLocaleDateString();
      case 'medium':
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'long':
        return d.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      default:
        return d.toLocaleDateString();
    }
  }
  
  /**
   * Calculate the holding period between two dates
   * @param {string|Date} startDate - The start date
   * @param {string|Date} endDate - The end date (default: today)
   * @return {string} The formatted holding period
   */
  function calculateHoldingPeriod(startDate, endDate = new Date()) {
    if (!startDate) return '';
    
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '';
    }
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return diffDays + (diffDays === 1 ? ' day' : ' days');
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months + (months === 1 ? ' month' : ' months');
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      
      if (remainingMonths === 0) {
        return years + (years === 1 ? ' year' : ' years');
      } else {
        return years + (years === 1 ? ' year ' : ' years ') + 
               remainingMonths + (remainingMonths === 1 ? ' month' : ' months');
      }
    }
  }
  
  /**
   * Generate a unique ID
   * @return {string} A unique ID string
   */
  function generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }
  
  /**
   * Show a notification message
   * @param {string} message - The message to show
   * @param {string} type - The message type (success, error, warning, info)
   * @param {number} duration - How long to show the message (ms)
   */
  function showNotification(message, type = 'info', duration = 3000) {
    // Check if notification container exists, if not create it
    let container = document.getElementById('notification-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        ${message}
      </div>
      <button class="notification-close">&times;</button>
    `;
    
    // Style the notification
    notification.style.backgroundColor = type === 'success' ? '#34a853' : 
                                        type === 'error' ? '#ea4335' :
                                        type === 'warning' ? '#fbbc04' : '#1a73e8';
    notification.style.color = '#ffffff';
    notification.style.padding = '12px 16px';
    notification.style.borderRadius = '4px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    
    // Style close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#ffffff';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '10px';
    
    // Add to container
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Add close functionality
    closeBtn.addEventListener('click', () => {
      notification.style.opacity = '0';
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    });
    
    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentNode === container) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode === container) {
            container.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
  }
  
  /**
   * Calculate the position of a stock in its 52-week range
   * @param {number} current - The current price
   * @param {number} low - The 52-week low
   * @param {number} high - The 52-week high
   * @return {number} A value between 0 and 100
   */
  function calculateRangePosition(current, low, high) {
    if (low === high) return 50;
    return Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  }
  
  /**
   * Get today's date in YYYY-MM-DD format
   * @return {string} Today's date
   */
  function getTodayFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Helper function to toggle modal visibility
   * @param {string} modalId - The ID of the modal to toggle
   * @param {boolean} show - Whether to show or hide the modal
   */
  function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (modal) {
      if (show) {
        modal.classList.add('active');
      } else {
        modal.classList.remove('active');
      }
    }
  }
  
  /**
   * Export data as JSON file
   * @param {object} data - The data to export
   * @param {string} fileName - The file name
   */
  function exportToJson(data, fileName = 'portfolio_export.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Import data from a JSON file
   * @param {File} file - The file to import
   * @return {Promise} A promise that resolves with the parsed data
   */
  function importFromJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  // Public API
  return {
    formatCurrency,
    formatPercentage,
    formatNumber,
    formatDate,
    calculateHoldingPeriod,
    generateId,
    showNotification,
    calculateRangePosition,
    getTodayFormatted,
    toggleModal,
    exportToJson,
    importFromJson
  };
})();
