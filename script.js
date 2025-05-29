// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  });
});

// Form submission handler
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  alert("Thank you for your message!");
  this.reset();
});

// Stock API Configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual key
let chartInstance = null;

async function getStockData() {
  const symbol = document.getElementById('stockSymbol').value.toUpperCase().trim();
  const resultBox = document.getElementById('stockResult');
  const chartCanvas = document.getElementById('stockChart');

  if (!symbol) {
    alert('Please enter a stock symbol.');
    return;
  }

  resultBox.innerHTML = 'Loading...';

  try {
    // Get Current Price
    const quoteRes = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol= ${symbol}&apikey=${API_KEY}`);
    const quoteData = await quoteRes.json();

    if (!quoteData['Global Quote']) {
      resultBox.innerHTML = 'Stock not found.';
      return;
    }

    const price = quoteData['Global Quote']['05. price'];
    const change = quoteData['Global Quote']['09. change percent'];
    resultBox.innerHTML = `<strong>${symbol}</strong>: $${price} (${change})`;

    // Get Time Series (Daily)
    const historyRes = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol= ${symbol}&apikey=${API_KEY}`);
    const historyData = await historyRes.json();
    const timeSeries = historyData['Time Series (Daily)'];

    if (!timeSeries) {
      alert('Could not retrieve historical data.');
      return;
    }

    const dates = Object.keys(timeSeries).slice(0, 30).reverse(); // last 30 days
    const prices = dates.map(date => parseFloat(timeSeries[date]['1. open']));

    // Draw Chart
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Opening Price ($)',
          data: prices,
          borderColor: '#0d6efd',
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Date' }
          },
          y: {
            title: { display: true, text: 'Price (USD)' }
          }
        }
      }
    });

  } catch (err) {
    console.error(err);
    resultBox.innerHTML = 'Error fetching data.';
  }
}
