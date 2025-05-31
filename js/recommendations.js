/**
 * AI-powered recommendation engine using Deepseek LLM
 * For the stock portfolio dashboard
 */

const RecommendationEngine = (function() {
  // For demo/development, we'll use a simulated API response
  // In production, replace with actual DeepSeek LLM API call
  
  let lastRecommendations = null;
  
  /**
   * Initialize recommendation engine
   */
  function init() {
    // Setup initial state if needed
    console.log('Recommendation engine initialized');
  }
  
  /**
   * Generate portfolio recommendations based on portfolio data
   */
  async function generateRecommendations(portfolioData) {
    try {
      // Show loading indicator
      document.getElementById('recommendationsContainer').innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Analyzing your portfolio and generating recommendations...</p>
        </div>
      `;
      
      // In a real implementation, this would be an API call to DeepSeek LLM
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate simulated recommendations
      const recommendations = simulateAIRecommendations(portfolioData);
      
      // Store for later use
      lastRecommendations = recommendations;
      
      // Display recommendations
      displayRecommendations(recommendations);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Show error message
      document.getElementById('recommendationsContainer').innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Unable to generate recommendations. Please try again later.</p>
        </div>
      `;
      
      // Fall back to rule-based recommendations
      return generateRuleBasedRecommendations(portfolioData);
    }
  }
  
  /**
   * Simulate AI-generated recommendations
   * This would be replaced by actual DeepSeek LLM API call in production
   */
  function simulateAIRecommendations(portfolioData) {
    // Analyze sector allocation
    const sectors = {};
    let totalValue = 0;
    
    portfolioData.stocks.forEach(stock => {
      const marketValue = stock.units * stock.currentPrice;
      totalValue += marketValue;
      
      if (!sectors[stock.sector]) {
        sectors[stock.sector] = 0;
      }
      sectors[stock.sector] += marketValue;
    });
    
    // Calculate sector percentages
    const sectorPercentages = {};
    Object.keys(sectors).forEach(sector => {
      sectorPercentages[sector] = (sectors[sector] / totalValue) * 100;
    });
    
    // Generate diversification recommendation
    let diversification = '';
    const highConcentrationSectors = Object.keys(sectorPercentages)
      .filter(sector => sectorPercentages[sector] > 25);
      
    if (highConcentrationSectors.length > 0) {
      diversification = `Your portfolio shows high concentration in the ${highConcentrationSectors.join(', ')} sector${highConcentrationSectors.length > 1 ? 's' : ''}, representing ${highConcentrationSectors.map(s => Math.round(sectorPercentages[s])).join('%, ')}% of your portfolio. Consider diversifying into other sectors like ${getMissingSectors(sectorPercentages).join(', ')} to reduce risk.`;
    } else {
      diversification = `Your portfolio demonstrates good diversification across sectors, with no single sector exceeding 25%. This balanced approach helps mitigate sector-specific risks. Continue monitoring to maintain this healthy distribution.`;
    }
    
    // Generate risk assessment
    const volatileStocks = portfolioData.stocks.filter(stock => {
      return stock.high52Week / stock.low52Week > 2; // 2x range is considered volatile
    });
    
    let risk = '';
    if (volatileStocks.length > portfolioData.stocks.length * 0.3) {
      risk = `Your portfolio contains ${volatileStocks.length} volatile stocks (${Math.round(volatileStocks.length/portfolioData.stocks.length*100)}% of holdings) including ${volatileStocks.slice(0,3).map(s => s.ticker).join(', ')}${volatileStocks.length > 3 ? ', and others' : ''}. These stocks have shown significant price swings over the past year. Consider balancing with more stable investments to reduce overall portfolio volatility.`;
    } else {
      risk = `Your portfolio's overall volatility appears balanced, with most holdings showing moderate price stability. This suggests a reasonable risk profile. Consider setting up stop-loss orders for any particularly volatile positions to protect against sudden market downturns.`;
    }
    
    // Generate rebalancing suggestions
    const gainers = portfolioData.stocks.filter(stock => stock.currentPrice > stock.avgCost * 1.2);
    const losers = portfolioData.stocks.filter(stock => stock.currentPrice < stock.avgCost * 0.8);
    
    let rebalancing = '';
    if (gainers.length > 0) {
      rebalancing = `Consider taking partial profits on ${gainers.map(s => s.ticker).join(', ')}, which have gained over 20% from your purchase price. Rebalancing these positions would lock in gains and reduce exposure to potential corrections.`;
      
      if (losers.length > 0) {
        rebalancing += ` You might consider reallocating some of these gains to average down on underperforming positions like ${losers.map(s => s.ticker).join(', ')}, if you still believe in their long-term potential.`;
      }
    } else if (losers.length > 0) {
      rebalancing = `Several positions including ${losers.map(s => s.ticker).join(', ')} are down over 20% from your purchase price. Consider reevaluating these holdings based on their current fundamentals to determine whether averaging down or cutting losses would be more appropriate.`;
    } else {
      rebalancing = `Your portfolio appears well-balanced with most positions within 20% of their purchase prices. Continue monitoring position sizes to ensure they align with your investment goals and risk tolerance.`;
    }
    
    // Generate tax loss harvesting suggestions
    let taxLoss = '';
    if (losers.length > 0) {
      taxLoss = `Potential tax loss harvesting candidates include ${losers.map(s => s.ticker).join(', ')}, which are down more than 20%. Consider selling these positions to offset capital gains, potentially reducing your tax liability. Remember the wash-sale rule if you plan to rebuy within 30 days.`;
    } else {
      taxLoss = `No significant tax loss harvesting opportunities identified at this time. Most positions are either at a gain or minor loss, making tax-loss selling less beneficial. Continue monitoring for opportunities as market conditions change.`;
    }
    
    // Generate general advice
    const general = `Based on your portfolio composition, I recommend regular quarterly reviews to ensure alignment with your financial goals. Consider setting up price alerts for your holdings to stay informed about significant movements without constant monitoring. Additionally, maintaining a cash reserve of 5-10% would provide flexibility to capitalize on future opportunities.`;
    
    return {
      diversification,
      risk,
      rebalancing,
      taxLoss,
      general
    };
  }
  
  /**
   * Helper function to get missing/underrepresented sectors
   */
  function getMissingSectors(sectorPercentages) {
    const allSectors = [
      'Technology', 'Healthcare', 'Financials', 'Consumer Discretionary',
      'Communication Services', 'Industrials', 'Consumer Staples', 
      'Energy', 'Utilities', 'Real Estate', 'Materials'
    ];
    
    const existingSectors = Object.keys(sectorPercentages);
    const missingSectors = allSectors.filter(sector => !existingSectors.includes(sector));
    
    // Return a few missing sectors
    return missingSectors.slice(0, 3);
  }
  
  /**
   * Generate rule-based recommendations when AI is not available
   */
  function generateRuleBasedRecommendations(portfolioData) {
    // Similar to simulateAIRecommendations but with simpler logic
    // Implementation would be similar to above but with simpler analysis
    
    return {
      diversification: "Consider diversifying your portfolio across more sectors to reduce risk.",
      risk: "Your portfolio contains a mix of stable and volatile stocks. Consider your risk tolerance when adding new positions.",
      rebalancing: "Regular rebalancing helps maintain your target asset allocation. Consider reviewing quarterly.",
      taxLoss: "Look for opportunities to harvest tax losses near the end of the tax year.",
      general: "Dollar-cost averaging can help reduce the impact of market volatility on your portfolio."
    };
  }
  
  /**
   * Display recommendations in the UI
   */
  function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create sections
    const sections = [
      { title: 'Diversification Strategy', content: recommendations.diversification, icon: 'fa-sitemap' },
      { title: 'Risk Assessment', content: recommendations.risk, icon: 'fa-chart-line' },
      { title: 'Rebalancing Opportunities', content: recommendations.rebalancing, icon: 'fa-balance-scale' },
      { title: 'Tax Loss Harvesting', content: recommendations.taxLoss, icon: 'fa-receipt' },
      { title: 'General Advice', content: recommendations.general, icon: 'fa-lightbulb' }
    ];
    
    sections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'recommendation-section';
      
      sectionEl.innerHTML = `
        <div class="recommendation-header">
          <i class="fas ${section.icon}"></i>
          <h4>${section.title}</h4>
        </div>
        <div class="recommendation-content">
          <p>${section.content}</p>
        </div>
      `;
      
      container.appendChild(sectionEl);
    });
    
    // Add note about AI-powered recommendations
    const disclaimerEl = document.createElement('div');
    disclaimerEl.className = 'ai-disclaimer';
    disclaimerEl.innerHTML = `
      <p><i class="fas fa-robot"></i> These recommendations are generated by the Deepseek LLM and should be considered as suggestions only. Always do your own research before making investment decisions.</p>
    `;
    container.appendChild(disclaimerEl);
  }
  
  /**
   * Get recommendations (generate new or return last cached)
   */
  function getRecommendations(portfolioData, forceRefresh = false) {
    if (!lastRecommendations || forceRefresh) {
      return generateRecommendations(portfolioData);
    }
    return Promise.resolve(lastRecommendations);
  }
  
  // Public API
  return {
    init,
    generateRecommendations,
    getRecommendations,
    displayRecommendations
  };
})();
