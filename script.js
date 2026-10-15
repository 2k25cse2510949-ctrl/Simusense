
const RATE_PER_UNIT = 8;

const SCENARIOS = {
  classroom: {
    title: "Classroom Energy Simulator",
    description: "Estimate electricity usage for a classroom.",
    message: "Adjust the classroom settings and run your simulation."
  },
  home: {
    title: "Home Energy Simulator",
    description: "Estimate electricity usage for household equipment.",
    message: "Adjust the household settings and run your simulation."
  },
  computerLab: {
    title: "Computer Lab Simulator",
    description: "Estimate energy consumption in a computer lab.",
    message: "Adjust the lab settings and run your simulation."
  },
  custom: {
    title: "Custom Energy Simulator",
    description: "Create a simple simulation using your own equipment.",
    message: "Enter your equipment power and usage hours."
  }
};

let currentScenario = "classroom";

function selectScenario() {
  const selector = document.getElementById("scenario");
  const scenario = selector.value;

  if (!SCENARIOS[scenario]) {
    alert("Please select a valid scenario.");
    return;
  }

  currentScenario = scenario;

  document.getElementById("scenarioDescription").textContent =
    SCENARIOS[scenario].description;

  document.getElementById("workspaceTitle").textContent =
    SCENARIOS[scenario].title;

  document.getElementById("workspaceMessage").textContent =
    SCENARIOS[scenario].message;

  const workspace = document.getElementById("scenarioWorkspace");

  if (scenario === "classroom") {
    workspace.innerHTML = `
      <div class="controls">
        <label for="students">Number of students</label>
        <input type="number" id="students" min="0" max="200" value="40">

        <label for="hours">Operating hours per day</label>
        <input type="number" id="hours" min="0" max="24"
          value="8" step="0.5">

        <label for="lights">Number of lights</label>
        <input type="number" id="lights" min="0" max="100" value="10">

        <label for="fans">Number of fans</label>
        <input type="number" id="fans" min="0" max="100" value="8">

        <button type="button" onclick="calculateSimulation()">
          Run Simulation
        </button>
      </div>`;
  } else if (scenario === "home") {
    workspace.innerHTML = `
      <div class="controls">
        <label for="lights">Number of lights (20 W each)</label>
        <input type="number" id="lights" min="0" max="100" value="6">

        <label for="fans">Number of fans (75 W each)</label>
        <input type="number" id="fans" min="0" max="100" value="3">

        <label for="appliances">Other appliances (100 W each)</label>
        <input type="number" id="appliances" min="0" max="100" value="4">

        <label for="hours">Average usage hours per day</label>
        <input type="number" id="hours" min="0" max="24"
          value="6" step="0.5">

        <button type="button" onclick="calculateSimulation()">
          Run Simulation
        </button>
      </div>`;
  } else if (scenario === "computerLab") {
    workspace.innerHTML = `
      <div class="controls">
        <label for="computers">Number of computers (200 W each)</label>
        <input type="number" id="computers" min="0" max="200" value="30">

        <label for="lights">Number of lights (20 W each)</label>
        <input type="number" id="lights" min="0" max="100" value="10">

        <label for="fans">Number of fans (75 W each)</label>
        <input type="number" id="fans" min="0" max="100" value="8">

        <label for="hours">Operating hours per day</label>
        <input type="number" id="hours" min="0" max="24"
          value="6" step="0.5">

        <button type="button" onclick="calculateSimulation()">
          Run Simulation
        </button>
      </div>`;
  } else {
    workspace.innerHTML = `
      <div class="controls">
        <label for="customQuantity">Number of equipment units</label>
        <input type="number" id="customQuantity"
          min="0" max="500" value="5">

        <label for="customPower">Power per unit (watts)</label>
        <input type="number" id="customPower"
          min="0" max="10000" value="100">

        <label for="hours">Usage hours per day</label>
        <input type="number" id="hours" min="0" max="24"
          value="5" step="0.5">

        <button type="button" onclick="calculateSimulation()">
          Run Simulation
        </button>
      </div>`;
  }

  resetResults();

  document.getElementById("resultMessage").textContent =
    "Ready to simulate " + SCENARIOS[scenario].title + ".";

  workspace.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

function getNumber(id, label, min, max, wholeNumber = false) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error("Missing input: " + label);
  }

  const value = Number(element.value);

  if (
    element.value.trim() === "" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    element.focus();
    throw new Error(
      label + " must be between " + min + " and " + max + "."
    );
  }

  if (wholeNumber && !Number.isInteger(value)) {
    element.focus();
    throw new Error(label + " must be a whole number.");
  }

  return value;
}

function calculateSimulation() {
  try {
    let totalPower = 0;
    let occupancy = "Not applicable";
    let hours;

    if (currentScenario === "classroom") {
      const students = getNumber("students", "Students", 0, 200, true);
      const lights = getNumber("lights", "Lights", 0, 100, true);
      const fans = getNumber("fans", "Fans", 0, 100, true);
      hours = getNumber("hours", "Operating hours", 0, 24);

      totalPower = lights * 20 + fans * 75;
      occupancy = students + " students";

    } else if (currentScenario === "home") {
      const lights = getNumber("lights", "Lights", 0, 100, true);
      const fans = getNumber("fans", "Fans", 0, 100, true);
      const appliances = getNumber(
        "appliances", "Other appliances", 0, 100, true
      );
      hours = getNumber("hours", "Usage hours", 0, 24);

      totalPower = lights * 20 + fans * 75 + appliances * 100;

    } else if (currentScenario === "computerLab") {
      const computers = getNumber(
        "computers", "Computers", 0, 200, true
      );
      const lights = getNumber("lights", "Lights", 0, 100, true);
      const fans = getNumber("fans", "Fans", 0, 100, true);
      hours = getNumber("hours", "Operating hours", 0, 24);

      totalPower = computers * 200 + lights * 20 + fans * 75;

    } else if (currentScenario === "custom") {
      const quantity = getNumber(
        "customQuantity", "Equipment units", 0, 500, true
      );
      const power = getNumber(
        "customPower", "Power per unit", 0, 10000
      );
      hours = getNumber("hours", "Usage hours", 0, 24);

      totalPower = quantity * power;
    }

    const dailyEnergy = (totalPower * hours) / 1000;
    const dailyCost = dailyEnergy * RATE_PER_UNIT;

    document.getElementById("powerResult").textContent =
      totalPower.toFixed(2).replace(/\.00$/, "") + " W";

    document.getElementById("energyResult").textContent =
      dailyEnergy.toFixed(2) + " kWh";

    document.getElementById("costResult").textContent =
      "₹" + dailyCost.toFixed(2);

    document.getElementById("studentResult").textContent = occupancy;

    document.getElementById("resultMessage").textContent =
      "Simulation completed for " + SCENARIOS[currentScenario].title +
      ". Estimates use assumed equipment power ratings and ₹" +
      RATE_PER_UNIT + " per kWh.";

  } catch (error) {
    alert(error.message);
  }
}

function resetResults() {
  document.getElementById("powerResult").textContent = "—";
  document.getElementById("energyResult").textContent = "—";
  document.getElementById("costResult").textContent = "—";
  document.getElementById("studentResult").textContent = "—";
}

document.addEventListener("DOMContentLoaded", function () {
  const selector = document.getElementById("scenario");

  if (selector) {
    selector.addEventListener("change", function () {
      document.getElementById("scenarioDescription").textContent =
        SCENARIOS[selector.value]?.description || "";
    });
  }
});
