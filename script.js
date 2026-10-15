
function calculateSimulation() {
  const students = Number(document.getElementById("students").value);
  const hours = Number(document.getElementById("hours").value);
  const lights = Number(document.getElementById("lights").value);
  const fans = Number(document.getElementById("fans").value);

  // Assumed power ratings for our simulation
  const lightPower = 20; // watts per light
  const fanPower = 75;   // watts per fan
  const ratePerUnit = 8; // assumed cost per kWh

  const totalPower =
    (lights * lightPower) + (fans * fanPower);

  const dailyEnergy = (totalPower * hours) / 1000;
  const dailyCost = dailyEnergy * ratePerUnit;

  document.getElementById("energyResult").textContent =
    dailyEnergy.toFixed(2) + " kWh";

  document.getElementById("costResult").textContent =
    "₹" + dailyCost.toFixed(2);

  document.getElementById("powerResult").textContent =
    totalPower + " W";

  document.getElementById("studentResult").textContent =
    students + " students";

  document.getElementById("resultMessage").textContent =
    "Simulation completed using the selected classroom settings.";
}
