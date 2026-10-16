let chartInstance = null;

const presets = {
  family_loss: "I am 30 years old earning ₹85,000/month with ₹6 Lakh in savings and a ₹10 Lakh home loan. I have a 3-year-old child. What happens to my family if I die tomorrow with ₹30 Lakh insurance?",
  career_upsc: "I am 26, earning ₹60,000 per month with ₹3.5 Lakh savings. I want to quit my job for 2 years to prepare for UPSC civil services exam. Can my savings survive without income?",
  income_jump: "I am 25 years old earning ₹45,000/month. What happens if I switch to a US-based remote startup offering 3x my current salary, but I spend 50% of the raise on luxury and upgrades?",
  medical_crisis: "I am 32 years old with ₹5 Lakh savings and ₹75,000 monthly income. What if a sudden critical illness strikes requiring ₹15 Lakhs in emergency hospital treatment and I only have ₹5 Lakh insurance cover?"
};

function loadPreset(key) {
  const input = document.getElementById("userDilemma");
  if (input && presets[key]) {
    input.value = presets[key];
    compileAndSimulate();
  }
}

/**
 * Universal Natural Language Parser
 */
function parseDilemmaText(text) {
  const profile = {
    age: 27,
    savings: 400000,
    income: 70000,
    expenses: 40000,
    insurance: 2500000,
    debt: 0,
    scenario: "career_sabbatical"
  };

  const clean = text.toLowerCase();

  // 1. Extract Age
  const ageMatch = clean.match(/(?:i am|age|aged|am)\s*(\d{2})/i) || clean.match(/(\d{2})\s*(?:years|yr|y\/o)/i);
  if (ageMatch && ageMatch[1]) {
    profile.age = parseInt(ageMatch[1]);
  }

  // 2. Extract Monthly Income
  const incMatch = clean.match(/(?:earning|salary|income|earn|make|makes)\s*(?:of|is|around)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac|pm|per month)?/i);
  if (incMatch) {
    let val = parseFloat(incMatch[1].replace(/,/g, ''));
    let unit = (incMatch[2] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    if (!isNaN(val) && val > 0) {
      profile.income = val;
      profile.expenses = Math.round(val * 0.55); // Estimated basic expenses at 55%
    }
  }

  // 3. Extract Savings / Net Worth
  const savMatch = clean.match(/([\d,.]+)\s*(k|lakh|lac)?\s*(?:in|as|of)?\s*(?:savings|liquid|saved|fund|investments)/i) ||
                   clean.match(/(?:savings|saved)\s*(?:of|is|around)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac)?/i);
  if (savMatch) {
    let raw = savMatch[1] || savMatch[2];
    let val = parseFloat(raw.replace(/,/g, ''));
    let unit = (savMatch[2] || savMatch[3] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    if (!isNaN(val) && val > 0) profile.savings = val;
  }

  // 4. Extract Debt / Loan
  const debtMatch = clean.match(/([\d,.]+)\s*(k|lakh|lac)?\s*(?:debt|loan|emi|mortgage)/i) ||
                    clean.match(/(?:loan|debt|emi)\s*(?:of|is)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac)?/i);
  if (debtMatch) {
    let raw = debtMatch[1] || debtMatch[2];
    let val = parseFloat(raw.replace(/,/g, ''));
    let unit = (debtMatch[2] || debtMatch[3] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    if (!isNaN(val) && val > 0) profile.debt = val;
  }

  // 5. Extract Insurance
  const insMatch = clean.match(/([\d,.]+)\s*(k|lakh|lac)?\s*(?:insurance|cover|term insurance)/i) ||
                   clean.match(/(?:insurance|cover)\s*(?:of|is)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lac)?/i);
  if (insMatch) {
    let raw = insMatch[1] || insMatch[2];
    let val = parseFloat(raw.replace(/,/g, ''));
    let unit = (insMatch[2] || insMatch[3] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    else if (unit === 'lakh' || unit === 'lac') val *= 100000;
    if (!isNaN(val) && val > 0) profile.insurance = val;
  }

  // 6. Inferred Scenario
  if (clean.includes("die") || clean.includes("death") || clean.includes("pass away") || clean.includes("family survival")) {
    profile.scenario = "contingency_death";
  } else if (clean.includes("upsc") || clean.includes("quit") || clean.includes("study") || clean.includes("startup") || clean.includes("sabbatical")) {
    profile.scenario = "career_sabbatical";
  } else if (clean.includes("rich") || clean.includes("3x") || clean.includes("2x") || clean.includes("5x") || clean.includes("multiplier") || clean.includes("raise")) {
    profile.scenario = "income_multiplier";
  } else if (clean.includes("medical") || clean.includes("hospital") || clean.includes("illness") || clean.includes("emergency")) {
    profile.scenario = "medical_shock";
  }

  return profile;
}

/**
 * Main Trigger Button Function
 */
function compileAndSimulate() {
  const textInput = document.getElementById("userDilemma");
  const rawText = textInput ? textInput.value.trim() : "";

  if (!rawText) {
    alert("Please enter a dilemma in the box, or click one of the quick presets!");
    return;
  }

  // 1. Parse text into structured state
  const state = parseDilemmaText(rawText);

  // 2. Reflect in Compiled Profile Form UI
  document.getElementById("prof_age").value = state.age;
  document.getElementById("prof_age_val").textContent = state.age;
  document.getElementById("prof_savings").value = state.savings;
  document.getElementById("prof_income").value = state.income;
  document.getElementById("prof_expenses").value = state.expenses;
  document.getElementById("prof_insurance").value = state.insurance;
  document.getElementById("prof_debt").value = state.debt;

  const scenarioDropdown = document.getElementById("detectedScenario");
  scenarioDropdown.value = state.scenario;

  const badge = document.getElementById("extractedBadge");
  badge.textContent = "Compiled Successfully ✓";
  badge.style.background = "rgba(16, 185, 129, 0.2)";
  badge.style.color = "#34d399";

  // 3. Render contextual scenario sub-inputs
  renderScenarioParameters(state.scenario);

  // 4. Run deterministic simulation & output conclusion
  runDeterministicSimulation();
}

function onScenarioDropdownChange() {
  const scenario = document.getElementById("detectedScenario").value;
  renderScenarioParameters(scenario);
  runDeterministicSimulation();
}

function renderScenarioParameters(scenario) {
  const container = document.getElementById("scenarioParameters");
  if (!container) return;
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
        <label>Years of Zero Income (Runway needed)</label>
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
        <label>Lifestyle Creep (% of raise spent on upgrades)</label>
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
  const currentAge = parseInt(document.getElementById("prof_age").value) || 27;
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
  let finalConclusion = { title: "", summary: "", risk: "", action: "" };

  // 1. Baseline Path (Status Quo)
  let baseNW = initialSavings;
  let baseExp = annualExpense;
  for (let yr = 1; yr <= years; yr++) {
    let savings = annualIncome - baseExp;
    baseNW = (baseNW + savings) * (1 + investmentYield);
    baselineTraj.push({ year: yr, age: currentAge + yr, netWorth: Math.round(baseNW) });
    baseExp *= (1 + inflation);
  }

  // 2. Shock / Dilemma Path
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
      finalConclusion.title = "Family Protection Deficit Detected";
      finalConclusion.summary = `In the event of sudden demise, available insurance (₹${insuranceCover.toLocaleString('en-IN')}) and savings will be completely exhausted by Year ${depletedYear}. Your child will be only ${childAge + depletedYear} years old at depletion.`;
      finalConclusion.risk = `Family runs out of funds ${independenceTargetYr - depletedYear} years before dependent adulthood.`;
      finalConclusion.action = `Increase term insurance by ₹${Math.round((independenceTargetYr - depletedYear) * annualExpense * 1.5).toLocaleString('en-IN')}.`;
      insights.push(`🚨 CRITICAL DEFICIT: Family funds deplete in Year ${depletedYear}. Youngest dependent will be age ${childAge + depletedYear}.`);
    } else {
      finalConclusion.title = "Family Financial Protection Stable";
      finalConclusion.summary = `Your assets and term cover provide adequate runway through the child's age 22, sustaining living costs with inflation.`;
      finalConclusion.risk = "Low risk of total family bankruptcy.";
      finalConclusion.action = "Maintain existing term policy and avoid adding high-interest liabilities.";
      insights.push(`✅ Solvency Maintained: Assets sustain family past dependent adulthood.`);
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
      finalConclusion.title = "Sabbatical Runway Insufficient";
      finalConclusion.summary = `Current liquid savings of ₹${initialSavings.toLocaleString('en-IN')} cannot support a ${pivotYears}-year zero-income period at your ₹${monthlyExpense.toLocaleString('en-IN')}/mo burn rate.`;
      finalConclusion.risk = `Cash depletion in Year ${depletedYear}, risking forced abort of career pivot.`;
      finalConclusion.action = `Save at least ₹${Math.round(pivotYears * annualExpense).toLocaleString('en-IN')} before quitting your stable job.`;
      insights.push(`🚨 Runway Depletion: Funds run out in Year ${depletedYear}.`);
    } else {
      finalConclusion.title = "Career Sabbatical Financially Feasible";
      finalConclusion.summary = `Your liquid reserves absorb the ${pivotYears}-year sabbatical cleanly, crossing baseline wealth shortly after transition.`;
      finalConclusion.risk = "Short-term capital stagnation during pivot.";
      finalConclusion.action = "Proceed with transition while keeping living expenses strictly capped.";
      insights.push(`✅ Viable Transition: Savings safely sustain the career pivot.`);
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
    finalConclusion.title = "Significant Wealth Acceleration";
    finalConclusion.summary = `Higher income yields an additional ₹${netWorthDiff.toLocaleString('en-IN')} in net worth over 15 years.`;
    finalConclusion.risk = creep >= 0.8 ? "Heavy lifestyle creep creates fragile fixed EMIs." : "Minimal vulnerability.";
    finalConclusion.action = "Automate investing 50%+ of all raises into diversified index equity.";
    insights.push(`📈 Wealth Expansion: Projected +₹${netWorthDiff.toLocaleString('en-IN')} net assets.`);

  } else if (scenario === "medical_shock") {
    const shockBill = parseFloat(document.getElementById("medicalShock")?.value || 1200000);
    const outOfPocket = Math.max(0, shockBill - insuranceCover);

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

    finalConclusion.title = "Critical Health Out-of-Pocket Shock";
    finalConclusion.summary = `An uninsurable medical expense of ₹${outOfPocket.toLocaleString('en-IN')} absorbed ${Math.round((outOfPocket / (initialSavings || 1)) * 100)}% of your liquid capital.`;
    finalConclusion.risk = outOfPocket > initialSavings ? "Immediate debt dependency." : "Substantial reduction in long-term compound wealth.";
    finalConclusion.action = "Secure a ₹25 Lakh super top-up health insurance policy.";
    insights.push(`🏥 Emergency Hit: Absorbed ₹${outOfPocket.toLocaleString('en-IN')} out of pocket.`);
  }

  // 3. Render Conclusion & Visuals
  renderConclusionCard(finalConclusion, depletedYear);
  updateResultsUI(baselineTraj, whatifTraj, depletedYear, insights);
}

function renderConclusionCard(conclusion, depletedYear) {
  const card = document.getElementById("conclusionCard");
  const pill = document.getElementById("verdictPill");
  const title = document.getElementById("verdictTitle");
  const summary = document.getElementById("verdictSummary");
  const risk = document.getElementById("riskText");
  const action = document.getElementById("actionText");

  if (!card) return;

  card.style.display = "block";
  title.textContent = conclusion.title;
  summary.textContent = conclusion.summary;
  risk.textContent = conclusion.risk;
  action.textContent = conclusion.action;

  if (depletedYear) {
    pill.className = "status-pill status-danger";
    pill.textContent = "High Risk";
  } else {
    pill.className = "status-pill status-safe";
    pill.textContent = "Safe / Feasible";
  }
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

// Initial default run on boot
window.addEventListener("DOMContentLoaded", () => {
  renderScenarioParameters("career_sabbatical");
  runDeterministicSimulation();
});
