// Saves options to chrome.storage
const saveOptions = () => {
  const apiUrl = document.getElementById("apiUrl").value;

  chrome.storage.local.set({ apiUrl: apiUrl }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.local.get(
    { apiUrl: "http://127.0.0.1:1234/v1/chat/completions" },
    (items) => {
      document.getElementById("apiUrl").value = items.apiUrl;
    }
  );
};

const testConnection = async () => {
  const apiUrl = document.getElementById("apiUrl").value;
  const status = document.getElementById("status");
  status.textContent = "Testing connection...";
  status.style.color = "blue";

  try {
    // Attempt a simple GET request or a dummy POST to check connectivity
    // LM Studio usually supports GET /v1/models, but we can try the chat endpoint with a dummy payload or just check if it's reachable.
    // Since we only know the chat endpoint, let's try a minimal POST.
    const payload = {
      model: "local-model",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      status.textContent = "Connection successful!";
      status.style.color = "green";
    } else {
      status.textContent = `Connection failed: ${response.status} ${response.statusText}`;
      status.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    status.textContent = `Connection error: ${err.message}`;
    status.style.color = "red";
  }
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
document.getElementById("test").addEventListener("click", testConnection);
