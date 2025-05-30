/**
 * Portfolio Management Functions
 * Handles core stock portfolio functionality including add, buy, sell, and delete operations
 * Uses Firebase Firestore for data persistence
 */

const Portfolio = (function() {
  // Firebase collections
  const STOCKS_COLLECTION = 'stocks';
  const TRANSACTIONS_COLLECTION = 'transactions';
  
  // Local data
  let stocks = [];
  let transactions = [];
  let userId = null;
  let stocksListener = null;
  let transactionsListener = null;
  
  // DOM elements
  const loadingOverlay = document.getElementById('loading-overlay');
  
  // Initialize the portfolio 
  function init(uid) {
    if (!uid) {
      console.error('User ID is required to initialize portfolio');
      return;
    }
    
    userId = uid;
    
    // Show loading overlay
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    // Unsubscribe from previous listeners
    unsubscribeListeners();
    
    // Set up real-time listeners for stocks and transactions
    setupFirestoreListeners();
    
    // Check for sample data after a delay to ensure listeners are set up
    setTimeout(() => {
      checkAndAddSampleData();
    }, 1000);
  }
  
  // Set up Firestore listeners
  function setupFirestoreListeners() {
    // Stocks listener
    stocksListener = db.collection(STOCKS_COLLECTION)
      .where('userId', '==', userId)
      .onSnapshot(snapshot => {
        stocks = [];
        snapshot.forEach(doc => {
          stocks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Hide loading overlay after initial data load
        if (loadingOverlay && stocks.length > 0) {
          loadingOverlay.classList.remove('active');
        }
        
        updateUI();
      }, error => {
        console.error('Error listening to stocks:', error);
        Utils.showNotification('Error loading portfolio data', 'error');
        
        // Hide loading overlay on error
        if (loadingOverlay) loadingOverlay.classList.remove('active');
      });
    
    // Transactions listener
    transactionsListener = db.collection(TRANSACTIONS_COLLECTION)
      .where('userId', '==', userId)
      .onSnapshot(snapshot => {
        transactions = [];
        snapshot.forEach(doc => {
          transactions.push({
            id: doc.id,
            ...doc.data()
          });
        });
        updateUI();
      }, error => {
        console.error('Error listening to transactions:', error);
        Utils.showNotification('Error loading transaction data', 'error');
      });
  }
  
  // Unsubscribe from Firestore listeners
  function unsubscribeListeners() {
    if (stocksListener) {
      stocksListener();
      stocksListener = null;
    }
    
    if (transactionsListener) {
      transactionsListener();
      transactionsListener = null;
    }
  }
  
  /**
   * Check if the user has stocks, if not add sample data
   */
  async function checkAndAddSampleData() {
    try {
      const snapshot = await db.collection(STOCKS_COLLECTION)
        .where('userId', '==', userId)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        await addSampleStocks();
      } else {
        // If we have data, update prices
        updateStockPrices();
      }
    } catch (error) {
      console.error('Error checking for sample data:', error);
      
      // Hide loading overlay on error
      if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
  }
  
  // Add some sample stocks to get started
  async function addSampleStocks() {
    const sampleStocks = [
      {
        name: 'Apple Inc.',
        ticker: 'AAPL',
        units: 100,
        avgCost: 150.00,
        currentPrice: 175.00,
        sector: 'Technology',
        low52Week: 124.17,
        high52Week: 182.94,
        notes: 'Initial investment',
        dateAdded: new Date().toISOString(),
        userId: userId
      },
      {
        name: 'Microsoft Corporation',
        ticker: 'MSFT',
        units: 50,
        avgCost: 220.00,
        currentPrice: 280.00,
        sector: 'Technology',
        low52Week: 219.35,
        high52Week: 290.15,
        notes: 'Long term hold',
        dateAdded: new Date().toISOString(),
        userId: userId
      },
      {
        name: 'Tesla, Inc.',
        ticker: 'TSLA',
        units: 20,
        avgCost: 800.00,
        currentPrice: 700.00,
        sector: 'Consumer Discretionary',
        low52Week: 620.57,
        high52Week: 900.40,
        notes: 'High volatility stock',
        dateAdded: new Date().toISOString(),
        userId: userId
      }
    ];
    
    // Add sample stocks to Firestore
    for (const stock of sampleStocks) {
      try {
        const docRef = await db.collection(STOCKS_COLLECTION).add(stock);
        
        // Add corresponding buy transaction
        await db.collection(TRANSACTIONS_COLLECTION).add({
          type: 'buy',
          stockId: docRef.id,
          ticker: stock.ticker,
          stockName: stock.name,
          units: stock.units,
          price: stock.avgCost,
          date: new Date().toISOString(),
          notes: 'Initial purchase',
          userId: userId
        });
      } catch (error) {
        console.error('Error adding sample stock:', error);
      }
    }
    
    // Hide loading overlay when done
    if (loadingOverlay) loadingOverlay.classList.remove('active');
    
    Utils.showNotification('Sample portfolio created successfully', 'success');
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
   * Update stock prices from market data API
   */
  async function updateStockPrices() {
    if (stocks.length === 0) return;
    
    // Show loading overlay
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    try {
      // Get price updates from market data API
      const updates = await MarketData.updatePrices(stocks);
      
      // Update each stock in Firestore
      for (const update of updates) {
        await db.collection(STOCKS_COLLECTION).doc(update.id).update({
          currentPrice: update.currentPrice,
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Record update time
      MarketData.recordUpdateTime();
      
      Utils.showNotification('Stock prices updated', 'success');
    } catch (error) {
      console.error('Error updating stock prices:', error);
      Utils.showNotification('Error updating stock prices', 'error');
    } finally {
      // Hide loading overlay
      if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
  }
  
  /**
   * Add a new stock to the portfolio
   * @param {Object} stockData - The stock data to add
   * @returns {Promise<Object>} The newly added stock
   */
  async function addStock(stockData) {
    try {
      // Show loading overlay
      if (loadingOverlay) loadingOverlay.classList.add('active');
      
      // Create a new stock object
      const newStock = {
        name: stockData.name,
        ticker: stockData.ticker.toUpperCase(),
        units: parseFloat(stockData.units),
        avgCost: parseFloat(stockData.price),
        currentPrice: parseFloat(stockData.currentPrice),
        sector: stockData.sector || 'Other',
        low52Week: parseFloat(stockData.low52Week),
        high52Week: parseFloat(stockData.high52Week),
        notes: stockData.notes || '',
        dateAdded: new Date().toISOString(),
        userId: userId
      };
      
      // Add to Firestore
      const stockRef = await db.collection(STOCKS_COLLECTION).add(newStock);
      
      // Record the transaction
      const transaction = {
        type: 'buy',
        stockId: stockRef.id,
        ticker: newStock.ticker,
        stockName: newStock.name,
        units: newStock.units,
        price: newStock.avgCost,
        date: new Date().toISOString(),
        notes: stockData.notes || 'Initial purchase',
        userId: userId
      };
      
      await db.collection(TRANSACTIONS_COLLECTION).add(transaction);
      
      // Get the newly created stock with ID
      const stockSnapshot = await stockRef.get();
      const addedStock = {
        id: stockSnapshot.id,
        ...stockSnapshot.data()
      };
      
      Utils.showNotification(`Added ${newStock.ticker} to your portfolio`, 'success');
      
      // Hide loading overlay
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      
      return addedStock;
    } catch (error) {
      console.error('Error adding stock:', error);
      
      // Hide loading overlay on error
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      
      Utils.showNotification(`Error adding stock: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Buy more shares of an existing stock
   * @param {string} stockId - ID of the stock
   * @param {number} units - Number of units to buy
   * @param {number} price - Purchase price per unit
   * @param {string} date - Date of purchase
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} The updated stock
   */
  async function buyMoreShares(stockId, units, price, date, notes = '') {
    try {
      // Show loading overlay
      if (loadingOverlay) loadingOverlay.classList.add('active');
      
      // Get the existing stock
      const stockDoc = await db.collection(STOCKS_COLLECTION).doc(stockId).get();
      
      if (!stockDoc.exists) {
        throw new Error('Stock not found');
      }
      
      const stock = stockDoc.data();
      
      // Convert inputs to proper types
      units = parseFloat(units);
      price = parseFloat(price);
      
      // Calculate new average cost
      const totalUnits = stock.units + units;
      const totalCost = (stock.avgCost * stock.units) + (price * units);
      const newAvgCost = totalCost / totalUnits;
      
      // Update the stock in Firestore
      await db.collection(STOCKS_COLLECTION).doc(stockId).update({
        units: totalUnits,
        avgCost: newAvgCost
      });
      
      // Record the transaction
      const transaction = {
        type: 'buy',
        stockId: stockId,
        ticker: stock.ticker,
        stockName: stock.name,
        units: units,
        price: price,
        date: date || new Date().toISOString(),
        notes: notes,
        userId: userId
      };
      
      await db.collection(TRANSACTIONS_COLLECTION).add(transaction);
      
      // Get updated stock
      const updatedStockDoc = await db.collection(STOCKS_COLLECTION).doc(stockId).get();
      const updatedStock = {
        id: updatedStockDoc.id,
        ...updatedStockDoc.data()
      };
      
      Utils.showNotification(`Purchased ${units} more shares of ${stock.ticker}`, 'success');
      
      // Hide loading overlay
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      
      return updatedStock;
    } catch (error) {
      console.error('Error buying more shares:', error);
      
      // Hide loading overlay on error
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      
      Utils.showNotification(`Error buying shares: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Sell shares of a stock
   * @param {string} stockId - ID of the stock
   * @param {number} units - Number of units to sell
   * @param {number} price - Selling price per unit
   * @param {string} date - Date of the sale
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Result object
   */
  async function sellShares(stockId, units, price, date, notes = '') {
    try {
      // Show loading overlay
      if (loadingOverlay) loadingOverlay.classList.add('active');
      
      // Get the existing stock
      const stockDoc = await db.collection(STOCKS_COLLECTION).doc(stockId).get();
      
      if (!stockDoc.exists) {
        throw new Error('Stock not found');
      }
      
      const stock = stockDoc.data();
      
      // Convert inputs to proper types
      units = parseFloat(units);
      price = parseFloat(price);
      
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
        type: 'sell',
        stockId: stockId,
        ticker: stock.ticker,
        stockName: stock.name,
        units: units,
        price: price,
        date: date || new Date().toISOString(),
        gainOrLoss: gainOrLoss,
        notes: notes,
        userId: userId
      };
      
      await db.collection(TRANSACTIONS_COLLECTION).add(transaction);
      
      // Check if all shares were sold
      if (units === stock.units) {
        // Remove the stock from the portfolio but keep transaction history
        await db.collection(STOCKS_COLLECTION).doc(stockId).delete();
        
        Utils.showNotification(`Sold all shares of ${stock.ticker}`, 'success');
        
        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.remove('active');
        
        return { fullySold: true };
      } else {
        // Update the stock with remaining units
        const updatedStock = {
          units: stock.units - units
        };
        
        await db.collection(STOCKS_COLLECTION).doc(stockId).update(updatedStock);
        
        // Get the updated stock
        const updatedStockDoc = await db.collection(STOCKS_COLLECTION).doc(stockId).get();
        const result = { 
          fullySold: false, 
          stock: {
            id: updatedStockDoc.id,
            ...updatedStockDoc.data()
          }
        };
        
        Utils.showNotification(`Sold ${units} shares of ${stock.ticker}`, 'success');
        
        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.remove('active');
        
        return result;
      }
    } catch (error) {
      console.error('Error selling shares:', error);
      
      // Hide loading overlay on error
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      
      Utils.showNotification(`Error selling shares: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Delete a stock from portfolio
   * @param {string} stockId - ID of the stock to delete
   * @returns {Promise<boolean>} True if successful
   */
  async function deleteStock(stockId) {
    try {
      // Show loading overlay
      if (loadingOverlay) loadingOverlay.classList.add('active');
      
      // Get stock info before deletion for notification
      const stockDoc = await db.collection(STOCKS_COLLECTION).doc(stockId).get();
      const ticker = stockDoc.exists ? stockDoc.data().ticker : 'Stock';
      
      // Delete the stock
      await db.collection(STOCKS_COLLECTION).doc(stockId).delete();
      
      Utils.showNotification(`Deleted ${ticker} from your portfolio`, 'success');
      
      // Hide loading overlay
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      
      return true;
    } catch (error) {
      console.error('Error deleting stock:', error);
      
      // Hide loading overlay on error
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      
      Utils.showNotification(`Error deleting stock: ${error.message}`, 'error');
      throw error;
    }
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
   * Get sector performance data
   * @returns {Array} Performance data by sector
   */
  function getSectorPerformance() {
    // Group stocks by sector
    const sectors = {};
    
    stocks.forEach(stock => {
      if (!sectors[stock.sector]) {
        sectors[stock.sector] = {
          sector: stock.sector,
          totalValue: 0,
          totalCost: 0
        };
      }
      
      sectors[stock.sector].totalValue += stock.units * stock.currentPrice;
      sectors[stock.sector].totalCost += stock.units * stock.avgCost;
    });
    
    // Calculate performance by sector
    return Object.values(sectors).map(sector => {
      const performance = sector.totalCost > 0 ? ((sector.totalValue / sector.totalCost) - 1) * 100 : 0;
      return {
        sector: sector.sector,
        totalValue: sector.totalValue,
        totalCost: sector.totalCost,
        performance
      };
    });
  }
  
  /**
   * Update the UI with current portfolio data
   */
  function updateUI() {
    // Dispatch event with updated data
    document.dispatchEvent(new CustomEvent('portfolio-updated', {
      detail: {
        stocks: getAllStocks(),
        transactions: getAllTransactions(),
        metrics: calculatePortfolioMetrics(),
        performers: getTopPerformers(),
        sectorAllocation: getSectorAllocation(),
        gainLoss: calculateGainLossMetrics(),
        recovery: getRecoveryPotential(),
        sectors: getSectorPerformance()
      }
    }));
  }
  
  // Public API
  return {
    init,
    checkAndAddSampleData,
    getAllStocks,
    getAllTransactions,
    getStockById,
    addStock,
    buyMoreShares,
    sellShares,
    deleteStock,
    updateStockPrice,
    updateStockPrices,
    calculatePortfolioMetrics,
    getTopPerformers,
    getSectorAllocation,
    calculateGainLossMetrics,
    getRecoveryPotential,
    getSectorPerformance,
    unsubscribeListeners
  };
})();
