
function calculateSimulation() {
  const studentsInput = document.getElementById("students");
  const hoursInput = document.getElementById("hours");
  const lightsInput = document.getElementById("lights");
  const fansInput = document.getElementById("fans");

  const students = Number(studentsInput.value);
  const hours = Number(hoursInput.value);
  const lights = Number(lightsInput.value);
  const fans = Number(fansInput.value);

  const inputs = [
    { element: studentsInput, value: students, min: 0, max: 200, name: "Students" },
    { element: hoursInput, value: hours, min: 0, max: 24, name: "Operating hours" },
    { element: lightsInput, value: lights, min: 0, max: 100, name: "Lights" },
    { element: fansInput, value: fans, min: 0, max: 100, name: "Fans" }
  ];

  for (const input of inputs) {
    if (
      input.element.value.trim() === "" ||
      !Number.isFinite(input.value) ||
      input.value < input.min ||
      input.value > input.max
    ) {
      alert(
        input.name + " must be between " +
        input.min + " and " + input.max + "."
      );
      input.element.focus();
      return;
    }
  }

  if (
    !Number.isInteger(students) ||
    !Number.isInteger(lights) ||
    !Number.isInteger(fans)
  ) {
    alert("Students, lights, and fans must be whole numbers.");
    return;
  }

  const lightPower = 20;
  const fanPower = 75;
  const ratePerUnit = 8;

  const totalPower = (lights * lightPower) + (fans * fanPower);
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
