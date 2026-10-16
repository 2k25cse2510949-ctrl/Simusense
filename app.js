let myChart = null;

const presets = {
  death: "I am 30 years old earning ₹85,000/month with ₹6 Lakh in savings and a ₹10 Lakh home loan. What happens to my family if I die tomorrow with ₹30 Lakh insurance and a 3-year-old child?",
  upsc: "I am 26 years old earning ₹60,000 per month with ₹3.5 Lakh savings. I want to quit my job for 2 years to prepare for exams. Can my savings survive without income?",
  rich: "I am 25 years old earning ₹45,000/month. What happens if I get a 3x salary jump but spend 60% of the raise on luxury and upgrades?",
  medical: "I am 32 years old with ₹5 Lakh savings and ₹75,000 monthly income. What if a sudden medical emergency requires ₹12 Lakhs and insurance only covers ₹4 Lakh?"
};

function handlePreset(key) {
  const input = document.getElementById("userDilemma");
  if (input && presets[key]) {
    input.value = presets[key];
    compileAndSimulate();
  }
}

/**
 * Robust Natural Language Parser with Fallback Defaults
 */
function parseDilemmaText(text) {
  const clean = text.toLowerCase();

  // Baseline defaults in case the user omits certain parameters
  const profile = {
    age: 26,
    income: 50000,
    expenses: 28000,
    savings: 200000,
    debt: 0,
    insurance: 1500000,
    scenario: "sabbatical"
  };

  // 1. Age extraction (e.g., "age 28", "am 30", "25 yrs", "26 y/o")
  const ageMatch = clean.match(/(?:age|aged|am|i am)\s*(\d{2})/i) || clean.match(/(\d{2})\s*(?:years|yr|y\/o)/i);
  if (ageMatch && ageMatch[1]) {
    profile.age = parseInt(ageMatch[1]);
  }

  // Currency & Unit Extraction Helper
  function extractAmount(keywords) {
    for (let kw of keywords) {
      // Matches both "salary 60000", "earning 60k", "5 lakh savings", "savings: 4L", etc.
      const pattern = new RegExp(kw + "\\s*(?:of|is|:)?\\s*(?:₹|rs\\.?|inr)?\\s*([\\d,.]+)\\s*(k|lakh|lac|l|cr|crore)?", "i");
      const reversePattern = new RegExp("([\\d,.]+)\\s*(k|lakh|lac|l|cr|crore)?\\s*(?:in|as)?\\s*" + kw, "i");

      let m = clean.match(pattern) || clean.match(reversePattern);
      if (m) {
        let numStr = m[1].replace(/,/g, '');
        let val = parseFloat(numStr);
        let unit = (m[2] || '').toLowerCase();

        if (unit === 'k') val *= 1000;
        else if (unit === 'lakh' || unit === 'lac' || unit === 'l') val *= 100000;
        else if (unit === 'cr' || unit === 'crore') val *= 10000000;

        if (!isNaN(val) && val > 0) return val;
      }
    }
    return null;
  }

  // 2. Extract Income
  const incomeVal = extractAmount(["salary", "earning", "earn", "income", "make", "pm", "per month"]);
  if (incomeVal) {
    profile.income = incomeVal;
    profile.expenses = Math.round(incomeVal * 0.55); // Sensible 55% living cost default
  }

  // 3. Extract Savings
  const savingsVal = extractAmount(["saving", "savings", "saved", "liquid", "fund", "net worth", "bank"]);
  if (savingsVal) profile.savings = savingsVal;

  // 4. Extract Debt
  const debtVal = extractAmount(["debt", "loan", "emi", "mortgage", "owe"]);
  if (debtVal) profile.debt = debtVal;

  // 5. Extract Insurance
  const insVal = extractAmount(["insurance", "cover", "term insurance", "policy"]);
  if (insVal) profile.insurance = insVal;

  // 6. Broad Keyword Scenario Detection
  if (clean.includes("die") || clean.includes("death") || clean.includes("pass away") || clean.includes("family") || clean.includes("life insurance")) {
    profile.scenario = "death";
  } else if (clean.includes("quit") || clean.includes("study") || clean.includes("exam") || clean.includes("upsc") || clean.includes("startup") || clean.includes("sabbatical") || clean.includes("break") || clean.includes("business")) {
    profile.scenario = "sabbatical";
  } else if (clean.includes("rich") || clean.includes("2x") || clean.includes("3x") || clean.includes("5x") || clean.includes("jump") || clean.includes("raise") || clean.includes("more money") || clean.includes("hike")) {
    profile.scenario = "rich";
  } else if (clean.includes("medic") || clean.includes("hospital") || clean.includes("ill") || clean.includes("disease") || clean.includes("health") || clean.includes("emergency") || clean.includes("accident")) {
    profile.scenario = "medical";
  }

  return profile;
}

/**
 * Triggered by the "Analyze Dilemma & Compile Life Profile" Button
 */
function compileAndSimulate() {
  const rawText = document.getElementById("userDilemma").value || "";

  if (!rawText.trim()) {
    alert("Please enter a question or dilemma first!");
    return;
  }

  // Parse dilemma text safely with fallbacks
  const profile = parseDilemmaText(rawText);

  // Populate UI fields
  if (document.getElementById("prof_age")) document.getElementById("prof_age").value = profile.age;
  if (document.getElementById("prof_savings")) document.getElementById("prof_savings").value = profile.savings;
  if (document.getElementById("prof_income")) document.getElementById("prof_income").value = profile.income;
  if (document.getElementById("prof_expenses")) document.getElementById("prof_expenses").value = profile.expenses;
  if (document.getElementById("prof_insurance")) document.getElementById("prof_insurance").value = profile.insurance;
  if (document.getElementById("prof_debt")) document.getElementById("prof_debt").value = profile.debt;
  if (document.getElementById("scenarioType")) document.getElementById("scenarioType").value = profile.scenario;

  runSimulation();
}

/**
 * Deterministic 15-Year Life Trajectory Engine
 */
function runSimulation() {
  const age = parseInt(document.getElementById("prof_age")?.value) || 26;
  const initialSavings = parseFloat(document.getElementById("prof_savings")?.value) || 0;
  const monthlyIncome = parseFloat(document.getElementById("prof_income")?.value) || 0;
  const annualIncome = monthlyIncome * 12;
  const monthlyExpense = parseFloat(document.getElementById("prof_expenses")?.value) || 0;
  let annualExpense = monthlyExpense * 12;
  const insurance = parseFloat(document.getElementById("prof_insurance")?.value) || 0;
  const debt = parseFloat(document.getElementById("prof_debt")?.value) || 0;
  const scenario = document.getElementById("
