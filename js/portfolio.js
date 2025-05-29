# Create the portfolio.js file with functionality for stock portfolio management
portfolio_js = """/**
 * Portfolio Management Functions
 * Handles core stock portfolio functionality including add, buy, sell, and delete operations
 */

const Portfolio = (function() {
  // Private variables
  const STORAGE_KEY = 'stock_portfolio_data';
  const TRANSACTIONS_KEY = 'stock_portfolio_transactions';
  
  let stocks = [];
  let transactions = [];
  
  // Initialize the portfolio from localStorage or with defaults
  function init() {
    loadData();
    updateUI();
  }
  
  // Load data from localStorage
  function loadData() {
    stocks = Utils.loadFromLocalStorage(STORAGE_KEY, []);
    transactions = Utils.loadFromLocalStorage(TRANSACTIONS_KEY, []);
    
    // If no data, add sample stocks
    if (stocks.length === 0) {
      addSampleStocks();
    }
  }
  
  // Add some sample stocks to get started
  function addSampleStocks() {
    const sampleStocks = [
      {
        id: Utils.generateId(),
        name: 'Apple Inc.',
        ticker: 'AAPL',
        units: 100,
        avgCost: 150.00,
        currentPrice: 175.00,
        sector: 'Technology',
        low52Week: 124.17,
        high52Week: 182.94,
        notes: 'Initial investment',
        dateAdded: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        name: 'Microsoft Corporation',
        ticker: 'MSFT',
        units: 50,
        avgCost: 220.00,
        currentPrice: 280.00,
        sector: 'Technology',
        low52Week: 219.35,
        high52Week: 290.15,
        notes: 'Long term hold',
        dateAdded: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        name: 'Tesla, Inc.',
        ticker: 'TSLA',
        units: 20,
        avgCost: 800.00,
        currentPrice: 700.00,
        sector: 'Consumer Discretionary',
        low52Week: 620.57,
        high52Week: 900.40,
        notes: 'High volatility stock',
        dateAdded: new Date().toISOString()
      }
    ];
    
    // Add sample stocks
    stocks = sampleStocks;
    
    // Add corresponding buy transactions
    const today = new Date().toISOString();
    sampleStocks.forEach(stock => {
      transactions.push({
        id: Utils.generateId(),
        type: 'buy',
        stockId: stock.id,
        ticker: stock.ticker,
        stockName: stock.name,
        units: stock.units,
        price: stock.avgCost,
        date: today,
        notes: 'Initial purchase'
      });
    });
    
    // Save to localStorage
    saveData();
  }
  
  // Save data to localStorage
  function saveData() {
    Utils.saveToLocalStorage(STORAGE_KEY, stocks);
    Utils.saveToLocalStorage(TRANSACTIONS_KEY, transactions);
  }
  
  // Get all stocks
  function getAllStocks() {
    return [...stocks];
  }
  
  // Get all transactions
  function getAllTransactions() {
    return [...transactions];
  }
  
  // Get a stock by ID
  function getStockById(id) {
    return stocks.find(stock => stock.id === id);
  }
  
  /**
   * Add a new stock to the portfolio
   * @param {Object} stockData - The stock data to add
   * @returns {Object} The newly added stock
   */
  function addStock(stockData) {
    // Create a new stock object with an ID
    const newStock = {
      id: Utils.generateId(),
      name: stockData.name,
      ticker: stockData.ticker,
      units: parseFloat(stockData.units),
      avgCost: parseFloat(stockData.price),
      currentPrice: parseFloat(stockData.currentPrice),
      sector: stockData.sector || 'Other',
      low52Week: parseFloat(stockData.low52Week),
      high52Week: parseFloat(stockData.high52Week),
      notes: stockData.notes || '',
      dateAdded: new Date().toISOString()
    };
    
    // Add to stocks array
    stocks.push(newStock);
    
    // Record the transaction
    const transaction = {
      id: Utils.generateId(),
      type: 'buy',
      stockId: newStock.id,
      ticker: newStock.ticker,
      stockName: newStock.name,
      units: newStock.units,
      price: newStock.avgCost,
      date: new Date().toISOString(),
      notes: stockData.notes || 'Initial purchase'
    };
    
    transactions.push(transaction);
    
    // Save data
    saveData();
    
    // Return the new stock
    return newStock;
  }
  
  /**
   * Buy more shares of an existing stock
   * @param {string} stockId - ID of the stock
   * @param {number} units - Number of units to buy
   * @param {number} price - Purchase price per unit
   * @param {string} date - Date of purchase
   * @param {string} notes - Optional notes
   * @returns {Object} The updated stock
   */
  function buyMoreShares(stockId, units, price, date, notes = '') {
    // Find the stock
    const stockIndex = stocks.findIndex(stock => stock.id === stockId);
    if (stockIndex === -1) return null;
    
    // Convert inputs to proper types
    units = parseFloat(units);
    price = parseFloat(price);
    
    // Get the existing stock
    const stock = stocks[stockIndex];
    
    // Calculate new average cost
    const totalUnits = stock.units + units;
    const totalCost = (stock.avgCost * stock.units) + (price * units);
    const newAvgCost = totalCost / totalUnits;
    
    // Update the stock
    const updatedStock = {
      ...stock,
      units: totalUnits,
      avgCost: newAvgCost
    };
    
    stocks[stockIndex] = updatedStock;
    
    // Record the transaction
    const transaction = {
      id: Utils.generateId(),
      type: 'buy',
      stockId: stockId,
      ticker: stock.ticker,
      stockName: stock.name,
      units: units,
      price: price,
      date: date || new Date().toISOString(),
      notes: notes
    };
    
    transactions.push(transaction);
    
    // Save data
    saveData();
    
    // Return the updated stock
    return updatedStock;
  }
  
  /**
   * Sell shares of a stock
   * @param {string} stockId - ID of the stock
   * @param {number} units - Number of units to sell
   * @param {number} price - Selling price per unit
   * @param {string} date - Date of the sale
   * @param {string} notes - Optional notes
   * @returns {Object} Result object with updated stock or null if completely sold
   */
  function sellShares(stockId, units, price, date, notes = '') {
    // Find the stock
    const stockIndex = stocks.findIndex(stock => stock.id === stockId);
    if (stockIndex === -1) return null;
    
    // Convert inputs to proper types
    units = parseFloat(units);
    price = parseFloat(price);
    
    // Get the existing stock
    const stock = stocks[stockIndex];
    
    // Check if units are valid
    if (units <= 0 || units > stock.units) {
      throw new Error('Invalid number of units to sell');
    }
    
    // Calculate gain or loss
    const costBasis = stock.avgCost * units;
    const saleValue = price * units;
    const gainOrLoss = saleValue - costBasis;
    
    // Record the transaction
    const transaction = {
      id: Utils.generateId(),
      type: 'sell',
      stockId: stockId,
      ticker: stock.ticker,
      stockName: stock.name,
      units: units,
      price: price,
      date: date || new Date().toISOString(),
      gainOrLoss: gainOrLoss,
      notes: notes
    };
    
    transactions.push(transaction);
    
    // Check if all shares were sold
    if (units === stock.units) {
      // Remove the stock from the portfolio but keep transaction history
      stocks.splice(stockIndex, 1);
      saveData();
      return { fullySold: true };
    } else {
      // Update the stock with remaining units
      const updatedStock = {
        ...stock,
        units: stock.units - units
      };
      
      stocks[stockIndex] = updatedStock;
      saveData();
      return { fullySold: false, stock: updatedStock };
    }
  }
  
  /**
   * Delete a stock from portfolio
   * @param {string} stockId - ID of the stock to delete
   * @returns {boolean} True if successful
   */
  function deleteStock(stockId) {
    const stockIndex = stocks.findIndex(stock => stock.id === stockId);
    if (stockIndex === -1) return false;
    
    // Remove the stock
    stocks.splice(stockIndex, 1);
    
    // Save data
    saveData();
    
    return true;
  }
  
  /**
   * Update current price of a stock
   * @param {string} stockId - ID of the stock
   * @param {number} newPrice - New current price
   * @returns {Object} The updated stock
   */
  function updateStockPrice(stockId, newPrice) {
    const stockIndex = stocks.findIndex(stock => stock.id === stockId);
    if (stockIndex === -1) return null;
    
    // Update the price
    stocks[stockIndex].currentPrice = parseFloat(newPrice);
    
    // Save data
    saveData();
    
    return stocks[stockIndex];
  }
  
  /**
   * Calculate portfolio metrics
   * @returns {Object} Portfolio summary metrics
   */
  function calculatePortfolioMetrics() {
    let totalValue = 0;
    let totalCost = 0;
    let gainersCount = 0;
    let losersCount = 0;
    
    // Calculate total value and cost
    stocks.forEach(stock => {
      const marketValue = stock.units * stock.currentPrice;
      const costBasis = stock.units * stock.avgCost;
      
      totalValue += marketValue;
      totalCost += costBasis;
      
      // Count gainers and losers
      if (stock.currentPrice > stock.avgCost) {
        gainersCount++;
      } else if (stock.currentPrice < stock.avgCost) {
        losersCount++;
      }
    });
    
    // Calculate overall gain/loss
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      stocksCount: stocks.length,
      gainersCount,
      losersCount
    };
  }
  
  /**
   * Get best and worst performing stocks
   * @param {string} metric - 'percentage' or 'value'
   * @returns {Object} Best and worst performing stocks
   */
  function getTopPerformers(metric = 'percentage') {
    if (stocks.length === 0) {
      return { best: null, worst: null };
    }
    
    // Calculate performance for each stock
    const performanceData = stocks.map(stock => {
      const gainLossValue = (stock.currentPrice - stock.avgCost) * stock.units;
      const gainLossPercent = (stock.currentPrice / stock.avgCost - 1) * 100;
      
      return {
        ...stock,
        gainLossValue,
        gainLossPercent
      };
    });
    
    // Sort by the specified metric
    const sortField = metric === 'percentage' ? 'gainLossPercent' : 'gainLossValue';
    
    // Sort ascending for worst performers
    performanceData.sort((a, b) => a[sortField] - b[sortField]);
    const worst = performanceData[0];
    
    // Sort descending for best performers
    performanceData.sort((a, b) => b[sortField] - a[sortField]);
    const best = performanceData[0];
    
    return { best, worst };
  }
  
  /**
   * Get portfolio allocation by sector
   * @returns {Array} Sector allocation data
   */
  function getSectorAllocation() {
    const sectorMap = {};
    let totalValue = 0;
    
    // Calculate total value and sector values
    stocks.forEach(stock => {
      const marketValue = stock.units * stock.currentPrice;
      totalValue += marketValue;
      
      if (!sectorMap[stock.sector]) {
        sectorMap[stock.sector] = 0;
      }
      
      sectorMap[stock.sector] += marketValue;
    });
    
    // Convert to percentage and create sorted array
    const sectorData = Object.keys(sectorMap).map(sector => ({
      sector,
      value: sectorMap[sector],
      percentage: (sectorMap[sector] / totalValue) * 100
    }));
    
    // Sort by value (descending)
    sectorData.sort((a, b) => b.value - a.value);
    
    return sectorData;
  }
  
  /**
   * Calculate realized and unrealized gains/losses
   * @returns {Object} Realized and unrealized gain/loss data
   */
  function calculateGainLossMetrics() {
    // Calculate unrealized gains/losses from current holdings
    let unrealizedGain = 0;
    let unrealizedLoss = 0;
    
    stocks.forEach(stock => {
      const gainLoss = (stock.currentPrice - stock.avgCost) * stock.units;
      if (gainLoss > 0) {
        unrealizedGain += gainLoss;
      } else {
        unrealizedLoss += Math.abs(gainLoss);
      }
    });
    
    // Calculate realized gains/losses from sell transactions
    let realizedGain = 0;
    let realizedLoss = 0;
    
    transactions
      .filter(t => t.type === 'sell' && t.gainOrLoss !== undefined)
      .forEach(transaction => {
        if (transaction.gainOrLoss > 0) {
          realizedGain += transaction.gainOrLoss;
        } else {
          realizedLoss += Math.abs(transaction.gainOrLoss);
        }
      });
    
    return {
      unrealizedGain,
      unrealizedLoss,
      realizedGain,
      realizedLoss,
      totalUnrealized: unrealizedGain - unrealizedLoss,
      totalRealized: realizedGain - realizedLoss
    };
  }
  
  /**
   * Get recovery potential for underwater stocks
   * @returns {Array} Recovery data for stocks with losses
   */
  function getRecoveryPotential() {
    return stocks
      .filter(stock => stock.currentPrice < stock.avgCost)
      .map(stock => {
        const percentDown = ((stock.avgCost - stock.currentPrice) / stock.avgCost) * 100;
        const percentToBreakeven = ((stock.avgCost / stock.currentPrice) - 1) * 100;
        
        return {
          id: stock.id,
          name: stock.name,
          ticker: stock.ticker,
          currentPrice: stock.currentPrice,
          avgCost: stock.avgCost,
          percentDown,
          percentToBreakeven
        };
      })
      // Sort by greatest recovery needed (descending)
      .sort((a, b) => b.percentToBreakeven - a.percentToBreakeven);
  }
  
  /**
   * Update the UI with current portfolio data
   */
  function updateUI() {
    // This function would be implemented based on the specific UI elements
    // in the HTML. It would update the DOM with current portfolio data,
    // populate tables, and update charts.
    
    // We'll trigger an event that the app.js can listen for
    document.dispatchEvent(new CustomEvent('portfolio-updated', {
      detail: {
        stocks: getAllStocks(),
        metrics: calculatePortfolioMetrics(),
        performers: getTopPerformers(),
        sectorAllocation: getSectorAllocation()
      }
    }));
  }
  
  // Public API
  return {
    init,
    getAllStocks,
    getAllTransactions,
    getStockById,
    addStock,
    buyMoreShares,
    sellShares,
    deleteStock,
    updateStockPrice,
    calculatePortfolioMetrics,
    getTopPerformers,
    getSectorAllocation,
    calculateGainLossMetrics,
    getRecoveryPotential,
    updateUI
  };
})();
"""
