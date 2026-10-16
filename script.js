let chartInstance = null;

const scenarioSelect = document.getElementById("scenarioSelect");
const dynamicInputs = document.getElementById("dynamicInputs");
const runBtn = document.getElementById("runBtn");
const ageSlider = document.getElementById("age");
const ageVal = document.getElementById("ageVal");
const scenarioDescText = document.getElementById("scenarioDescText");
const scenarioSubTitle = document.getElementById("scenarioSubTitle");

ageSlider.addEventListener("input", (e) => {
  ageVal.textContent = e.target.value;
});

scenarioSelect.addEventListener("change", renderDynamicInputs);

function renderDynamicInputs() {
  const scenario = scenarioSelect.value;
  dynamicInputs.innerHTML = "";

  if (scenario === "death") {
    scenarioDescText.textContent = "Simulate financial survival of family if primary earner passes away today.";
    scenarioSubTitle.textContent = "Family Fund Depletion Curve vs. Child Independence";
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Term Insurance Payout (₹)</label>
        <input type="number" id="insurance" value="3000000" step="500000">
      </div>
      <div class="form-group">
        <label>Outstanding Debts / Loans (₹)</label>
        <input type="number" id="debt" value="800000" step="100000">
      </div>
      <div class="form-group">
        <label>Age of Youngest Child / Dependent</label>
        <input type="number" id="dependentAge" value="4" min="0" max="25">
      </div>
    `;
  } else if (scenario === "rich") {
    scenarioDescText.textContent = "Simulate the true impact of salary doubling/tripling with lifestyle inflation.";
    scenarioSubTitle.textContent = "Baseline vs. High Income with Lifestyle Creep";
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Income Jump Multiplier</label>
        <select id="multiplier">
          <option value="2">2x Salary Jump</option>
          <option value="3" selected>3x Salary Jump</option>
          <option value="5">5x High-Growth Jump</option>
        </select>
      </div>
      <div class="form-group">
        <label>Lifestyle Inflation (% of extra raise spent on luxuries)</label>
        <select id="creep">
          <option value="0.2">Frugal (Saves 80% of raise)</option>
          <option value="0.5" selected>Moderate (Spends 50% of raise)</option>
          <option value="0.85">Heavy Creep (Spends 85% on luxury EMIs & status)</option>
        </select>
      </div>
    `;
  } else if (scenario === "career_pivot") {
    scenarioDescText.textContent = "Simulate leaving a stable job to pursue a startup, higher studies, or exam prep.";
    scenarioSubTitle.textContent = "Zero-Income Runway vs. Post-Pivot Recovery";
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Years Without Income (Sabbatical / Runway)</label>
        <input type="number" id="burnYears" value="2" min="1" max="5">
      </div>
      <div class="form-group">
        <label>Expected Post-Transition Monthly Income (₹)</label>
        <input type="number" id="targetIncome" value="160000" step="20000">
      </div>
    `;
  } else if (scenario === "rent_vs_buy") {
    scenarioDescText.textContent = "Simulate buying a home on a 20-year EMI vs. renting and investing surplus in index funds.";
    scenarioSubTitle.textContent = "Buying on EMI vs. Renting & Investing Portfolio";
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Property Value (₹)</label>
        <input type="number" id="propertyValue" value="7000000" step="500000">
      </div>
      <div class="form-group">
        <label>Monthly Rent Alternative (₹)</label>
        <input type="number" id="rentCost" value="22000" step="2000">
      </div>
      <div class="form-group">
        <label>Loan Downpayment (₹)</label>
        <input type="number" id="downpayment" value="1400000" step="200000">
      </div>
    `;
  } else if (scenario === "medical_shock") {
    scenarioDescText.textContent = "Simulate an unpredicted major health catastrophe requiring critical care.";
    scenarioSubTitle.textContent = "Asset Shock Recovery Curve";
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Medical Emergency Cost (₹)</label>
        <input type="number" id="medicalShock" value="1500000" step="200000">
      </div>
      <div class="form-group">
        <label>Existing Health Insurance Cover (₹)</label>
        <input type="number" id="healthCover" value="500000" step="100000">
      </div>
    `;
  } else if (scenario === "burnout_grind") {
    scenarioDescText.textContent = "Simulate working 20+ extra hours weekly by sleeping only 4.5–5 hours per night.";
    scenarioSubTitle.textContent = "Income vs. Cognitive Vitality & Burnout Curve";
    dynamicInputs.innerHTML = `
      <div class="form-group">
        <label>Extra Work Hours per Week</label>
        <input type="number" id="extraWorkHrs" value="25" min="5" max="40">
      </div>
      <div class="form-group">
        <label>Sleep Hours per Day</label>
        <input type="number" id="dailySleep" value="5" min="3" max="8" step="0.5">
      </div>
    `;
  }
}

function runSimulation() {
  const currentAge = parseInt(ageSlider.value);
  let initialSavings = parseFloat(document.getElementById("net_worth").value) || 0;
  const monthlyIncome = parseFloat(document.getElementById("monthly_income").value) || 0;
  const annualIncome = monthlyIncome * 12;
  const monthlyExpense = parseFloat(document.getElementById("monthly_expense").value) || 0;
  const annualExpense = monthlyExpense * 12;

  const scenario = scenarioSelect.value;
  const years = 15;
  const inflation = 0.06;
  const investmentYield = 0.08;

  let baselineTraj = [];
  let whatifTraj = [];
  let insights = [];
  let vitalityScore = 85;
  let depletedYear = null;

  // 1. Calculate Baseline Path (Status Quo)
  let baseNW = initialSavings;
  let baseExp = annualExpense;
  for (let yr = 1; yr <= years; yr++) {
    let savings = annualIncome - baseExp;
    baseNW = (baseNW + savings) * (1 + investmentYield);
    baselineTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(baseNW), vitality: 85 });
    baseExp *= (1 + inflation);
  }

  // 2. Scenario-Specific Engines
  let whatifNW = initialSavings;
  let whatifExp = annualExpense;

  if (scenario === "death") {
    const insurance = parseFloat(document.getElementById("insurance")?.value || 0);
    const debt = parseFloat(document.getElementById("debt")?.value || 0);
    const depAge = parseInt(document.getElementById("dependentAge")?.value || 0);

    whatifNW = (initialSavings + insurance) - debt;
    vitalityScore = 0;

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
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW), vitality: 0 });
      whatifExp *= (1 + inflation);
    }

    const independenceTargetYr = Math.max(0, 22 - depAge);
    if (depletedYear && depletedYear < independenceTargetYr) {
      insights.push(`🚨 CRITICAL DEFICIT: Family funds run dry in Year ${depletedYear}. Your youngest dependent will be only age ${depAge + depletedYear} (Target: age 22).`);
      const gapYears = independenceTargetYr - depletedYear;
      insights.push(`Recommended Action: Secure an additional ₹${Math.round(gapYears * annualExpense * 1.4).toLocaleString('en-IN')} in pure term insurance immediately.`);
    } else {
      insights.push(`✅ Financially Protected: Existing cover + assets sustain the family past the youngest child's 22nd birthday.`);
    }

  } else if (scenario === "rich") {
    const multiplier = parseFloat(document.getElementById("multiplier").value);
    const creep = parseFloat(document.getElementById("creep").value);
    const boostedAnnualIncome = annualIncome * multiplier;
    const addedSpend = (boostedAnnualIncome - annualIncome) * creep;
    whatifExp += addedSpend;

    for (let yr = 1; yr <= years; yr++) {
      let savings = boostedAnnualIncome - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW), vitality: 85 });
      whatifExp *= (1 + inflation);
    }

    const extraWealth = whatifTraj[years - 1].netWorth - baselineTraj[years - 1].netWorth;
    insights.push(`📈 Net Worth Expansion: Produces an additional ₹${extraWealth.toLocaleString('en-IN')} in assets by Year 15.`);
    if (creep >= 0.8) {
      insights.push(`⚠️ Lifestyle Creep Vulnerability: Fixed expenses ballooned to ₹${Math.round(whatifExp/12).toLocaleString('en-IN')}/mo. If a layoff occurs, funds deplete 3x faster than your current modest lifestyle.`);
    }

  } else if (scenario === "career_pivot") {
    const burnYears = parseInt(document.getElementById("burnYears").value);
    const targetAnnual = parseFloat(document.getElementById("targetIncome").value) * 12;

    for (let yr = 1; yr <= years; yr++) {
      let income = yr <= burnYears ? 0 : targetAnnual;
      let savings = income - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      if (whatifNW < 0) {
        whatifNW = 0;
        if (!depletedYear) depletedYear = yr;
      }
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW), vitality: yr <= burnYears ? 70 : 88 });
      whatifExp *= (1 + inflation);
    }

    if (depletedYear) {
      insights.push(`🚨 Sabbatical Failure: Liquidity runs out in Year ${depletedYear} before the career pivot pays off. You need a larger safety buffer.`);
    } else {
      insights.push(`✅ Viable Transition: Savings safely sustain the ${burnYears}-year zero-income period, outperforming the baseline path after recovery.`);
    }

  } else if (scenario === "rent_vs_buy") {
    const propVal = parseFloat(document.getElementById("propertyValue").value);
    const rentCost = parseFloat(document.getElementById("rentCost").value) * 12;
    const downpayment = parseFloat(document.getElementById("downpayment").value);
    
    // 20-year EMI at 8.5% interest
    const loanAmount = propVal - downpayment;
    const monthlyRate = 0.085 / 12;
    const n = 240;
    const monthlyEMI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const annualEMI = monthlyEMI * 12;

    whatifNW = Math.max(0, initialSavings - downpayment);
    let propertyEquity = downpayment;

    for (let yr = 1; yr <= years; yr++) {
      // Home appreciates ~5% annually
      propertyEquity *= 1.05;
      let savings = annualIncome - annualEMI - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW + propertyEquity), vitality: 80 });
      whatifExp *= (1 + inflation);
    }

    insights.push(`🏡 Real Estate Analysis: Monthly EMI locks in ₹${Math.round(monthlyEMI).toLocaleString('en-IN')}/mo for 20 years.`);
    insights.push(`💡 Opportunity Cost: Renting at ₹${Math.round(rentCost/12).toLocaleString('en-IN')}/mo and investing the surplus yields higher liquid freedom.`);

  } else if (scenario === "medical_shock") {
    const medicalCost = parseFloat(document.getElementById("medicalShock").value);
    const healthCover = parseFloat(document.getElementById("healthCover").value);
    const outOfPocket = Math.max(0, medicalCost - healthCover);

    whatifNW = Math.max(0, initialSavings - outOfPocket);

    for (let yr = 1; yr <= years; yr++) {
      let savings = annualIncome - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      if (whatifNW < 0) {
        whatifNW = 0;
        if (!depletedYear) depletedYear = yr;
      }
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW), vitality: 75 });
      whatifExp *= (1 + inflation);
    }

    insights.push(`🏥 Out-Of-Pocket Shock: You absorbed an immediate uninsurable blow of ₹${outOfPocket.toLocaleString('en-IN')}.`);
    if (outOfPocket > initialSavings) {
      insights.push(`🚨 Emergency Debt Alert: Medical costs exceeded all liquid cash, forcing expensive emergency borrowing.`);
    } else {
      insights.push(`✅ Liquid Buffer Absorbed Shock: Savings survived without forcing loan defaults.`);
    }

  } else if (scenario === "burnout_grind") {
    const extraHrs = parseFloat(document.getElementById("extraWorkHrs").value);
    const sleep = parseFloat(document.getElementById("dailySleep").value);
    const extraIncome = (annualIncome * 0.35); // 35% moonlighting boost
    let currentVit = 85;

    for (let yr = 1; yr <= years; yr++) {
      if (sleep < 6.0) currentVit = Math.max(15, currentVit - 9);
      let savings = (annualIncome + extraIncome) - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW), vitality: Math.round(currentVit) });
      whatifExp *= (1 + inflation);
    }

    vitalityScore = currentVit;
    insights.push(`⚠️ Cognitive Vitality Dropped to ${currentVit}/100: Sleep deprivation triggers exponential burnout within 18–24 months.`);
    insights.push(`🩺 Hidden Medical Expense: Financial gains from moonlighting risk being wiped out by health rehabilitation costs.`);
  }

  updateUI(baselineTraj, whatifTraj, depletedYear, vitalityScore, insights);
}

function updateUI(baselineTraj, whatifTraj, depletedYear, vitalityScore, insights) {
  const statusBadge = document.getElementById("statusBadge");
  const runwayMetric = document.getElementById("runwayMetric");
  const solvencyMetric = document.getElementById("vitalityMetric");
  const deltaMetric = document.getElementById("deltaMetric");

  if (depletedYear) {
    statusBadge.className = "status-pill status-danger";
    statusBadge.textContent = "High Risk / Depleted";
    runwayMetric.textContent = `Year ${depletedYear}`;
  } else if (vitalityScore < 40) {
    statusBadge.className = "status-pill status-warn";
    statusBadge.textContent = "Burnout Warning";
    runwayMetric.textContent = "15+ Years";
  } else {
    statusBadge.className = "status-pill status-safe";
    statusBadge.textContent = "Secure";
    runwayMetric.textContent = "15+ Years";
  }

  solvencyMetric.textContent = `${vitalityScore} / 100`;

  const delta = whatifTraj[whatifTraj.length - 1].netWorth - baselineTraj[baselineTraj.length - 1].netWorth;
  const sign = delta >= 0 ? "+" : "";
  deltaMetric.textContent = `${sign}₹${Math.round(delta).toLocaleString('en-IN')}`;

  const insightsList = document.getElementById("insightsList");
  insightsList.innerHTML = insights.map(i => `<li>${i}</li>`).join("");

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
        x: { grid: { color: "#27334a" }, ticks: { color: "#94a3b8" } },
        y: {
          grid: { color: "#27334a" },
          ticks: {
            color: "#94a3b8",
            callback: (val) => "₹" + (val / 100000).toFixed(1) + "L"
          }
        }
      },
      plugins: {
        legend: { labels: { color: "#f8fafc" } }
      }
    }
  });
}

// Initialize on page load
renderDynamicInputs();
runSimulation();
runBtn.addEventListener("click", runSimulation);
renderDynamicInputs();
runSimulation();
runBtn.addEventListener("click", runSimulation);
