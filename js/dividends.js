/**
 * Dividend tracking functionality for stock portfolio dashboard
 */

const DividendTracker = (function() {
  // Firebase collection for dividends
  const DIVIDENDS_COLLECTION = 'dividends';
  let dividends = [];
  let userId = null;
  
  /**
   * Initialize dividend tracking
   */
  function init(uid) {
    userId = uid;
    
    if (!uid) {
      console.error('User ID is required for dividend tracking');
      return;
    }
    
    setupFirestoreListeners();
    setupEventListeners();
  }
  
  /**
   * Set up Firestore listeners for dividends
   */
  function setupFirestoreListeners() {
    // In real implementation, this would listen to Firestore
    // For demo, we'll use mock data
    
    // Simulate fetching data from Firestore
    setTimeout(() => {
      dividends = generateSampleDividendData();
      updateDividendUI();
    }, 1000);
    
    // Real implementation would be:
    /*
    db.collection(DIVIDENDS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('exDate', 'desc')
      .onSnapshot(snapshot => {
        dividends = [];
        snapshot.forEach(doc => {
          dividends.push({
            id: doc.id,
            ...doc.data()
          });
        });
        updateDividendUI();
      }, error => {
        console.error('Error loading dividend data:', error);
      });
    */
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Add event listeners for any dividend-related UI elements here
  }
  
  /**
   * Generate sample dividend data for demo purposes
   */
  function generateSampleDividendData() {
    // Current date for reference
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Generate dates from past 6 months to future 6 months
    const sampleData = [];
    
    // Sample dividend stocks
    const dividendStocks = [
      { ticker: 'AAPL', name: 'Apple Inc.', amount: 0.24, frequency: 'quarterly', units: 100 },
      { ticker: 'MSFT', name: 'Microsoft Corp.', amount: 0.68, frequency: 'quarterly', units: 50 },
      { ticker: 'JNJ', name: 'Johnson & Johnson', amount: 1.19, frequency: 'quarterly', units: 30 },
      { ticker: 'PG', name: 'Procter & Gamble', amount: 0.9407, frequency: 'quarterly', units: 45 },
      { ticker: 'KO', name: 'Coca-Cola Company', amount: 0.46, frequency: 'quarterly', units: 120 }
    ];
    
    // Generate past dividends
    for (let i = 6; i >= 1; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - Math.floor((currentMonth - i + 12) / 12);
      
      // Add dividend entries for this month
      dividendStocks.forEach(stock => {
        // Only add if it matches the frequency (quarterly)
        if (stock.frequency === 'quarterly' && month % 3 === 0) {
          const exDate = new Date(year, month, 10);
          const paymentDate = new Date(year, month, 25);
          
          sampleData.push({
            id: Utils.generateId(),
            stockId: Utils.generateId(),
            userId: userId,
            ticker: stock.ticker,
            stockName: stock.name,
            exDate: exDate.toISOString(),
            paymentDate: paymentDate.toISOString(),
            amountPerShare: stock.amount,
            totalAmount: stock.amount * stock.units,
            units: stock.units,
            reinvested: Math.random() > 0.7, // 30% chance of being reinvested
            notes: ''
          });
        }
      });
    }
    
    // Generate future dividends
    for (let i = 0; i <= 6; i++) {
      const month = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      
      // Add dividend entries for this month
      dividendStocks.forEach(stock => {
        // Only add if it matches the frequency (quarterly)
        if (stock.frequency === 'quarterly' && month % 3 === 0) {
          const exDate = new Date(year, month, 10);
          const paymentDate = new Date(year, month, 25);
          
          // Only add if the date is in the future
          if (exDate >= now) {
            sampleData.push({
              id: Utils.generateId(),
              stockId: Utils.generateId(),
              userId: userId,
              ticker: stock.ticker,
              stockName: stock.name,
              exDate: exDate.toISOString(),
              paymentDate: paymentDate.toISOString(),
              amountPerShare: stock.amount,
              totalAmount: stock.amount * stock.units,
              units: stock.units,
              reinvested: false, // Future dividends aren't reinvested yet
              notes: 'Estimated'
            });
          }
        }
      });
    }
    
    return sampleData;
  }
  
  /**
   * Get all dividends
   */
  function getAllDividends() {
    return [...dividends];
  }
  
  /**
   * Get upcoming dividends (next 30 days)
   */
  function getUpcomingDividends() {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    return dividends.filter(div => {
      const exDate = new Date(div.exDate);
      return exDate >= today && exDate <= thirtyDaysLater;
    }).sort((a, b) => new Date(a.exDate) - new Date(b.exDate));
  }
  
  /**
   * Calculate annual dividend income
   */
  function calculateAnnualDividendIncome() {
    // Group by stock and calculate annual income based on frequency
    const stockIncomes = {};
    
    // Get the most recent dividend for each stock
    dividends.forEach(div => {
      if (!stockIncomes[div.ticker] || new Date(div.exDate) > new Date(stockIncomes[div.ticker].exDate)) {
        stockIncomes[div.ticker] = div;
      }
    });
    
    // Calculate annual income
    let annualIncome = 0;
    Object.values(stockIncomes).forEach(div => {
      // Assuming quarterly dividends for all stocks in this demo
      annualIncome += div.totalAmount * 4;
    });
    
    return annualIncome;
  }
  
  /**
   * Calculate portfolio dividend yield
   */
  function calculatePortfolioYield(portfolioValue) {
    if (!portfolioValue || portfolioValue === 0) return 0;
    
    const annualIncome = calculateAnnualDividendIncome();
    return (annualIncome / portfolioValue) * 100;
  }
  
  /**
   * Create dividend calendar visualization
   */
  function createDividendCalendar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Get current date information
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
      <button class="btn btn-sm btn-icon calendar-nav prev">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h3>${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}</h3>
      <button class="btn btn-sm btn-icon calendar-nav next">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    container.appendChild(header);
    
    // Create calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyDay);
    }
    
    // Add cells for each day
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      dayCell.textContent = day;
      
      // Highlight today
      if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
        dayCell.classList.add('today');
      }
      
      // Check for dividends on this day
      const startOfDay = new Date(currentYear, currentMonth, day);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(currentYear, currentMonth, day);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dividendsOnDay = dividends.filter(div => {
        const exDate = new Date(div.exDate);
        return exDate >= startOfDay && exDate <= endOfDay;
      });
      
      const paymentsOnDay = dividends.filter(div => {
        const paymentDate = new Date(div.paymentDate);
        return paymentDate >= startOfDay && paymentDate <= endOfDay;
      });
      
      if (dividendsOnDay.length > 0) {
        dayCell.classList.add('has-ex-dividends');
        
        // Add dividend indicators
        dividendsOnDay.forEach(div => {
          const indicator = document.createElement('div');
          indicator.className = 'dividend-indicator ex-date';
          indicator.title = `Ex-Dividend: ${div.stockName} (${div.ticker}): ${Utils.formatCurrency(div.amountPerShare)} per share`;
          indicator.textContent = div.ticker;
          dayCell.appendChild(indicator);
        });
      }
      
      if (paymentsOnDay.length > 0) {
        dayCell.classList.add('has-payments');
        
        // Add payment indicators
        paymentsOnDay.forEach(div => {
          const indicator = document.createElement('div');
          indicator.className = 'dividend-indicator payment-date';
          indicator.title = `Payment: ${div.stockName} (${div.ticker}): ${Utils.formatCurrency(div.totalAmount)} total`;
          indicator.textContent = div.ticker;
          dayCell.appendChild(indicator);
        });
      }
      
      calendarGrid.appendChild(dayCell);
    }
    
    container.appendChild(calendarGrid);
    
    // Add legend
    const legend = document.createElement('div');
    legend.className = 'calendar-legend';
    legend.innerHTML = `
      <div class="legend-item">
        <span class="legend-color ex-date"></span>
        <span class="legend-label">Ex-Dividend Date</span>
      </div>
      <div class="legend-item">
        <span class="legend-color payment-date"></span>
        <span class="legend-label">Payment Date</span>
      </div>
    `;
    container.appendChild(legend);
  }
  
  /**
   * Update dividend summary
   */
  function updateDividendSummary() {
    // Get portfolio value from Portfolio module
    const portfolioMetrics = Portfolio.calculatePortfolioMetrics();
    const portfolioValue = portfolioMetrics.totalValue;
    
    // Calculate annual income and yield
    const annualIncome = calculateAnnualDividendIncome();
    const yield = calculatePortfolioYield(portfolioValue);
    const monthlyAverage = annualIncome / 12;
    
    // Update UI
    document.getElementById('annualDividendIncome').textContent = Utils.formatCurrency(annualIncome);
    document.getElementById('portfolioYield').textContent = Utils.formatPercentage(yield);
    document.getElementById('monthlyDividendAvg').textContent = Utils.formatCurrency(monthlyAverage);
  }
  
  /**
   * Update upcoming dividends list
   */
  function updateUpcomingDividends() {
    const container = document.getElementById('upcomingDividends');
    if (!container) return;
    
    const upcomingDivs = getUpcomingDividends();
    
    if (upcomingDivs.length === 0) {
      container.innerHTML = '<p class="empty-state-text">No upcoming dividends in the next 30 days.</p>';
      return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Create list
    const ul = document.createElement('ul');
    ul.className = 'upcoming-dividends';
    
    upcomingDivs.forEach(div => {
      const li = document.createElement('li');
      
      const exDate = new Date(div.exDate);
      const today = new Date();
      const daysUntil = Math.ceil((exDate - today) / (1000 * 60 * 60 * 24));
      
      li.innerHTML = `
        <div class="dividend-date">
          ${exDate.toLocaleDateString()} 
          <span class="days-until">(${daysUntil} day${daysUntil !== 1 ? 's' : ''})</span>
        </div>
        <div class="dividend-stock">
          <strong>${div.ticker}</strong>: ${div.stockName}
        </div>
        <div class="dividend-amount">
          ${Utils.formatCurrency(div.amountPerShare)}/share
          <span class="total-amount">(${Utils.formatCurrency(div.totalAmount)} total)</span>
        </div>
      `;
      
      ul.appendChild(li);
    });
    
    container.appendChild(ul);
  }
  
  /**
   * Update all dividend UI elements
   */
  function updateDividendUI() {
    createDividendCalendar('dividendCalendar');
    updateDividendSummary();
    updateUpcomingDividends();
    createDividendHistoryChart();
  }
  
  /**
   * Create dividend history chart
   */
  function createDividendHistoryChart() {
    const ctx = document.getElementById('dividendHistoryChart');
    if (!ctx) return;
    
    // Group dividends by month
    const monthlyData = {};
    const pastDividends = dividends.filter(div => new Date(div.paymentDate) <= new Date())
      .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
    
    pastDividends.forEach(div => {
      const date = new Date(div.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          total: 0,
          reinvested: 0,
          cash: 0
        };
      }
      
      monthlyData[monthKey].total += div.totalAmount;
      
      if (div.reinvested) {
        monthlyData[monthKey].reinvested += div.totalAmount;
      } else {
        monthlyData[monthKey].cash += div.totalAmount;
      }
    });
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Skip if no data
    if (sortedMonths.length === 0) {
      return;
    }
    
    // Format labels for display
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      return `${new Date(0, parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
    });
    
    // Create chart
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Reinvested',
            data: sortedMonths.map(month => monthlyData[month].reinvested),
            backgroundColor: 'rgba(52, 168, 83, 0.7)',
            borderColor: 'rgba(52, 168, 83, 1)',
            borderWidth: 1,
            stack: 'Stack 0'
          },
          {
            label: 'Cash',
            data: sortedMonths.map(month => monthlyData[month].cash),
            backgroundColor: 'rgba(66, 133, 244, 0.7)',
            borderColor: 'rgba(66, 133, 244, 1)',
            borderWidth: 1,
            stack: 'Stack 0'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + Utils.formatCurrency(context.raw);
              },
              footer: function(tooltipItems) {
                const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                return 'Total: ' + Utils.formatCurrency(total);
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              borderDash: [3, 3]
            },
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value, '$');
              }
            }
          }
        }
      }
    });
    
    return chart;
  }
  
  // Public API
  return {
    init,
    getAllDividends,
    getUpcomingDividends,
    calculateAnnualDividendIncome,
    calculatePortfolioYield,
    createDividendCalendar,
    updateDividendUI,
    createDividendHistoryChart
  };
})();
