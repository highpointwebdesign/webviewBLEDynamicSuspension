let roll = 0; // Initial roll angle
let pitch = 0; // Initial pitch angle
let rollHome = 0; // Home roll angle
let pitchHome = 0; // Home pitch angle
let usingMockData = true; // Flag to check if using mock data

// Update roll and pitch to show in the gauges
function updateRoll() {
  console.log('updateRoll init');
  const circle = document.getElementById('roll-circle');
  if (circle) {
    const adjustedRoll = roll - rollHome; // Adjust roll by home position
    circle.style.transform = `rotate(${adjustedRoll}deg)`;
    document.getElementById('roll-degree').innerText = `${Math.abs(adjustedRoll).toFixed(1)}°`;
  }
}

function updatePitch() {
  console.log('updatePitch init');
  const circle = document.getElementById('pitch-circle');
  if (circle) {
    const adjustedPitch = pitch - pitchHome; // Adjust pitch by home position
    circle.style.transform = `rotate(${adjustedPitch}deg)`;
    document.getElementById('pitch-degree').innerText = `${Math.abs(adjustedPitch).toFixed(1)}°`;
  }
}

// Simulated values for fallback
function simulateRoll() {
  roll = (Math.random() * 90 - 45); // Mock data between -45 and 45 degrees
  updateRoll();
}

function simulatePitch() {
  pitch = (Math.random() * 90 - 45); // Mock data between -45 and 45 degrees
  updatePitch();
}

// Set the current roll and pitch as the home (neutral) position
function resetGyroOrientation() {
  console.log('resetGyroOrientation clicked')
  rollHome = roll;
  pitchHome = pitch;
  console.log('Home position set:', { rollHome, pitchHome });
}

// Function to handle real device orientation
function handleDeviceOrientation(event) {
  roll = event.gamma || 0;  // 'gamma' is the left/right tilt in degrees
  pitch = event.beta || 0;  // 'beta' is the front/back tilt in degrees
  usingMockData = false; // Disable mock data as we are getting real sensor data
  updateRoll();
  updatePitch();
}

// Try to initialize the real device orientation
function initDeviceOrientation() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleDeviceOrientation);
  } else {
    console.log("Device orientation not supported.");
    startMockData(); // If not supported, use mock data
  }
}

// Start using mock data if the real sensor data isn't available
function startMockData() {
  console.log('using mock data');
  usingMockData = true;
  setInterval(simulateRoll, 1500); // Update roll every 1 second
  setInterval(simulatePitch, 1500); // Update pitch every 1 second
}

window.onload = function () {
  console.log('onload init pitchrollgauges.js')
  updateRoll();
  updatePitch();

  // Initialize device orientation or fall back to mock data
  initDeviceOrientation();

  // Set up the Reset Gyro Orientation button
  document.getElementById('resetGyro').addEventListener('click', resetGyroOrientation);

  console.log('pitch roll gauges script initialized');
};
