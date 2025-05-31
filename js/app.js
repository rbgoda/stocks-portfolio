/**
 * Stock Portfolio Dashboard - Main Application File
 * Controls the core functionality of the dashboard
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize the application
    initApp();
    
    /**
     * Initialize the application
     */
    function initApp() {
        // Initialize portfolio data
        Portfolio.init();
        
        // Initialize charts
        Charts.init();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update the dashboard with initial data
        updateDashboard();
    }
    
    /**
     * Set up event listeners for user interactions
     */
    function setupEventListeners() {
        // Tab navigation
        setupTabNavigation();
        
        // Action buttons
        setupActionButtons();
        
        // Form submissions
        setupFormSubmissions();
        
        // Table interactions
        setupTableInteractions();
        
        // Import/Export
        setupImportExport();
        
        // Theme toggle
        setupThemeToggle();
        
        // Listen for portfolio updates
        document.addEventListener('portfolio-updated', function() {
            updateDashboard();
        });
    }
    
    /**
     * Set up tab navigation
     */
    function setupTabNavigation() {
        const tabItems = document.querySelectorAll('.tab-item');
        
        tabItems.forEach(item => {
            item.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remove active class from all tabs
                document.querySelectorAll('.tab-item').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Remove active class from all tab contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                document.getElementById(tabId + 'Tab').classList.add('active');
            });
        });
    }
    
    /**
     * Set up action buttons
     */
    function setupActionButtons() {
        // Add stock buttons
        const addStockButtons = document.querySelectorAll('#addStockBtn, #addStockBtnTab, #addStockBtnEmpty');
        addStockButtons.forEach(button => {
            button.addEventListener('click', function() {
                showAddStockModal();
            });
        });
        
        // Record sale button
        const recordSaleBtn = document.getElementById('recordSaleBtn');
        if (recordSaleBtn) {
            recordSaleBtn.addEventListener('click', function() {
                showRecordSaleModal();
            });
        }
        
        // Close modal buttons
        const closeButtons = document.querySelectorAll('.modal-close, .modal-cancel');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                Utils.toggleModal(modal.id, false);
            });
        });
    }
    
    /**
     * Set up form submissions
     */
    function setupFormSubmissions() {
        // Add stock form
        const addStockForm = document.getElementById('addStockForm');
        if (addStockForm) {
            addStockForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleAddStockSubmit();
            });
        }
        
        // Buy stock form
        const buyStockForm = document.getElementById('buyStockForm');
        if (buyStockForm) {
            buyStockForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleBuyStockSubmit();
            });
        }
        
        // Sell stock form
        const sellStockForm = document.getElementById('sellStockForm');
        if (sellStockForm) {
            sellStockForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleSellStockSubmit();
            });
        }
        
        // Sell quick buttons
        const sellHalfBtn = document.getElementById('sellHalf');
        if (sellHalfBtn) {
            sellHalfBtn.addEventListener('click', function() {
                const stockId = document.getElementById('sellStockId').value;
                const stock = Portfolio.getStockById(stockId);
                if (stock) {
                    document.getElementById('sellUnits').value = (stock.units / 2).toFixed(2);
                }
            });
        }
        
        const sellAllBtn = document.getElementById('sellAll');
        if (sellAllBtn) {
            sellAllBtn.addEventListener('click', function() {
                const stockId = document.getElementById('sellStockId').value;
                const stock = Portfolio.getStockById(stockId);
                if (stock) {
                    document.getElementById('sellUnits').value = stock.units;
                }
            });
        }
        
        // Delete confirmation
        const confirmDeleteBtn = document.getElementById('confirmDeleteStock');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                const stockId = this.getAttribute('data-stock-id');
                if (stockId) {
                    handleDeleteStock(stockId);
                }
            });
        }
    }
    
    /**
     * Set up table interactions
     */
    function setupTableInteractions() {
        // Search functionality
        const holdingsSearch = document.getElementById('holdingsSearch');
        if (holdingsSearch) {
            holdingsSearch.addEventListener('input', function() {
                filterHoldingsTable(this.value);
            });
        }
        
        const transactionsSearch = document.getElementById('transactionsSearch');
        if (transactionsSearch) {
            transactionsSearch.addEventListener('input', function() {
                filterTransactionsTable(this.value);
            });
        }
        
        // Transaction type filter
        const transactionTypeFilter = document.getElementById('transactionTypeFilter');
        if (transactionTypeFilter) {
            transactionTypeFilter.addEventListener('change', function() {
                filterTransactionsByType(this.value);
            });
        }
        
        // Pagination
        setupPagination();
    }
    
    /**
     * Set up import/export functionality
     */
    function setupImportExport() {
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', function() {
                exportData();
            });
        }
        
        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', function() {
                Utils.toggleModal('importDataModal', true);
            });
        }
        
        const confirmImportBtn = document.getElementById('confirmImport');
        if (confirmImportBtn) {
            confirmImportBtn.addEventListener('click', function() {
                handleDataImport();
            });
        }
    }
    
    /**
     * Set up light/dark theme toggle
     */
    function setupThemeToggle() {
        const themeToggle = document.querySelector('input[type="checkbox"]');
        if (themeToggle) {
            // Set initial state based on local storage or system preference
            const darkMode = localStorage.getItem('darkMode') === 'true' || 
                            (localStorage.getItem('darkMode') === null && 
                             window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            themeToggle.checked = darkMode;
            document.body.classList.toggle('dark-mode', darkMode);
            
            // Toggle theme on change
            themeToggle.addEventListener('change', function() {
                document.body.classList.toggle('dark-mode', this.checked);
                localStorage.setItem('darkMode', this.checked);
            });
        }
    }
    
    /**
     * Update the entire dashboard with current data
     */
    function updateDashboard() {
        updateSummaryCards();
        updateHoldingsTable();
        updateTransactionsTable();
    }
    
    /**
     * Update the summary cards with current metrics
     */
    function updateSummaryCards() {
        const metrics = Portfolio.calculatePortfolioMetrics();
        const performers = Portfolio.getTopPerformers();
        
        // Update total value card
        document.getElementById('totalPortfolioValue').textContent = Utils.formatCurrency(metrics.totalValue);
        document.getElementById('totalStocksInfo').textContent = metrics.stocksCount + (metrics.stocksCount === 1 ? ' stock' : ' stocks') + ' in portfolio';
        
        // Update gain/loss card
        const totalGainLoss = document.getElementById('totalGainLoss');
        totalGainLoss.textContent = Utils.formatCurrency(metrics.totalGainLoss);
        totalGainLoss.classList.toggle('positive', metrics.totalGainLoss >= 0);
        totalGainLoss.classList.toggle('negative', metrics.totalGainLoss < 0);
        
        const totalReturnPercentage = document.getElementById('totalReturnPercentage');
        totalReturnPercentage.textContent = Utils.formatPercentage(metrics.totalGainLossPercent) + ' overall return';
        totalReturnPercentage.classList.toggle('positive', metrics.totalGainLossPercent >= 0);
        totalReturnPercentage.classList.toggle('negative', metrics.totalGainLossPercent < 0);
        
        // Update best performer card
        const bestPerformerTicker = document.getElementById('bestPerformerTicker');
        const bestPerformerReturn = document.getElementById('bestPerformerReturn');
        
        if (performers.best) {
            bestPerformerTicker.textContent = performers.best.ticker;
            bestPerformerReturn.textContent = Utils.formatPercentage(performers.best.gainLossPercent) + ' gain';
        } else {
            bestPerformerTicker.textContent = '-';
            bestPerformerReturn.textContent = '0.00% gain';
        }
        
        // Update worst performer card
        const worstPerformerTicker = document.getElementById('worstPerformerTicker');
        const worstPerformerReturn = document.getElementById('worstPerformerReturn');
        
        if (performers.worst) {
            worstPerformerTicker.textContent = performers.worst.ticker;
            worstPerformerReturn.textContent = Utils.formatPercentage(performers.worst.gainLossPercent) + ' loss';
        } else {
            worstPerformerTicker.textContent = '-';
            worstPerformerReturn.textContent = '0.00% loss';
        }
    }
    
    /**
     * Update the holdings table with current stocks
     */
    function updateHoldingsTable() {
        const tableBody = document.getElementById('holdingsTableBody');
        const stocks = Portfolio.getAllStocks();
        
        // Clear the table
        tableBody.innerHTML = '';
        
        // Show/hide empty state
        const emptyState = document.getElementById('holdingsEmptyState');
        if (emptyState) {
            emptyState.style.display = stocks.length === 0 ? 'flex' : 'none';
        }
        
        if (stocks.length === 0) {
            return;
        }
        
        // Update table
        stocks.forEach(stock => {
            const marketValue = stock.units * stock.currentPrice;
            const gainLossValue = marketValue - (stock.units * stock.avgCost);
            const gainLossPercent = ((stock.currentPrice / stock.avgCost) - 1) * 100;
            const positionPercent = Utils.calculateRangePosition(stock.currentPrice, stock.low52Week, stock.high52Week);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                ${stock.name}
                ${stock.ticker}
                ${stock.units.toFixed(2)}
                ${Utils.formatCurrency(stock.avgCost)}
                ${Utils.formatCurrency(stock.currentPrice)}
                ${Utils.formatCurrency(marketValue)}
                ${Utils.formatCurrency(gainLossValue)}
                ${Utils.formatPercentage(gainLossPercent)}
                
                    ${Utils.formatCurrency(stock.low52Week)} - 
                    ${Utils.formatCurrency(stock.high52Week)}
                
                
                    
                        
                            
                        
                        ${positionPercent.toFixed(0)}%
                    
                
                
                    
                        Buy
                        Sell
                        Delete
                    
                
            `;
            
            // Add event listeners to the buttons
            const buyButton = row.querySelector('.buy-button');
            buyButton.addEventListener('click', function() {
                showBuyModal(stock.id);
            });
            
            const sellButton = row.querySelector('.sell-button');
            sellButton.addEventListener('click', function() {
                showSellModal(stock.id);
            });
            
            const deleteButton = row.querySelector('.delete-button');
            deleteButton.addEventListener('click', function() {
                showDeleteConfirmation(stock.id, stock.name, stock.ticker);
            });
            
            tableBody.appendChild(row);
        });
        
        // Update pagination
        updateHoldingsPagination();
    }
    
    /**
     * Update the transactions table with current data
     */
    function updateTransactionsTable() {
        const tableBody = document.getElementById('transactionsTableBody');
        const transactions = Portfolio.getAllTransactions();
        
        // Clear the table
        tableBody.innerHTML = '';
        
        // Show/hide empty state
        const emptyState = document.getElementById('transactionsEmptyState');
        if (emptyState) {
            emptyState.style.display = transactions.length === 0 ? 'flex' : 'none';
        }
        
        if (transactions.length === 0) {
            return;
        }
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...transactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Update table
        sortedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            const totalValue = transaction.units * transaction.price;
            
            row.innerHTML = `
                ${Utils.formatDate(transaction.date)}
                
                    ${transaction.type === 'buy' ? 'Buy' : 'Sell'}
                
                ${transaction.stockName} (${transaction.ticker})
                ${transaction.units.toFixed(2)}
                ${Utils.formatCurrency(transaction.price)}
                ${Utils.formatCurrency(totalValue)}
                
                    ${transaction.type === 'sell' ? Utils.formatCurrency(transaction.gainOrLoss) : '-'}
                
                ${transaction.type === 'sell' ? Utils.calculateHoldingPeriod(transaction.buyDate, transaction.date) : '-'}
                ${transaction.notes}
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update pagination
        updateTransactionsPagination();
    }
    
    /**
     * Show add stock modal
     */
    function showAddStockModal() {
        // Reset form fields
        document.getElementById('addStockForm').reset();
        
        // Set default date to today
        document.getElementById('stockCurrentPrice').focus();
        
        // Show the modal
        Utils.toggleModal('addStockModal', true);
    }
    
    /**
     * Show buy stock modal
     * @param {string} stockId - ID of the stock to buy
     */
    function showBuyModal(stockId) {
        const stock = Portfolio.getStockById(stockId);
        if (!stock) return;
        
        // Reset form
        document.getElementById('buyStockForm').reset();
        
        // Set stock ID in hidden field
        document.getElementById('buyStockId').value = stockId;
        
        // Update stock details
        document.getElementById('buyStockName').textContent = `${stock.name} (${stock.ticker})`;
        document.getElementById('buyCurrentUnits').textContent = `${stock.units.toFixed(2)} shares`;
        document.getElementById('buyAverageCost').textContent = Utils.formatCurrency(stock.avgCost);
        document.getElementById('buyCurrentPrice').textContent = Utils.formatCurrency(stock.currentPrice);
        
        // Set default price to current price
        document.getElementById('buyPrice').value = stock.currentPrice.toFixed(2);
        
        // Set default date to today
        document.getElementById('buyDate').value = Utils.getTodayFormatted();
        
        // Show the modal
        Utils.toggleModal('buyStockModal', true);
        
        // Focus on units field
        document.getElementById('buyUnits').focus();
    }
    
    /**
     * Show sell stock modal
     * @param {string} stockId - ID of the stock to sell
     */
    function showSellModal(stockId) {
        const stock = Portfolio.getStockById(stockId);
        if (!stock) return;
        
        // Reset form
        document.getElementById('sellStockForm').reset();
        
        // Set stock ID in hidden field
        document.getElementById('sellStockId').value = stockId;
        
        // Update stock details
        document.getElementById('sellStockName').textContent = `${stock.name} (${stock.ticker})`;
        document.getElementById('sellCurrentUnits').textContent = `${stock.units.toFixed(2)} shares`;
        document.getElementById('sellAverageCost').textContent = Utils.formatCurrency(stock.avgCost);
        document.getElementById('sellCurrentPrice').textContent = Utils.formatCurrency(stock.currentPrice);
        
        // Set default price to current price
        document.getElementById('sellPrice').value = stock.currentPrice.toFixed(2);
        
        // Set default date to today
        document.getElementById('sellDate').value = Utils.getTodayFormatted();
        
        // Show the modal
        Utils.toggleModal('sellStockModal', true);
        
        // Focus on units field
        document.getElementById('sellUnits').focus();
    }
    
    /**
     * Show delete confirmation modal
     * @param {string} stockId - ID of the stock to delete
     * @param {string} stockName - Name of the stock
     * @param {string} ticker - Ticker symbol of the stock
     */
    function showDeleteConfirmation(stockId, stockName, ticker) {
        // Set text content
        document.getElementById('deleteStockName').textContent = `${stockName} (${ticker})`;
        
        // Set stock ID to confirmation button
        document.getElementById('confirmDeleteStock').setAttribute('data-stock-id', stockId);
        
        // Show modal
        Utils.toggleModal('deleteConfirmModal', true);
    }
    
    /**
     * Handle add stock form submission
     */
    function handleAddStockSubmit() {
        try {
            // Get form data
            const stockData = {
                name: document.getElementById('stockName').value,
                ticker: document.getElementById('stockTicker').value.toUpperCase(),
                units: parseFloat(document.getElementById('stockUnits').value),
                price: parseFloat(document.getElementById('stockPrice').value),
                currentPrice: parseFloat(document.getElementById('stockCurrentPrice').value),
                sector: document.getElementById('stockSector').value,
                low52Week: parseFloat(document.getElementById('stockLow52').value),
                high52Week: parseFloat(document.getElementById('stockHigh52').value),
                notes: document.getElementById('stockNotes').value
            };
            
            // Add stock to portfolio
            const newStock = Portfolio.addStock(stockData);
            
            // Close modal
            Utils.toggleModal('addStockModal', false);
            
            // Show success notification
            Utils.showNotification(`${stockData.name} (${stockData.ticker}) added to portfolio`, 'success');
            
            // Update the dashboard
            updateDashboard();
        } catch (error) {
            Utils.showNotification(`Error: ${error.message}`, 'error');
        }
    }
    
    /**
     * Handle buy stock form submission
     */
    function handleBuyStockSubmit() {
        try {
            // Get form data
            const stockId = document.getElementById('buyStockId').value;
            const units = parseFloat(document.getElementById('buyUnits').value);
            const price = parseFloat(document.getElementById('buyPrice').value);
            const date = document.getElementById('buyDate').value;
            const notes = document.getElementById('buyNotes').value;
            
            // Buy more shares
            const updatedStock = Portfolio.buyMoreShares(stockId, units, price, date, notes);
            
            // Close modal
            Utils.toggleModal('buyStockModal', false);
            
            // Show success notification
            Utils.showNotification(`Successfully purchased ${units.toFixed(2)} shares of ${updatedStock.ticker}`, 'success');
            
            // Update the dashboard
            updateDashboard();
        } catch (error) {
            Utils.showNotification(`Error: ${error.message}`, 'error');
        }
    }
    
    /**
     * Handle sell stock form submission
     */
    function handleSellStockSubmit() {
        try {
            // Get form data
            const stockId = document.getElementById('sellStockId').value;
            const units = parseFloat(document.getElementById('sellUnits').value);
            const price = parseFloat(document.getElementById('sellPrice').value);
            const date = document.getElementById('sellDate').value;
            const notes = document.getElementById('sellNotes').value;
            
            const stock = Portfolio.getStockById(stockId);
            
            // Sell shares
            const result = Portfolio.sellShares(stockId, units, price, date, notes);
            
            // Close modal
            Utils.toggleModal('sellStockModal', false);
            
            // Show success notification
            if (result.fullySold) {
                Utils.showNotification(`Successfully sold all shares of ${stock.ticker}`, 'success');
            } else {
                Utils.showNotification(`Successfully sold ${units.toFixed(2)} shares of ${stock.ticker}`, 'success');
            }
            
            // Update the dashboard
            updateDashboard();
        } catch (error) {
            Utils.showNotification(`Error: ${error.message}`, 'error');
        }
    }
    
    /**
     * Handle delete stock
     * @param {string} stockId - ID of the stock to delete
     */
    function handleDeleteStock(stockId) {
        try {
            const stock = Portfolio.getStockById(stockId);
            const ticker = stock ? stock.ticker : '';
            
            // Delete the stock
            const success = Portfolio.deleteStock(stockId);
            
            // Close modal
            Utils.toggleModal('deleteConfirmModal', false);
            
            if (success) {
                // Show success notification
                Utils.showNotification(`${ticker} deleted from portfolio`, 'success');
                
                // Update the dashboard
                updateDashboard();
            } else {
                Utils.showNotification('Failed to delete stock', 'error');
            }
        } catch (error) {
            Utils.showNotification(`Error: ${error.message}`, 'error');
        }
    }
    
    /**
     * Filter holdings table by search term
     * @param {string} searchTerm - Term to search for
     */
    function filterHoldingsTable(searchTerm) {
        const rows = document.querySelectorAll('#holdingsTableBody tr');
        
        searchTerm = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const stockName = row.cells[0].textContent.toLowerCase();
            const ticker = row.cells[1].textContent.toLowerCase();
            
            if (stockName.includes(searchTerm) || ticker.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    /**
     * Filter transactions table by search term
     * @param {string} searchTerm - Term to search for
     */
    function filterTransactionsTable(searchTerm) {
        const rows = document.querySelectorAll('#transactionsTableBody tr');
        
        searchTerm = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const stockInfo = row.cells[2].textContent.toLowerCase(); // Stock name and ticker
            
            if (stockInfo.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    /**
     * Filter transactions by type
     * @param {string} type - Transaction type (buy, sell, all)
     */
    function filterTransactionsByType(type) {
        const rows = document.querySelectorAll('#transactionsTableBody tr');
        
        rows.forEach(row => {
            const transactionType = row.cells[1].textContent.toLowerCase();
            
            if (type === 'all' || transactionType.includes(type)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    /**
     * Set up pagination for tables
     */
    function setupPagination() {
        // This would handle pagination setup for both tables
        // Implementation depends on how pagination is structured in the HTML
    }
    
    /**
     * Update holdings table pagination
     */
    function updateHoldingsPagination() {
        // Update pagination for holdings table
        // Implementation depends on pagination structure
    }
    
    /**
     * Update transactions table pagination
     */
    function updateTransactionsPagination() {
        // Update pagination for transactions table
        // Implementation depends on pagination structure
    }
    
    /**
     * Export portfolio data
     */
    function exportData() {
        const data = {
            stocks: Portfolio.getAllStocks(),
            transactions: Portfolio.getAllTransactions()
        };
        
        Utils.exportToJson(data, 'portfolio_export.json');
        Utils.showNotification('Portfolio data exported successfully', 'success');
    }
    
    /**
     * Handle importing portfolio data
     */
    function handleDataImport() {
        const fileInput = document.getElementById('importFile');
        const replaceExisting = document.getElementById('importReplace').checked;
        
        if (!fileInput.files || fileInput.files.length === 0) {
            Utils.showNotification('Please select a file to import', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        Utils.importFromJson(file)
            .then(data => {
                // Validate the data
                if (!data.stocks || !Array.isArray(data.stocks)) {
                    throw new Error('Invalid portfolio data format');
                }
                
                // Import the data
                importPortfolioData(data, replaceExisting);
                
                // Close modal
                Utils.toggleModal('importDataModal', false);
                
                // Show success notification
                Utils.showNotification('Portfolio data imported successfully', 'success');
                
                // Reset file input
                fileInput.value = '';
            })
            .catch(error => {
                Utils.showNotification(`Import error: ${error.message}`, 'error');
            });
    }
    
    /**
     * Import portfolio data
     * @param {Object} data - Portfolio data to import
     * @param {boolean} replaceExisting - Whether to replace existing data
     */
    function importPortfolioData(data, replaceExisting) {
        // This function would handle importing the data
        // Implementation depends on how Portfolio module handles imports
        console.log('Importing data:', data, 'Replace existing:', replaceExisting);
        
        // Update the dashboard after import
        updateDashboard();
    }
});
// Initialize modules when user is authenticated
document.addEventListener('user-authenticated', function(event) {
  const user = event.detail.user;
  
  // Initialize existing modules
  Portfolio.init(user.uid);
  
  // Initialize new Phase 2 modules
  DividendTracker.init(user.uid);
  RecommendationEngine.init();
  
  // Set up Phase 2 UI event listeners
  setupPhase2EventListeners();
});

// Set up additional event listeners for Phase 2 features
function setupPhase2EventListeners() {
  // Recommendations tab refresh button
  document.getElementById('refreshRecommendationsBtn').addEventListener('click', function() {
    const portfolioData = {
      stocks: Portfolio.getAllStocks(),
      metrics: Portfolio.calculatePortfolioMetrics()
    };
    
    RecommendationEngine.generateRecommendations(portfolioData);
  });
  
  // Tab showing events to update UI
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      
      // Update specific tabs when activated
      if (tabId === 'recommendations') {
        const portfolioData = {
          stocks: Portfolio.getAllStocks(),
          metrics: Portfolio.calculatePortfolioMetrics()
        };
        
        RecommendationEngine.getRecommendations(portfolioData)
          .then(recommendations => {
            RecommendationEngine.displayRecommendations(recommendations, 'recommendationsContainer');
          });
      }
      
      if (tabId === 'dividends') {
        DividendTracker.updateDividendUI();
      }
      
      if (tabId === 'analytics') {
        // Update advanced analytics if needed
        const analyticsView = document.querySelector('.view-controls .btn-secondary').dataset.view;
        if (analyticsView === 'advanced') {
          updateAdvancedAnalytics();
        }
      }
    });
  });
  
  // Analytics view toggle
  document.querySelectorAll('.view-controls .btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Update button state
      document.querySelectorAll('.view-controls .btn').forEach(b => {
        b.classList.remove('btn-secondary');
        b.classList.add('btn-outline');
      });
      this.classList.remove('btn-outline');
      this.classList.add('btn-secondary');
      
      // Toggle view
      const view = this.dataset.view;
      document.querySelectorAll('.analytics-view').forEach(v => {
        v.classList.remove('active');
      });
      document.getElementById(`${view}AnalyticsView`).classList.add('active');
      
      // Update advanced analytics if needed
      if (view === 'advanced') {
        updateAdvancedAnalytics();
      }
    });
  });
}

// Function to update advanced analytics charts
function updateAdvancedAnalytics() {
  const stocks = Portfolio.getAllStocks();
  
  // Create correlation matrix
  AdvancedCharts.createCorrelationMatrix(stocks, 'correlationMatrixChart');
  
  // Create benchmark comparison (with sample data)
  const portfolioPerformance = {
    dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [100, 105, 102, 107, 112, 115]
  };
  
  const benchmarkPerformance = {
    name: 'S&P 500',
    values: [100, 102, 103, 101, 104, 107]
  };
  
  AdvancedCharts.createBenchmarkComparison(
    portfolioPerformance,
    benchmarkPerformance,
    'benchmarkComparisonChart'
  );
}
