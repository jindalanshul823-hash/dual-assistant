// ✅ Always point frontend to the backend running on the same origin (no hardcoded port!)
const API_URL = `${window.location.origin}/api/chat`;

async function sendMessage(messages, style) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, style })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "No response received.";
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return "Error: " + error.message;
  }
}

// Example usage in your button handler
document.getElementById('askBtn').addEventListener('click', async () => {
  const userInput = document.getElementById('userInput').value;

  if (!userInput.trim()) return;

  const analyticalMessages = [
    { role: "system", content: "You are Analytical AI. Provide logical, data-driven analysis." },
    { role: "user", content: userInput }
  ];

  const creativeMessages = [
    { role: "system", content: "You are Creative AI. Provide imaginative, out-of-the-box ideas." },
    { role: "user", content: userInput }
  ];

  // Update UI with loading state
  document.getElementById('analyticalResponse').innerText = "⏳ Thinking...";
  document.getElementById('creativeResponse').innerText = "⏳ Thinking...";

  // Ask both assistants
  const [analyticalResponse, creativeResponse] = await Promise.all([
    sendMessage(analyticalMessages, "analytical"),
    sendMessage(creativeMessages, "creative")
  ]);

  // Show responses
  document.getElementById('analyticalResponse').innerText = analyticalResponse;
  document.getElementById('creativeResponse').innerText = creativeResponse;
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('userInput').value = "";
  document.getElementById('analyticalResponse').innerText = "";
  document.getElementById('creativeResponse').innerText = "";
});
