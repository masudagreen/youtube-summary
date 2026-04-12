# YouTube → Gemini 要約 Chrome拡張

YouTubeの動画サムネイルを右クリックするだけで、Gemini（Google）のウェブUIに要約プロンプトを自動入力するChrome拡張機能です。

**APIは使用しません。** Geminiのウェブページを開き、プロンプトを直接入力・送信します。

## 機能

- YouTubeのサムネイル（リンク）を右クリック → 「Geminiでこの動画を要約」メニューが表示
- YouTube視聴ページ上で右クリックしても同じメニューが利用可能
- Geminiが新しいタブで開き、以下のフォーマットで要約プロンプトが自動入力・送信される：
  1. 動画タイトル / 主題
  2. 要点（箇条書き・5〜8個）
  3. 重要な数字・固有名詞の抽出
  4. 結論・まとめ
- `youtube.com/watch`、`youtube.com/shorts`、`youtube.com/live`、`youtu.be` 短縮URLに対応

## 導入方法（Brave / Chrome）

1. このリポジトリをクローン、またはZIPでダウンロードして展開する
   ```
   git clone https://github.com/masudagreen/youtube-summary.git
   ```
2. ブラウザのアドレスバーに以下を入力して拡張機能の管理ページを開く
   - **Brave**: `brave://extensions`
   - **Chrome**: `chrome://extensions`
3. 右上の **デベロッパーモード** をONにする
4. **「パッケージ化されていない拡張機能を読み込む」** をクリック
5. クローン（展開）したフォルダを選択
6. Gemini（https://gemini.google.com ）にログイン済みであることを確認する

## 使い方

1. YouTubeのホーム・検索結果・チャンネルページなどでサムネイルを **右クリック**
2. コンテキストメニューから **「Geminiでこの動画を要約」** を選択
3. 新しいタブでGeminiが開き、プロンプトが自動入力・送信される

> 視聴ページ（`/watch?v=...`）上で右クリックしても同様に利用できます。

## カスタマイズ

### 自動送信をOFFにする

デフォルトではプロンプト入力後に自動で送信ボタンが押されます。入力だけにしたい場合は `gemini.js` の以下の部分をコメントアウトしてください：

```js
// await sleep(600);
// const sendBtn = findSendButton();
// if (sendBtn && !sendBtn.disabled && sendBtn.getAttribute("aria-disabled") !== "true") {
//   sendBtn.click();
// }
```

### プロンプトを変更する

`gemini.js` 内の `promptText` を編集してください。

## 注意事項

- **Gemini側の仕様に依存します。** GeminiのDOM構造が変更された場合、入力欄の検出（`findInput()`）や送信ボタンの検出（`findSendButton()`）が動作しなくなる可能性があります。その場合はセレクタを修正してください。
- **動画内容の取得はGemini側の能力に依存します。** URLを渡してもGeminiが動画の中身を取得できない場合があります。プロンプトにはフォールバック指示（タイトル・説明・字幕からの推測）を含めています。

## ファイル構成

```
├── manifest.json   # 拡張機能マニフェスト（Manifest V3）
├── background.js   # Service Worker：右クリックメニュー登録・URLの受け渡し
├── gemini.js       # Content Script：Geminiページへのプロンプト入力・送信
└── README.md
```

## ライセンス

MIT
