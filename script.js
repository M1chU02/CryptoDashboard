const loadingIndicator = document.createElement("div");
loadingIndicator.id = "loading";
loadingIndicator.textContent = "Loading...";
loadingIndicator.style.display = "none";
document.querySelector(".container").appendChild(loadingIndicator);

const API_KEY = "NY44DVQANYUW5A4M";
const API_URL = "https://www.alphavantage.co/query";
const form = document.getElementById("crypto-form");
const cryptoList = document.getElementById("crypto-list");
const ctx = document.getElementById("crypto-chart").getContext("2d");

// Chart instance
let chart;

// Add cryptocurrency
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const symbol = document.getElementById("crypto-symbol").value.toUpperCase();
  if (symbol) {
    loadingIndicator.style.display = "block";
    try {
      const data = await fetchCryptoData(symbol);
      if (data) {
        addCryptoToList(symbol, data);
        updateChart(symbol, data);
      } else {
        alert("Invalid cryptocurrency symbol or API limit reached.");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      loadingIndicator.style.display = "none";
    }
  }
});

// Fetch cryptocurrency data
async function fetchCryptoData(symbol) {
  try {
    const response = await fetch(
      `${API_URL}?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&apikey=${API_KEY}`
    );
    const data = await response.json();
    if (data["Time Series (Digital Currency Daily)"]) {
      return data["Time Series (Digital Currency Daily)"];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return null;
}

// Add crypto to the list
function addCryptoToList(symbol, data) {
  const cryptoItem = document.createElement("div");
  cryptoItem.className = "crypto-item";
  const price = parseFloat(getLatestClose(data)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  cryptoItem.textContent = `${symbol} - Latest Close: ${price}`;
  cryptoList.appendChild(cryptoItem);
}

// Get latest close price
function getLatestClose(data) {
  const latestDate = Object.keys(data)[0];
  return data[latestDate]["4a. close (USD)"];
}

// Update the chart
function updateChart(symbol, data) {
  const dates = Object.keys(data).slice(0, 30).reverse();
  const prices = dates.map((date) => parseFloat(data[date]["4a. close (USD)"]));

  // Generate a random color for each new cryptocurrency
  const randomColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)}, 1)`;

  if (!chart) {
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates.map((date) => new Date(date).toLocaleDateString()),
        datasets: [
          {
            label: symbol,
            data: prices,
            borderColor: randomColor,
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${
                  context.dataset.label
                }: $${context.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Price (USD)",
            },
            ticks: {
              callback: (value) => `$${value.toLocaleString()}`,
            },
          },
        },
      },
    });
  } else {
    // Add new dataset instead of replacing
    chart.data.datasets.push({
      label: symbol,
      data: prices,
      borderColor: randomColor,
      borderWidth: 2,
      fill: false,
      tension: 0.1,
    });
    chart.update();
  }
}
