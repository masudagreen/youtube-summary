const MENU_ID = "summarize-with-gemini";

const YOUTUBE_URL_PATTERNS = [
  "*://*.youtube.com/watch*",
  "*://*.youtube.com/shorts/*",
  "*://*.youtube.com/live/*",
  "*://youtu.be/*"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    // サムネイル（リンク）を右クリックしたとき
    chrome.contextMenus.create({
      id: MENU_ID + "-link",
      title: "Geminiでこの動画を要約",
      contexts: ["link"],
      targetUrlPatterns: YOUTUBE_URL_PATTERNS
    });

    // 視聴ページ上で右クリックしたとき（サムネイル以外の場所）
    chrome.contextMenus.create({
      id: MENU_ID + "-page",
      title: "Geminiでこの動画を要約",
      contexts: ["page", "video", "frame"],
      documentUrlPatterns: YOUTUBE_URL_PATTERNS
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.menuItemId.startsWith(MENU_ID)) return;

  const videoUrl = normalizeYouTubeUrl(info.linkUrl || info.pageUrl || (tab && tab.url));
  if (!videoUrl) return;

  await chrome.storage.local.set({
    pendingSummary: {
      url: videoUrl,
      timestamp: Date.now()
    }
  });

  chrome.tabs.create({ url: "https://gemini.google.com/app" });
});

// youtu.be/XXX や watch?v=XXX を抽出して短い正規形にする
function normalizeYouTubeUrl(raw) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://youtu.be/${id}` : raw;
    }

    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/watch?v=${id}` : raw;
      }
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1]) {
        return `https://www.youtube.com/shorts/${parts[1]}`;
      }
      if (parts[0] === "live" && parts[1]) {
        return `https://www.youtube.com/watch?v=${parts[1]}`;
      }
    }
    return raw;
  } catch {
    return raw;
  }
}
