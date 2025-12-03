document.addEventListener('DOMContentLoaded', () => {
  const selectedTextEl = document.getElementById('selectedText');
  const resultEl = document.getElementById('result');
  const generateBtn = document.getElementById('generateBtn');
  const statusEl = document.getElementById('status');

  // Function to get selected text from the active tab
  const getSelectedText = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      statusEl.textContent = "No active tab found.";
      return;
    }

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      if (results && results[0] && results[0].result) {
        selectedTextEl.textContent = results[0].result;
        generateBtn.disabled = false;
      } else {
        selectedTextEl.textContent = "";
        statusEl.textContent = "文章が選択されていません。";
        generateBtn.disabled = true;
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error accessing tab.";
    }
  };

  // Initial call to get text
  getSelectedText();

  // Generate button click handler
  generateBtn.addEventListener('click', async () => {
    const text = selectedTextEl.textContent;
    if (!text) return;

    statusEl.textContent = "Generating...";
    resultEl.textContent = "";
    generateBtn.disabled = true;

    try {
      // Get API URL from storage
      const items = await chrome.storage.local.get({ apiUrl: 'http://127.0.0.1:1234/v1/chat/completions' });
      const apiUrl = items.apiUrl;

      // Construct payload
      const payload = {
        model: "local-model",
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `
次の文章に関連するハッシュタグを5個生成してください。
ハッシュタグだけを半角スペース区切りで出力してください。

文章:
${text}
`
          }
        ]
      };

      // Send request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const result = json.choices?.[0]?.message?.content ?? "";

      // Display result
      resultEl.textContent = result;
      statusEl.textContent = "";

    } catch (err) {
      console.error(err);
      statusEl.textContent = "LM Studio に接続できません。アドレス設定を確認してください。";
    } finally {
      generateBtn.disabled = false;
    }
  });
});
