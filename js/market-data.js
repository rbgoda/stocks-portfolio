/**
 * Market Data API integration for Stock Portfolio Dashboard
 */

const MarketData = (function() {
  // AlphaVantage API key - Replace with your own API key
  const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY';
  const BASE_URL = 'https://www.alphavantage.co/query';
  
  // Cache for API responses
  const cache = {};
  const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
  
  // DOM elements
  const lastUpdatedTime = document.getElementById('lastUpdatedTime');
  const refreshPricesBtn = document.getElementById('refreshPricesBtn');
  const refreshPricesBtnSmall = document.getElementById('refreshPricesBtnSmall');
  
  // Initialize
  function init() {
    setupEventListeners();
    updateLastUpdatedTime();
  }
  
  // Set up event listeners
  function setupEventListeners() {
    if (refreshPricesBtn) {
      refreshPricesBtn.addEventListener('click', () => {
        Portfolio.updateStockPrices();
      });
    }
    
    if (refreshPricesBtnSmall) {
      refreshPricesBtnSmall.addEventListener('click', () => {
        Portfolio.updateStockPrices();
      });
    }
  }
  
  /**
   * Get current stock price
   * @param {string} symbol - The stock symbol
   * @returns {Promise} Price data
   */
  async function getCurrentPrice(symbol) {
    // Check cache first
    const cacheKey = `price_${symbol}`;
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp) < CACHE_DURATION) {
      return cache[cacheKey].data;
    }
    
    try {
      const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Handle API errors
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
        throw new Error('Invalid API response');
      }
      
      const result = {
        symbol,
        price: parseFloat(data['Global Quote']['05. price']),
        change: parseFloat(data['Global Quote']['09. change']),
        changePercent: parseFloat(data['Global Quote']['10. change percent'].replace('%', '')),
        high: parseFloat(data['Global Quote']['03. high']),
        low: parseFloat(data['Global Quote']['04. low']),
        volume: parseInt(data['Global Quote']['06. volume']),
        latestTradingDay: data['Global Quote']['07. latest trading day']
      };
      
      // Store in cache
      cache[cacheKey] = {
        data: result,
        timestamp: Date.now()
      };
      
      return result;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }
  
  /**
   * Get 52 week high/low for a stock
   * @param {string} symbol - The stock symbol
   * @returns {Promise} 52 week data
   */
  async function get52WeekRange(symbol) {
    // Check cache first
    const cacheKey = `range_${symbol}`;
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp) < CACHE_DURATION) {
      return cache[cacheKey].data;
    }
    
    try {
      // We'll use the weekly time series to calculate 52 week high/low
      const url = `${BASE_URL}?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      const weeklyData = data['Weekly Time Series'];
      if (!weeklyData) {
        throw new Error('Invalid API response');
      }
      
      // Get dates sorted in descending order
      const dates = Object.keys(weeklyData).sort((a, b) => new Date(b) - new Date(a));
      
      // Take only data from the last 52 weeks
      const lastYearDates = dates.filter(date => {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return new Date(date) >= yearAgo;
      });
      
      // Find high and low in the last 52 weeks
      let high52Week = -Infinity;
      let low52Week = Infinity;
      
      lastYearDates.forEach(date => {
        const high = parseFloat(weeklyData[date]['2. high']);
        const low = parseFloat(weeklyData[date]['3. low']);
        
        high52Week = Math.max(high52Week, high);
        low52Week = Math.min(low52Week, low);
      });
      
      const result = {
        symbol,
        high52Week,
        low52Week
      };
      
      // Store in cache
      cache[cacheKey] = {
        data: result,
        timestamp: Date.now()
      };
      
      return result;
    } catch (error) {
      console.error(`Error fetching 52 week range for ${symbol}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for stocks by keywords
   * @param {string} keywords - Search terms
   * @returns {Promise} Search results
   */
  async function searchSymbols(keywords) {
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (!data.bestMatches) {
        return [];
      }
      
      return data.bestMatches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency']
      }));
    } catch (error) {
      console.error('Error searching symbols:', error);
      throw error;
    }
  }
  
  /**
   * Update price data for a list of stocks
   * @param {Array} stocks - List of stock objects with symbol property
   * @returns {Promise} Updated stocks with current prices
   */
  async function updatePrices(stocks) {
    const updates = [];
    
    // Process stocks in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < stocks.length; i += batchSize) {
      const batch = stocks.slice(i, i + batchSize);
      const batchPromises = batch.map(async stock => {
        try {
          const priceData = await getCurrentPrice(stock.ticker);
          return {
            id: stock.id,
            currentPrice: priceData.price
          };
        } catch (error) {
          console.error(`Error updating price for ${stock.ticker}:`, error);
          return null;
        }
      });
      
      // Wait for all promises in this batch to resolve
      const batchResults = await Promise.all(batchPromises);
      updates.push(...batchResults.filter(Boolean));
      
      // Add a small delay between batches to avoid hitting rate limits
      if (i + batchSize < stocks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Update last updated time
    updateLastUpdatedTime();
    
    return updates;
  }
  
  /**
   * Update the last updated time display
   */
  function updateLastUpdatedTime() {
    if (!lastUpdatedTime) return;
    
    const lastUpdate = localStorage.getItem('lastPriceUpdate');
    if (lastUpdate) {
      const date = new Date(parseInt(lastUpdate));
      lastUpdatedTime.textContent = `Last updated: ${date.toLocaleString()}`;
    } else {
      lastUpdatedTime.textContent = 'Last updated: Never';
    }
  }
  
  /**
   * Record price update time
   */
  function recordUpdateTime() {
    localStorage.setItem('lastPriceUpdate', Date.now().toString());
    updateLastUpdatedTime();
  }
  
  // Public API
  return {
    init,
    getCurrentPrice,
    get52WeekRange,
    searchSymbols,
    updatePrices,
    updateLastUpdatedTime,
    recordUpdateTime
  };
})();

// Initialize MarketData when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  MarketData.init();
});
