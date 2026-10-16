let chartInstance = null;

const presets = {
  family_loss: "I am 30 years old earning ₹85,000/month with ₹6 Lakh in savings and a ₹10 Lakh home loan. I have a 3-year-old child. What happens to my family if I die tomorrow with ₹30 Lakh insurance?",
  career_upsc: "I am 26, earning ₹60,000 per month with ₹3.5 Lakh savings. I want to quit my job for 2 years to prepare for UPSC civil services exam. Can my savings survive without income?",
  income_jump: "I am 25 years old earning ₹45,000/month. What happens if I switch to a US-based remote startup offering 3x my current salary, but I spend 50% of the raise on luxury and upgrades?",
  medical_crisis: "I am 32 years old with ₹5 Lakh savings and ₹75,000 monthly income. What if a sudden critical illness strikes requiring ₹15 Lakhs in emergency hospital treatment and I only have ₹5 Lakh insurance cover?"
};

function loadPreset(key) {
  document.getElementById("userDilemma").value = presets[key];
  compileAndSimulate();
}

/**
 * Natural Language Dilemma Compiler
 * Extracts profile state (Age, Income, Savings, Debts, Insurance)
 * and classifies the dilemma archetype from unstructured text.
 */
function parseDilemmaText(text) {
  const profile = {
    age: 26,
    savings: 400000,
    income: 65000,
    expenses: 38000,
    insurance: 2500000,
    debt: 0,
    scenario: "career_sabbatical"
  };

  const lower = text.toLowerCase();

  // 1. Age Extraction
  const ageMatch = lower.match(/(?:i am|age|aged|am)\s*(\d{2})/i) || lower.match(/(\d{2})\s*(?:years|yr|y\/o)/i);
  if (ageMatch) profile.age = parseInt(ageMatch[1]);

  // 2. Income Extraction (Look for K, Lakh, per month)
  const incomeMatch = lower.match(/(?:earning|salary|income|earn|make)\s*(?:of|is|around)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac|pm|per month)?/i);
  if (incomeMatch) {
    let val = parseFloat(incomeMatch[1].replace(/,/g, ''));
    let unit = incomeMatch[2] ? incomeMatch[2].toLowerCase() : '';
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    profile.income = val;
    profile.expenses = Math.round(val * 0.55); // Default realistic expense assumption (55%)
  }

  // 3. Savings Extraction
  const savingsMatch = lower.match(/([\d,.]+)\s*(k|lakh|lac)?\s*(?:in|as|of)?\s*(?:savings|liquid|saved|fund|investments)/i) ||
                       lower.match(/(?:savings|saved)\s*(?:of|is|around)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac)?/i);
  if (savingsMatch) {
    let val = parseFloat((savingsMatch[1] || savingsMatch[2]).replace(/,/g, ''));
    let unit = (savingsMatch[2] || savingsMatch[3] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    profile.savings = val;
  }

  // 4. Debt Extraction
  const debtMatch = lower.match(/([\d,.]+)\s*(k|lakh|lac)?\s*(?:debt|loan|emi|mortgage)/i) ||
                    lower.match(/(?:loan|debt|emi)\s*(?:of|is)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac)?/i);
  if (debtMatch) {
    let val = parseFloat((debtMatch[1] || debtMatch[2]).replace(/,/g, ''));
    let unit = (debtMatch[2] || debtMatch[3] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    profile.debt = val;
  }

  // 5. Insurance Extraction
  const insMatch = lower.match(/([\d,.]+)\s*(k|lakh|lac)?\s*(?:insurance|cover|term insurance)/i) ||
                   lower.match(/(?:insurance|cover)\s*(?:of|is)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac)?/i);
  if (insMatch) {
    let val = parseFloat((insMatch[1] || insMatch[2]).replace(/,/g, ''));
    let unit = (insMatch[2] || insMatch[3] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    profile.insurance = val;
  }

  // 6. Scenario Intent Classification
  if (lower.includes("die") || lower.includes("death") || lower.includes("pass away") || lower.includes("family survival")) {
    profile.scenario = "contingency_death";
  } else if (lower.includes("upsc") || lower.includes("quit") || lower.includes("study") || lower.includes("startup") || lower.includes("sabbatical")) {
    profile.scenario = "career_sabbatical";
  } else if (lower.includes("rich") || lower.includes("multiplier") || lower.includes("3x") || lower.includes("2x") || lower.includes("raise")) {
    profile.scenario = "income_multiplier";
  } else if (lower.includes("medical") || lower.includes("illness") || lower.includes("hospital") || lower.includes("emergency")) {
    profile.scenario = "medical_shock";
  }

  return profile;
}

function compileAndSimulate() {
  const text = document.getElementById("userDilemma").value.trim();
  if (!text) {
    alert("Please write your dilemma or click one of the quick presets!");
    return;
  }

  const parsed = parseDilemmaText(text);

  // Populate UI inputs with compiled profile
  document.getElementById("prof_age").value = parsed.age;
  document.getElementById("prof_age_val").textContent = parsed.age;
  document.getElementById("prof_savings").value = parsed.savings;
  document.getElementById("prof_income").value = parsed.income;
  document.getElementById("prof_expenses").value = parsed.expenses;
  document.getElementById("prof_insurance").value = parsed.insurance;
  document.getElementById("prof_debt").value = parsed.debt;
  document.getElementById("detectedScenario").value = parsed.scenario;

  renderScenarioParameters(parsed.scenario);
  runDeterministicSimulation();
}

function renderScenarioParameters(scenario) {
  const container = document.getElementById("scenarioParameters");
  container.innerHTML = "";

  if (scenario === "contingency_death") {
    container.innerHTML = `
      <div class="form-group">
        <label>Youngest Child / Dependent Age</label>
        <input type="number" id="childAge" value="3" min="0" max="25">
      </div>
    `;
  } else if (scenario === "career_sabbatical") {
    container.innerHTML = `
      <div class="form-group">
        <label>Duration of Zero Income (Years)</label>
        <input type="number" id="pivotYears" value="2" min="1" max="5">
      </div>
      <div class="form-group">
        <label>Target Post-Pivot Monthly Income (₹)</label>
        <input type="number" id="targetIncome" value="150000" step="20000">
      </div>
    `;
  } else if (scenario === "income_multiplier") {
    container.innerHTML = `
      <div class="form-group">
        <label>Salary Surge Multiplier</label>
        <select id="surgeMultiplier">
          <option value="2">2x Income Jump</option>
          <option value="3" selected>3x Income Jump</option>
          <option value="5">5x Income Jump</option>
        </select>
      </div>
      <div class="form-group">
        <label>Lifestyle Inflation / Creep (% of raise spent)</label>
        <select id="lifestyleCreep">
          <option value="0.2">Frugal (Spends only 20% on luxuries)</option>
          <option value="0.5" selected>Moderate (Spends 50% on upgrades)</option>
          <option value="0.85">Heavy Creep (Spends 85% on status & EMIs)</option>
        </select>
      </div>
    `;
  } else if (scenario === "medical_shock") {
    container.innerHTML = `
      <div class="form-group">
        <label>Emergency Medical Bill (₹)</label>
        <input type="number" id="medicalShock" value="1200000" step="100000">
      </div>
    `;
  }
}

function runDeterministicSimulation() {
  const currentAge = parseInt(document.getElementById("prof_age").value);
  const initialSavings = parseFloat(document.getElementById("prof_savings").value) || 0;
  const monthlyIncome = parseFloat(document.getElementById("prof_income").value) || 0;
  const annualIncome = monthlyIncome * 12;
  const monthlyExpense = parseFloat(document.getElementById("prof_expenses").value) || 0;
  const annualExpense = monthlyExpense * 12;
  const insuranceCover = parseFloat(document.getElementById("prof_insurance").value) || 0;
  const outstandingDebt = parseFloat(document.getElementById("prof_debt").value) || 0;

  const scenario = document.getElementById("detectedScenario").value;
  const years = 15;
  const inflation = 0.06;
  const investmentYield = 0.08;

  let baselineTraj = [];
  let whatifTraj = [];
  let insights = [];
  let depletedYear = null;

  // 1. Compute Status-Quo Baseline
  let baseNW = initialSavings;
  let baseExp = annualExpense;
  for (let yr = 1; yr <= years; yr++) {
    let savings = annualIncome - baseExp;
    baseNW = (baseNW + savings) * (1 + investmentYield);
    baselineTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(baseNW) });
    baseExp *= (1 + inflation);
  }

  // 2. Compute Shock Trajectory
  let whatifNW = initialSavings;
  let whatifExp = annualExpense;

  if (scenario === "contingency_death") {
    const childAge = parseInt(document.getElementById("childAge")?.value || 3);
    whatifNW = (initialSavings + insuranceCover) - outstandingDebt;

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

    const independenceTargetYr = Math.max(0, 22 - childAge);
    if (depletedYear && depletedYear < independenceTargetYr) {
      insights.push(`🚨 CRITICAL VULNERABILITY: Family funds deplete in Year ${depletedYear}. Your dependent child will be only ${childAge + depletedYear} years old (Target independence: age 22).`);
      const gapYears = independenceTargetYr - depletedYear;
      insights.push(`Financial Shield Gap: Increase term life insurance by ₹${Math.round(gapYears * annualExpense * 1.4).toLocaleString('en-IN')} to ensure complete childhood coverage.`);
    } else {
      insights.push(`✅ Fully Protected: Combined assets and term cover secure your family through the youngest dependent's 22nd birthday.`);
    }

  } else if (scenario === "career_sabbatical") {
    const pivotYears = parseInt(document.getElementById("pivotYears")?.value || 2);
    const targetIncome = (parseFloat(document.getElementById("targetIncome")?.value || 150000)) * 12;

    for (let yr = 1; yr <= years; yr++) {
      let income = yr <= pivotYears ? 0 : targetIncome;
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
      insights.push(`🚨 Runway Depletion: Cash buffer is exhausted in Year ${depletedYear}. You cannot sustain a ${pivotYears}-year sabbatical with current savings.`);
      insights.push(`Actionable Remedy: Accumulate at least ₹${Math.round(pivotYears * annualExpense).toLocaleString('en-IN')} before resigning.`);
    } else {
      insights.push(`✅ Viable Transition: Savings safely sustain the ${pivotYears}-year study/startup phase, surpassing baseline wealth by Year ${pivotYears + 2}.`);
    }

  } else if (scenario === "income_multiplier") {
    const mult = parseFloat(document.getElementById("surgeMultiplier")?.value || 3);
    const creep = parseFloat(document.getElementById("lifestyleCreep")?.value || 0.5);
    const boostedIncome = annualIncome * mult;
    const addedSpend = (boostedIncome - annualIncome) * creep;
    whatifExp += addedSpend;

    for (let yr = 1; yr <= years; yr++) {
      let savings = boostedIncome - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW) });
      whatifExp *= (1 + inflation);
    }

    const netWorthDiff = whatifTraj[years - 1].netWorth - baselineTraj[years - 1].netWorth;
    insights.push(`📈 Accelerated Accumulation: Your 15-year net worth increases by ₹${netWorthDiff.toLocaleString('en-IN')}.`);
    if (creep >= 0.8) {
      insights.push(`⚠️ Golden Handcuffs Warning: A lifestyle creep of 85% traps you into an inflated ₹${Math.round(whatifExp/12).toLocaleString('en-IN')}/mo fixed burn rate.`);
    }

  } else if (scenario === "medical_shock") {
    const shockBill = parseFloat(document.getElementById("medicalShock")?.value || 1200000);
    const outOfPocket = Math.max(0, shockBill - 500000); // 5L assumed base health cover

    whatifNW = Math.max(0, initialSavings - outOfPocket);

    for (let yr = 1; yr <= years; yr++) {
      let savings = annualIncome - whatifExp;
      whatifNW = (whatifNW + savings) * (1 + investmentYield);
      if (whatifNW < 0) {
        whatifNW = 0;
        if (!depletedYear) depletedYear = yr;
      }
      whatifTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(whatifNW) });
      whatifExp *= (1 + inflation);
    }

    insights.push(`🏥 Emergency Impact: An out-of-pocket medical hit of ₹${outOfPocket.toLocaleString('en-IN')} wiped out ${Math.round((outOfPocket / (initialSavings || 1)) * 100)}% of your liquid capital.`);
    insights.push(`Recommended Action: Upgrade family health insurance to a ₹25 Lakh super top-up policy to avoid depleting wealth on hospital stays.`);
  }

  updateResultsUI(baselineTraj, whatifTraj, depletedYear, insights);
}

function updateResultsUI(baselineTraj, whatifTraj, depletedYear, insights) {
  const statusBadge = document.getElementById("statusBadge");
  const runwayMetric = document.getElementById("runwayMetric");
  const deltaMetric = document.getElementById("deltaMetric");
  const vulnerabilityMetric = document.getElementById("vulnerabilityMetric");

  if (depletedYear) {
    statusBadge.className = "status-pill status-danger";
    statusBadge.textContent = "High Risk / Depleted";
    runwayMetric.textContent = `Year ${depletedYear}`;
    vulnerabilityMetric.textContent = "Severe";
  } else {
    statusBadge.className = "status-pill status-safe";
    statusBadge.textContent = "Secure";
    runwayMetric.textContent = "15+ Years";
    vulnerabilityMetric.textContent = "Resilient";
  }

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
          label: "What-If Dilemma Path",
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
document.addEventListener("DOMContentLoaded", () => {
  renderScenarioParameters("career_sabbatical");
  runDeterministicSimulation();
});
