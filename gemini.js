(async () => {
  const data = await chrome.storage.local.get("pendingSummary");
  const pending = data.pendingSummary;
  if (!pending || !pending.url) return;

  // 30秒以上古ければ無視（別の用途で Gemini を開いたケース）
  if (Date.now() - pending.timestamp > 30000) {
    await chrome.storage.local.remove("pendingSummary");
    return;
  }
  await chrome.storage.local.remove("pendingSummary");

  const promptText =
    `次のYouTube動画を日本語で要約してください。\n` +
    `${pending.url}\n\n` +
    `出力フォーマット：\n` +
    `1. 動画タイトル / 主題\n` +
    `2. 要点（箇条書き・5〜8個）\n` +
    `3. 重要な数字・固有名詞があれば抽出\n` +
    `4. 結論・まとめ（2〜3行）\n\n` +
    `最後にこの動画の主張に対して、真偽を推測しその理由を述べてください。`;

  const input = await waitFor(findInput, 20000, 200);
  if (!input) {
    console.warn("[YT→Gemini] 入力欄が見つかりませんでした。");
    return;
  }

  insertPrompt(input, promptText);

  // 少し待ってから送信ボタンを押す（フレームワークが状態を反映するまで）
  await sleep(600);
  const sendBtn = findSendButton();
  if (sendBtn && !sendBtn.disabled && sendBtn.getAttribute("aria-disabled") !== "true") {
    sendBtn.click();
  }
})();

function findInput() {
  // Gemini の入力欄は <rich-textarea> 内の contenteditable
  return (
    document.querySelector('rich-textarea div[contenteditable="true"]') ||
    document.querySelector('div.ql-editor[contenteditable="true"]') ||
    document.querySelector('[role="textbox"][contenteditable="true"]')
  );
}

function findSendButton() {
  return (
    document.querySelector('button[aria-label*="送信"]') ||
    document.querySelector('button[aria-label*="Send message"]') ||
    document.querySelector('button[aria-label*="Send"]') ||
    document.querySelector('button.send-button')
  );
}

function insertPrompt(el, text) {
  el.focus();

  // 既存の内容を全選択
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // execCommand は非推奨だが contenteditable 上では今も最も確実で
  // Angular/Quill の変更検知を正しくトリガーできる
  const ok = document.execCommand("insertText", false, text);

  if (!ok) {
    // フォールバック：DOMを直接いじって input イベントを発火
    el.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = text;
    el.appendChild(p);
    el.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: text
      })
    );
  }
}

function waitFor(fn, timeout, interval) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      let result = null;
      try { result = fn(); } catch { }
      if (result) return resolve(result);
      if (Date.now() - start > timeout) return resolve(null);
      setTimeout(tick, interval);
    };
    tick();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
