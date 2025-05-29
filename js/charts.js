/**
 * Charts Module for Stock Portfolio Dashboard
 * Implements Chart.js visualizations for portfolio analysis
 */

const Charts = (function() {
    // Private variables
    let allocationChart = null;
    let gainersLosersChart = null;
    let weekRangeChart = null;
    let recoveryChart = null;
    let realizedUnrealizedChart = null;
    let sectorPerformanceChart = null;

    // Chart color schemes - using CSS variables defined in styles.css
    const chartColors = {
        primary: '#4285f4', // --chart-color1
        success: '#34a853', // --chart-color2
        warning: '#fbbc04', // --chart-color3
        danger: '#ea4335',  // --chart-color4
        info: '#46bdc6',    // --chart-color5
        purple: '#7986cb',  // --chart-color6
        background: '#ffffff',
        border: '#dadce0'
    };

    // Additional chart colors for multiple items (sectors, etc.)
    const extendedColors = [
        '#4285f4', '#34a853', '#fbbc04', '#ea4335', 
        '#46bdc6', '#7986cb', '#9c27b0', '#3f51b5',
        '#2196f3', '#009688', '#8bc34a', '#cddc39'
    ];

    // Default chart options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(32, 33, 36, 0.8)',
                padding: 10,
                cornerRadius: 4,
                titleFont: {
                    size: 12
                },
                bodyFont: {
                    size: 12
                }
            }
        }
    };

    /**
     * Initialize all charts
     */
    function init() {
        // Set Chart.js defaults
        Chart.defaults.font.family = 'Roboto, "Segoe UI", Arial, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#5f6368';
        
        // Initialize charts with empty data
        createAllocationChart([]);
        createGainersLosersChart([]);
        createWeekRangeChart([]);
        createRecoveryChart([]);
        createRealizedUnrealizedChart({
            realizedGain: 0, 
            realizedLoss: 0, 
            unrealizedGain: 0, 
            unrealizedLoss: 0
        });
        createSectorPerformanceChart([]);
        
        // Set up event handlers for chart toggle buttons
        document.querySelectorAll('.chart-toggle').forEach(btn => {
            btn.addEventListener('click', function() {
                const chart = this.getAttribute('data-chart');
                const view = this.getAttribute('data-view');
                
                // Update button styles
                document.querySelectorAll(`[data-chart="${chart}"]`).forEach(b => {
                    b.classList.replace('btn-secondary', 'btn-outline');
                    b.classList.replace('btn-primary', 'btn-outline');
                });
                
                this.classList.replace('btn-outline', 'btn-secondary');
                
                // Update chart view
                if (chart === 'allocation') {
                    updateAllocationView(view);
                } else if (chart === 'gainerslosers') {
                    updateGainersLosersView(view);
                }
            });
        });
    }

    /**
     * Create or update the portfolio allocation chart
     * @param {Array} data - The allocation data
     */
    function createAllocationChart(data) {
        const ctx = document.getElementById('allocationChart');
        const noDataMessage = document.getElementById('allocationNoData');
        
        // Check if data exists
        if (!data || data.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'flex';
            if (allocationChart) allocationChart.destroy();
            allocationChart = null;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        // Prepare data
        const labels = data.map(item => item.sector || item.name);
        const values = data.map(item => item.value);
        
        // Set colors for each slice
        const backgroundColors = data.map((_, index) => extendedColors[index % extendedColors.length]);
        
        const config = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: chartColors.background,
                    borderWidth: 1
                }]
            },
            options: {
                ...defaultOptions,
                cutout: '65%',
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                
                                return `${label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
        
        // Create or update chart
        if (allocationChart) {
            allocationChart.data.labels = config.data.labels;
            allocationChart.data.datasets[0].data = config.data.datasets[0].data;
            allocationChart.data.datasets[0].backgroundColor = config.data.datasets[0].backgroundColor;
            allocationChart.update();
        } else {
            allocationChart = new Chart(ctx, config);
        }
    }

    /**
     * Create or update the top gainers and losers chart
     * @param {Array} stocks - The stock data
     */
    function createGainersLosersChart(stocks) {
        const ctx = document.getElementById('gainersLosersChart');
        const noDataMessage = document.getElementById('gainersLosersNoData');
        
        // Check if data exists
        if (!stocks || stocks.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'flex';
            if (gainersLosersChart) gainersLosersChart.destroy();
            gainersLosersChart = null;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        // Calculate performance for each stock
        const stocksWithPerformance = stocks.map(stock => ({
            ...stock,
            performancePercent: ((stock.currentPrice - stock.avgCost) / stock.avgCost) * 100,
            performanceValue: (stock.currentPrice - stock.avgCost) * stock.units
        }));
        
        // Sort by percentage gain/loss
        stocksWithPerformance.sort((a, b) => b.performancePercent - a.performancePercent);
        
        // Take top 5 gainers and top 5 losers
        const gainers = stocksWithPerformance
            .filter(stock => stock.performancePercent > 0)
            .slice(0, 5);
            
        const losers = stocksWithPerformance
            .filter(stock => stock.performancePercent < 0)
            .sort((a, b) => a.performancePercent - b.performancePercent)
            .slice(0, 5);
        
        // Combine data for chart
        const labels = [
            ...losers.map(stock => stock.ticker),
            ...gainers.map(stock => stock.ticker)
        ];
        
        const data = [
            ...losers.map(stock => stock.performancePercent),
            ...gainers.map(stock => stock.performancePercent)
        ];
        
        const backgroundColors = data.map(value => 
            value >= 0 ? chartColors.success : chartColors.danger
        );
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance (%)',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                ...defaultOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `Performance: ${Utils.formatPercentage(value)}`;
                            }
                        }
                    }
                }
            }
        };
        
        // Create or update chart
        if (gainersLosersChart) {
            gainersLosersChart.data = config.data;
            gainersLosersChart.update();
        } else {
            gainersLosersChart = new Chart(ctx, config);
        }
    }

    /**
     * Create or update the 52-week range position chart
     * @param {Array} stocks - The stock data
     */
    function createWeekRangeChart(stocks) {
        const ctx = document.getElementById('weekRangeChart');
        const noDataMessage = document.getElementById('weekRangeNoData');
        
        // Check if data exists
        if (!stocks || stocks.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'flex';
            if (weekRangeChart) weekRangeChart.destroy();
            weekRangeChart = null;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        // Calculate position in 52-week range for each stock
        const stocksWithPosition = stocks
            .filter(stock => stock.low52Week && stock.high52Week)
            .map(stock => ({
                ...stock,
                position: Utils.calculateRangePosition(
                    stock.currentPrice, 
                    stock.low52Week, 
                    stock.high52Week
                )
            }))
            .sort((a, b) => b.position - a.position);
        
        // Prepare data for chart
        const labels = stocksWithPosition.map(stock => stock.ticker);
        const data = stocksWithPosition.map(stock => stock.position);
        const colors = data.map(position => {
            if (position >= 75) return chartColors.success;
            if (position >= 50) return chartColors.warning;
            if (position >= 25) return chartColors.primary;
            return chartColors.danger;
        });
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Position in 52-Week Range',
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1,
                    borderRadius: 4,
                    barThickness: 30
                }]
            },
            options: {
                ...defaultOptions,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: 'rgba(218, 220, 224, 0.3)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                const stock = stocksWithPosition[index];
                                return `${stock.name} (${stock.ticker})`;
                            },
                            label: function(context) {
                                const index = context.dataIndex;
                                const stock = stocksWithPosition[index];
                                return [
                                    `Current: ${Utils.formatCurrency(stock.currentPrice)}`,
                                    `52W Low: ${Utils.formatCurrency(stock.low52Week)}`,
                                    `52W High: ${Utils.formatCurrency(stock.high52Week)}`,
                                    `Position: ${stock.position.toFixed(1)}%`
                                ];
                            }
                        }
                    }
                }
            }
        };
        
        // Create or update chart
        if (weekRangeChart) {
            weekRangeChart.data = config.data;
            weekRangeChart.update();
        } else {
            weekRangeChart = new Chart(ctx, config);
        }
    }

    /**
     * Create or update the recovery potential chart
     * @param {Array} recoveryData - The recovery data for underwater stocks
     */
    function createRecoveryChart(recoveryData) {
        const ctx = document.getElementById('recoveryChart');
        const noDataMessage = document.getElementById('recoveryNoData');
        
        // Check if data exists
        if (!recoveryData || recoveryData.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'flex';
            if (recoveryChart) recoveryChart.destroy();
            recoveryChart = null;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        // Sort by percent to breakeven (descending)
        recoveryData.sort((a, b) => b.percentToBreakeven - a.percentToBreakeven);
        
        // Prepare data for chart
        const labels = recoveryData.map(stock => stock.ticker);
        const percentDown = recoveryData.map(stock => stock.percentDown);
        const percentToBreakeven = recoveryData.map(stock => stock.percentToBreakeven);
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '% Down From Cost',
                        data: percentDown,
                        backgroundColor: chartColors.danger,
                        borderColor: chartColors.danger,
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: '% Needed to Breakeven',
                        data: percentToBreakeven,
                        backgroundColor: chartColors.warning,
                        borderColor: chartColors.warning,
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                ...defaultOptions,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(218, 220, 224, 0.3)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                const stock = recoveryData[index];
                                return `${stock.name} (${stock.ticker})`;
                            },
                            label: function(context) {
                                const index = context.dataIndex;
                                const stock = recoveryData[index];
                                const datasetLabel = context.dataset.label;
                                const value = context.raw;
                                return `${datasetLabel}: ${value.toFixed(2)}%`;
                            },
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const stock = recoveryData[index];
                                return [
                                    `Current: ${Utils.formatCurrency(stock.currentPrice)}`,
                                    `Cost Basis: ${Utils.formatCurrency(stock.avgCost)}`
                                ];
                            }
                        }
                    }
                }
            }
        };
        
        // Create or update chart
        if (recoveryChart) {
            recoveryChart.data = config.data;
            recoveryChart.update();
        } else {
            recoveryChart = new Chart(ctx, config);
        }
    }

    /**
     * Create or update the realized vs unrealized gain/loss chart
     * @param {Object} gainLossData - The gain/loss data
     */
    function createRealizedUnrealizedChart(gainLossData) {
        const ctx = document.getElementById('realizedUnrealizedChart');
        const noDataMessage = document.getElementById('realizedNoData');
        
        // Check if data exists
        if (!gainLossData || 
            (gainLossData.realizedGain === 0 && 
             gainLossData.realizedLoss === 0 && 
             gainLossData.unrealizedGain === 0 && 
             gainLossData.unrealizedLoss === 0)) {
            if (noDataMessage) noDataMessage.style.display = 'flex';
            if (realizedUnrealizedChart) realizedUnrealizedChart.destroy();
            realizedUnrealizedChart = null;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        // Prepare data for chart
        const data = {
            labels: ['Realized', 'Unrealized'],
            datasets: [
                {
                    label: 'Gains',
                    data: [gainLossData.realizedGain, gainLossData.unrealizedGain],
                    backgroundColor: chartColors.success,
                    borderWidth: 1,
                    borderColor: chartColors.background,
                    borderRadius: 4
                },
                {
                    label: 'Losses',
                    data: [gainLossData.realizedLoss, gainLossData.unrealizedLoss],
                    backgroundColor: chartColors.danger,
                    borderWidth: 1,
                    borderColor: chartColors.background,
                    borderRadius: 4
                }
            ]
        };
        
        const config = {
            type: 'bar',
            data: data,
            options: {
                ...defaultOptions,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(218, 220, 224, 0.3)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                return `${label}: ${Utils.formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        };
        
        // Create or update chart
        if (realizedUnrealizedChart) {
            realizedUnrealizedChart.data = config.data;
            realizedUnrealizedChart.update();
        } else {
            realizedUnrealizedChart = new Chart(ctx, config);
        }
    }

    /**
     * Create or update the performance by sector chart
     * @param {Array} sectors - The sector performance data
     */
    function createSectorPerformanceChart(sectors) {
        const ctx = document.getElementById('sectorPerformanceChart');
        const noDataMessage = document.getElementById('sectorNoData');
        
        // Check if data exists
        if (!sectors || sectors.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'flex';
            if (sectorPerformanceChart) sectorPerformanceChart.destroy();
            sectorPerformanceChart = null;
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        // Set up datasets
        const labels = sectors.map(sector => sector.name);
        const returns = sectors.map(sector => sector.returnPercent);
        const allocations = sectors.map(sector => sector.allocation);
        
        const backgroundColors = returns.map(value => 
            value >= 0 ? chartColors.success : chartColors.danger
        );
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Return (%)',
                        data: returns,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors,
                        borderWidth: 1,
                        borderRadius: 4,
                        order: 1
                    },
                    {
                        label: 'Allocation (%)',
                        data: allocations,
                        type: 'line',
                        borderColor: chartColors.primary,
                        backgroundColor: 'rgba(66, 133, 244, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: chartColors.primary,
                        fill: true,
                        order: 0,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...defaultOptions,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Return (%)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    y1: {
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Allocation (%)'
                        },
                        min: 0,
                        max: Math.max(...allocations) * 1.2,
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                return `${label}: ${value.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        };
        
        // Create or update chart
        if (sectorPerformanceChart) {
            sectorPerformanceChart.data = config.data;
            sectorPerformanceChart.update();
        } else {
            sectorPerformanceChart = new Chart(ctx, config);
        }
    }

    /**
     * Update allocation chart view (value or percentage)
     * @param {string} viewMode - The view mode ('value' or 'percentage')
     */
    function updateAllocationView(viewMode) {
        // This would update the allocation chart based on the selected view mode
        // For implementation in a real project, this would modify the chart data
        document.dispatchEvent(new CustomEvent('allocation-view-changed', {
            detail: { viewMode }
        }));
    }

    /**
     * Update gainers/losers chart view (percentage or value)
     * @param {string} viewMode - The view mode ('percentage' or 'value')
     */
    function updateGainersLosersView(viewMode) {
        // This would update the gainers/losers chart based on the selected view mode
        // For implementation in a real project, this would modify the chart data
        document.dispatchEvent(new CustomEvent('gainers-view-changed', {
            detail: { viewMode }
        }));
    }

    /**
     * Update all charts with new portfolio data
     * @param {Object} portfolioData - The portfolio data
     */
    function updateAllCharts(portfolioData) {
        if (!portfolioData) return;
        
        // Update each chart with the appropriate data
        if (portfolioData.sectorAllocation) {
            createAllocationChart(portfolioData.sectorAllocation);
        }
        
        if (portfolioData.stocks) {
            createGainersLosersChart(portfolioData.stocks);
            createWeekRangeChart(portfolioData.stocks);
        }
        
        if (portfolioData.recoveryData) {
            createRecoveryChart(portfolioData.recoveryData);
        }
        
        if (portfolioData.gainLossMetrics) {
            createRealizedUnrealizedChart(portfolioData.gainLossMetrics);
        }
        
        if (portfolioData.sectorPerformance) {
            createSectorPerformanceChart(portfolioData.sectorPerformance);
        }
    }

    // Public API
    return {
        init,
        createAllocationChart,
        createGainersLosersChart,
        createWeekRangeChart,
        createRecoveryChart,
        createRealizedUnrealizedChart,
        createSectorPerformanceChart,
        updateAllCharts
    };
})();
Usage Instructions
This module implements Chart.js visualizations for a stock portfolio dashboard. It creates and manages six types of charts to help visualize portfolio data.

Requirements
Chart.js library: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
Utils.js for formatting functions (formatCurrency, formatPercentage, etc.)
HTML Structure
Your HTML should include canvas elements for each chart with corresponding message displays for empty states:

<div class="chart-container">
    <canvas id="allocationChart"></canvas>
    <div id="allocationNoData" class="no-data-message">
        <p>No portfolio data available</p>
    </div>
</div>

<!-- Similar structure for other charts -->
