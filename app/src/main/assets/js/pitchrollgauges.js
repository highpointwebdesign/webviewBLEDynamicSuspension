let roll = 0; // Initial roll angle (left and right)
let pitch = 0; // Initial pitch angle (up and down)

function createLines(containerId) {
  const lineContainer = document.getElementById(containerId);
  if (!lineContainer) {
    console.error(`Element with ID '${containerId}' not found.`);
    return;
  }
  for (let i = 5; i <= 90; i += 5) {
    createLine(lineContainer, i);
    createLine(lineContainer, -i);
  }
}

function createLine(container, angle) {
  const line = document.createElement('div');
  line.className = 'line';
  line.style.transform = `translateX(-25%) rotate(${angle}deg)`;
  container.appendChild(line);
}

function updateRoll() {
  const circle = document.getElementById('roll-circle');
  if (circle) {
    circle.style.transform = `rotate(${roll}deg)`;
    document.getElementById('roll-degree').innerText = `${Math.abs(roll).toFixed(1)}°`;
  }
}

function updatePitch() {
  const circle = document.getElementById('pitch-circle');
  if (circle) {
    circle.style.transform = `rotate(${pitch}deg)`;
    document.getElementById('pitch-degree').innerText = `${Math.abs(pitch).toFixed(1)}°`;
  }
}

// Function to handle real device orientation data
function handleOrientation(event) {
  pitch = event.beta;  // Between -180 and 180 degrees
  roll = event.gamma;  // Between -90 and 90 degrees
  
  // Log the values to the console for debugging
  console.log(`Device Pitch: ${pitch}, Device Roll: ${roll}`);
  
  // Update the UI with the real sensor data
  updatePitch();
  updateRoll();
}

// Check if the browser supports DeviceOrientation API and request permission if needed (on iOS)
function initDeviceOrientation() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      })
      .catch(console.error);
      alert(console.error);
  } else {
    // For other browsers that don't require permission
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

// Simulated values (in case the device does not support the DeviceOrientation API)
function simulateRoll() {
  roll = (Math.random() * 90 - 45); // Mock data: roll between -45 and 45 degrees
  updateRoll();
}

function simulatePitch() {
  pitch = (Math.random() * 90 - 45); // Mock data: pitch between -45 and 45 degrees
  updatePitch();
}

window.onload = function() {
  updateRoll();
  updatePitch();
  
  // Try to initialize the real device orientation if available
  initDeviceOrientation();
  
  // Fall back to simulated values if device orientation is not available or denied
  setInterval(simulateRoll, 500); // Update roll every 0.5 second
  setInterval(simulatePitch, 500); // Update pitch every 0.5 second

  console.log('pitch roll gauges script initialized');
};
