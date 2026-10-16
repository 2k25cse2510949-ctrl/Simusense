let chartInstance = null;

// UI Elements
const scenarioSelect = document.getElementById("scenarioSelect");
const dynamicInputs = document.getElementById("dynamicInputs");
const runBtn = document.getElementById("runBtn");
const ageSlider = document.getElementById("age");
const ageVal = document.getElementById("ageVal");

// Sync slider number label
ageSlider.addEventListener("input", (e) => {
  ageVal.textContent = e.target.value;
});

// Render dynamic fields when scenario changes
scenarioSelect.addEventListener("change", renderDynamicInputs);

function renderDynamicInputs() {
  const scenario = scenarioSelect.value;
  dynamicInputs.innerHTML = "";

  if (scenario === "death") {
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Term Life Insurance Cover (₹)</label>
        <input type="number" id="insurance" value="2500000" step="500000">
      </div>
      <div class="form-group">
        <label>Immediate Outstanding Debts / Loans (₹)</label>
        <input type="number" id="debt" value="800000" step="100000">
      </div>
      <div class="form-group">
        <label>Age of Youngest Dependent</label>
        <input type="number" id="dependentAge" value="4" min="0" max="25">
      </div>
    `;
  } else if (scenario === "rich") {
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Income Multiplier</label>
        <select id="multiplier">
          <option value="2">2x (Double salary)</option>
          <option value="3" selected>3x (Triple salary)</option>
          <option value="5">5x (High-net-worth jump)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Lifestyle Inflation / Creep Rate</label>
        <select id="creep">
          <option value="0.2">Frugal (Saves 80% of raise)</option>
          <option value="0.5" selected>Moderate (Spends 50% of raise on luxuries)</option>
          <option value="0.85">Heavy Creep (Spends 85% on luxury EMIs & status)</option>
        </select>
      </div>
    `;
  } else if (scenario === "startup") {
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Years Without Income (Sabbatical / Runway)</label>
        <input type="number" id="burnYears" value="2" min="1" max="5">
      </div>
      <div class="form-group">
        <label>Target Post-Transition Monthly Income (₹)</label>
        <input type="number" id="targetIncome" value="150000" step="25000">
      </div>
    `;
  }
}

// Client-side deterministic simulation engine
function runSimulation() {
  const currentAge = parseInt(ageSlider.value);
  let initialSavings = parseFloat(document.getElementById("net_worth").value) || 0;
  const monthlyIncome = parseFloat(document.getElementById("monthly_income").value) || 0;
  let annualIncome = monthlyIncome * 12;
  const monthlyExpense = parseFloat(document.getElementById("monthly_expense").value) || 0;
  let annualExpense = monthlyExpense * 12;

  const scenario = scenarioSelect.value;
  const years = 15;
  const inflation = 0.06;      // 6% inflation
  const investmentYield = 0.08; // 8% expected portfolio return

  let baselineTraj = [];
  let whatifTraj = [];
  let insights = [];

  // 1. Run Baseline Trajectory (Status Quo)
  let baseNW = initialSavings;
  let baseExp = annualExpense;
  for (let yr = 1; yr <= years; yr++) {
    let savings = annualIncome - baseExp;
    baseNW = (baseNW + savings) * (1 + investmentYield);
    baselineTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(baseNW) });
    baseExp *= (1 + inflation);
  }

  // 2. Run What-If Trajectory
  let whatifNW = initialSavings;
  let whatifExp = annualExpense;
  let depletedYear = null;

  if (scenario === "death") {
    const insurance = parseFloat(document.getElementById("insurance")?.value || 0);
    const debt = parseFloat(document.getElementById("debt")?.value || 0);
    const depAge = parseInt(document.getElementById("dependentAge")?.value || 0);

    // Initial shock: earner passes away, income drops to zero, debt cleared from insurance
    whatifNW = (initialSavings + insurance) - debt;

    for (let yr = 1; yr <= years; yr++) {
      if (whatifNW > 0) {
        whatifNW = (whatifNW - whatifExp) * (1 + investmentYield);
        if (whatifNW < 0) {
          whatifNW = 0;
          if (!depletedYear) depletedYear = yr;
        }
      } else {
        whatifNW = 0;
        if (!depletedYear) depletedYear = yr;
      }

      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW) });
      whatifExp *= (1 + inflation);
    }

    const childIndependenceYear = Math.max(0, 22 - depAge);
    if (depletedYear && depletedYear < childIndependenceYear) {
      insights.push(`🚨 DEFICIT ALERT: Family funds deplete in Year ${depletedYear}. Your youngest child will be only ${depAge + depletedYear} years old (Target: age 22).`);
      insights.push(`Recommended Insurance Gap: Increase term cover by at least ₹${Math.round((childIndependenceYear - depletedYear) * annualExpense * 1.5).toLocaleString('en-IN')}.`);
    } else {
      insights.push(`✅ Solvency Maintained: Your current insurance + liquid assets successfully protect the family past the dependent's independence age.`);
    }

  } else if (scenario === "rich") {
    const multiplier = parseFloat(document.getElementById("multiplier").value);
    const creep = parseFloat(document.getElementById("creep").value);

    const boostedIncome = annualIncome * multiplier;
    const extraSpend = (boostedIncome - annualIncome) * creep;
    whatifExp += extraSpend;

    for (let yr = 1; yr <= years; yr++) {
      let savings = boostedIncome - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW) });
      whatifExp *= (1 + inflation);
    }

    const extraWealth = whatifTraj[years - 1].netWorth - baselineTraj[years - 1].netWorth;
    insights.push(`📈 Wealth Projection: Your 15-year net worth increases by ₹${extraWealth.toLocaleString('en-IN')}.`);
    if (creep >= 0.8) {
      insights.push(`⚠️ Lifestyle Creep Trap: Spending 85% of your raise balloons your fixed costs, making you more vulnerable to sudden income drops despite higher earnings.`);
    }

  } else if (scenario === "startup") {
    const burnYears = parseInt(document.getElementById("burnYears").value);
    const targetIncome = parseFloat(document.getElementById("targetIncome").value) * 12;

    for (let yr = 1; yr <= years; yr++) {
      let income = yr <= burnYears ? 0 : targetIncome;
      let savings = income - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      if (whatifNW < 0) {
        whatifNW = 0;
        if (!depletedYear) depletedYear = yr;
      }
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW) });
      whatifExp *= (1 + inflation);
    }

    if (depletedYear) {
      insights.push(`🚨 Sabbatical Failure: Your savings run out in Year ${depletedYear} before the business/pivot reaches profitability.`);
    } else {
      insights.push(`✅ Sustainable Runway: You have sufficient cash buffer to survive the ${burnYears}-year zero-income period.`);
    }
  }

  // Update Summary Metrics
  updateUI(baselineTraj, whatifTraj, depletedYear, insights);
}

function updateUI(baselineTraj, whatifTraj, depletedYear, insights) {
  // Update status pill
  const statusBadge = document.getElementById("statusBadge");
  if (depletedYear) {
    statusBadge.className = "status-pill status-danger";
    statusBadge.textContent = "High Risk";
    document.getElementById("runwayMetric").textContent = `Year ${depletedYear}`;
    document.getElementById("solvencyMetric").textContent = "Breached";
  } else {
    statusBadge.className = "status-pill status-safe";
    statusBadge.textContent = "Stable";
    document.getElementById("runwayMetric").textContent = "15+ Years";
    document.getElementById("solvencyMetric").textContent = "Secure";
  }

  // Delta calculation
  const delta = whatifTraj[whatifTraj.length - 1].netWorth - baselineTraj[baselineTraj.length - 1].netWorth;
  const sign = delta >= 0 ? "+" : "";
  document.getElementById("deltaMetric").textContent = `${sign}₹${Math.round(delta).toLocaleString('en-IN')}`;

  // Insights List
  const insightsList = document.getElementById("insightsList");
  insightsList.innerHTML = insights.map(i => `<li>${i}</li>`).join("");

  // Draw or Update Chart.js
  renderChart(baselineTraj, whatifTraj);
}

function renderChart(baselineTraj, whatifTraj) {
  const labels = baselineTraj.map(d => `Age ${d.age} (Yr ${d.year})`);
  const baseData = baselineTraj.map(d => d.netWorth);
  const whatifData = whatifTraj.map(d => d.netWorth);

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById("trajectoryChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Baseline Path (Status Quo)",
          data: baseData,
          borderColor: "#94a3b8",
          borderDash: [5, 5],
          pointRadius: 2,
          fill: false,
          tension: 0.2
        },
        {
          label: "What-If Scenario Path",
          data: whatifData,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          pointRadius: 3,
          fill: true,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: "#2b3954" },
          ticks: { color: "#94a3b8" }
        },
        y: {
          grid: { color: "#2b3954" },
          ticks: {
            color: "#94a3b8",
            callback: (val) => "₹" + (val / 100000).toFixed(1) + "L"
          }
        }
      },
      plugins: {
        legend: { labels: { color: "#f1f5f9" } }
      }
    }
  });
}

// Initial setup on page load
renderDynamicInputs();
runSimulation();
runBtn.addEventListener("click", runSimulation);
