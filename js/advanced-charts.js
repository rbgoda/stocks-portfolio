/**
 * Advanced charts functionality for Stock Portfolio Dashboard
 * Extends basic charts with interactive features, technical analysis, and more
 */

const AdvancedCharts = (function() {
  // Chart configuration
  const chartColors = [
    'rgba(66, 133, 244, 0.8)',
    'rgba(52, 168, 83, 0.8)',
    'rgba(251, 188, 4, 0.8)',
    'rgba(234, 67, 53, 0.8)',
    'rgba(70, 189, 198, 0.8)',
    'rgba(121, 134, 203, 0.8)',
    'rgba(159, 112, 255, 0.8)',
    'rgba(220, 57, 18, 0.8)',
    'rgba(16, 150, 24, 0.8)',
    'rgba(153, 0, 153, 0.8)'
  ];
  
  // Create correlation matrix visualization
  function createCorrelationMatrix(stocksData, containerId) {
    const ctx = document.getElementById(containerId).getContext('2d');
    const noDataEl = document.getElementById(`${containerId}NoData`);
    
    // Need at least 3 stocks for meaningful correlation
    if (!stocksData || stocksData.length < 3) {
      if (noDataEl) noDataEl.style.display = 'flex';
      return;
    }
    
    // Hide no data message
    if (noDataEl) noDataEl.style.display = 'none';
    
    // Extract tickers and create labels
    const tickers = stocksData.map(stock => stock.ticker);
    
    // Generate dummy correlation data (in a real app, would calculate from price history)
    const correlationData = [];
    for (let i = 0; i < tickers.length; i++) {
      for (let j = 0; j < tickers.length; j++) {
        // On diagonal: perfect correlation (1.0)
        // Off diagonal: some correlation between -1 and 1
        const correlation = i === j ? 1.0 : (Math.random() * 1.6) - 0.8;
        correlationData.push({
          x: tickers[i],
          y: tickers[j],
          v: correlation
        });
      }
    }
    
    // Create heatmap chart
    const chart = new Chart(ctx, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Correlation Matrix',
          data: correlationData,
          backgroundColor: function(context) {
            const value = context.dataset.data[context.dataIndex].v;
            // Color gradient based on correlation value
            if (value > 0.7) return 'rgba(52, 168, 83, 0.9)';
            if (value > 0.4) return 'rgba(52, 168, 83, 0.7)';
            if (value > 0.2) return 'rgba(52, 168, 83, 0.5)';
            if (value > -0.2) return 'rgba(200, 200, 200, 0.3)';
            if (value > -0.4) return 'rgba(234, 67, 53, 0.5)';
            if (value > -0.7) return 'rgba(234, 67, 53, 0.7)';
            return 'rgba(234, 67, 53, 0.9)';
          },
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function() {
                return 'Correlation';
              },
              label: function(context) {
                const item = context.dataset.data[context.dataIndex];
                return `${item.x} vs ${item.y}: ${item.v.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: tickers,
            ticks: {
              display: true
            },
            grid: {
              display: false
            }
          },
          y: {
            type: 'category',
            labels: tickers,
            offset: true,
            ticks: {
              display: true
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
    
    return chart;
  }
  
  // Create benchmark comparison chart
  function createBenchmarkComparison(portfolioPerformance, benchmarkPerformance, containerId) {
    const ctx = document.getElementById(containerId).getContext('2d');
    const noDataEl = document.getElementById(`${containerId}NoData`);
    
    if (!portfolioPerformance || !portfolioPerformance.dates || portfolioPerformance.dates.length === 0) {
      if (noDataEl) noDataEl.style.display = 'flex';
      return;
    }
    
    // Hide no data message
    if (noDataEl) noDataEl.style.display = 'none';
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: portfolioPerformance.dates,
        datasets: [
          {
            label: 'Your Portfolio',
            data: portfolioPerformance.values,
            borderColor: 'rgba(26, 115, 232, 1)',
            backgroundColor: 'rgba(26, 115, 232, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: benchmarkPerformance.name,
            data: benchmarkPerformance.values,
            borderColor: 'rgba(234, 67, 53, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            title: {
              display: true,
              text: 'Value (indexed to 100)'
            },
            ticks: {
              callback: function(value) {
                return value.toFixed(0);
              }
            }
          }
        }
      }
    });
    
    return chart;
  }
  
  // Create dividend history chart
  function createDividendHistoryChart(dividendData, containerId) {
    const ctx = document.getElementById(containerId).getContext('2d');
    
    if (!dividendData || dividendData.length === 0) {
      return;
    }
    
    // Group dividend data by month
    const monthlyData = {};
    dividendData.forEach(div => {
      const date = new Date(div.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      monthlyData[monthKey] += div.totalAmount;
    });
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort();
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedMonths.map(month => {
          const [year, monthNum] = month.split('-');
          return `${new Date(0, parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
        }),
        datasets: [
          {
            label: 'Dividend Income',
            data: sortedMonths.map(month => monthlyData[month]),
            backgroundColor: 'rgba(52, 168, 83, 0.7)',
            borderColor: 'rgba(52, 168, 83, 1)',
            borderWidth: 1
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
                return 'Income: ' + Utils.formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
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
  
  // Create technical analysis chart
  function createTechnicalChart(stockData, containerId) {
    const ctx = document.getElementById(containerId).getContext('2d');
    
    if (!stockData || !stockData.priceHistory || stockData.priceHistory.length === 0) {
      return;
    }
    
    // Sort price history by date
    stockData.priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract data
    const dates = stockData.priceHistory.map(item => new Date(item.date));
    const prices = stockData.priceHistory.map(item => item.close);
    
    // Calculate 50-day moving average
    const ma50 = calculateMovingAverage(prices, 50);
    
    // Calculate 200-day moving average
    const ma200 = calculateMovingAverage(prices, 200);
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: 'rgba(26, 115, 232, 1)',
            backgroundColor: 'rgba(26, 115, 232, 0.1)',
            borderWidth: 1.5,
            fill: true,
            pointRadius: 0,
            tension: 0.1
          },
          {
            label: '50-day MA',
            data: ma50,
            borderColor: 'rgba(52, 168, 83, 1)',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          },
          {
            label: '200-day MA',
            data: ma200,
            borderColor: 'rgba(234, 67, 53, 1)',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.label === 'Price') {
                  return context.dataset.label + ': ' + Utils.formatCurrency(context.raw);
                }
                return context.dataset.label + ': ' + Utils.formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month'
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price ($)'
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
  
  // Helper function to calculate moving average
  function calculateMovingAverage(data, window) {
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(null);  // Not enough data
      } else {
        let sum = 0;
        for (let j = 0; j < window; j++) {
          sum += data[i - j];
        }
        result.push(sum / window);
      }
    }
    
    return result;
  }
  
  // Public API
  return {
    createCorrelationMatrix,
    createBenchmarkComparison,
    createDividendHistoryChart,
    createTechnicalChart
  };
})();
