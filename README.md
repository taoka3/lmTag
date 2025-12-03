# Chrome拡張機能「LMTAG」仕様書

## 1. 概要

**LMTAG** はローカル LLM「LM Studio」と連携し、X（旧Twitter）上で選択した文章から自動的にハッシュタグを生成する Chrome 拡張機能である。
API リクエストフォーマットや生成プロンプトは **拡張機能側がコードとして保持する**。
LM Studio のエンドポイント URL のみオプション画面で変更可能とする。

---

## 2. 利用目的

* X 上の文章から即時に関連性の高いハッシュタグ生成
* ローカル LLM を活用した高速・安全な処理
* API の仕様変更に影響されない、拡張側が制御する固定フォーマット

---

## 3. 主要機能

### 3.1 選択テキスト取得

* Xの画面で選択したテキストを取得する。
* 選択が無い場合はエラー表示。

### 3.2 ハッシュタグ生成

* 拡張機能側で以下の **固定プロンプト** を使用して LM Studio へ問い合わせる：

```
次の文章に関連するハッシュタグを5個生成してください。
ハッシュタグだけを半角スペース区切りで出力してください。

文章:
{{selected_text}}
```

* 拡張機能内で送信する **API JSON フォーマット（固定仕様）**：

```json
{
  "model": "local-model",
  "temperature": 0.7,
  "messages": [
    {
      "role": "user",
      "content": "（上記プロンプト + 選択文）"
    }
  ]
}
```

※記載の JSON は拡張側で保持し、変更はコード修正以外で不可。
※ユーザーはエンドポイント URL のみ変更可。

---

## 4. 拡張アイコン操作

* Chrome toolbar のアイコンをクリック → popup を表示
* popup 内の「タグ発行」ボタン押下で処理開始
* LM Studio に送信 → 結果をポップアップに表示

---

## 5. オプション画面（options.html）

### 5.1 ユーザーが変更可能な項目

| 項目                | 内容                                                 |
| ----------------- | -------------------------------------------------- |
| LM Studio API URL | デフォルト値：`http://127.0.0.1:1234/v1/chat/completions` |

### 5.2 保存方法

* `chrome.storage.sync` または `chrome.storage.local`
* 拡張再起動後も保持

---

## 6. API 通信仕様（拡張コードに内包）

### 6.1 デフォルト API URL

`http://127.0.0.1:1234/v1/chat/completions`

### 6.2 リクエスト構造（固定）

拡張機能のJS内に以下の形式で保持：

```javascript
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
${selectedText}
`
    }
  ]
};
```

### 6.3 リクエスト送信コード（固定）

```javascript
const response = await fetch(apiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
```

※ユーザー側で書き換え不可（エンドポイント URL 以外は固定）

### 6.4 レスポンス解析（固定）

返却 JSON の `choices[0].message.content` を取得：

```javascript
const json = await response.json();
const result = json.choices?.[0]?.message?.content ?? "";
```

* タグ形式でない場合の整形や補正ロジックも拡張側のコードに内包する。

---

## 7. 画面仕様

### 7.1 popup.html

| 項目       | 説明                           |
| -------- | ---------------------------- |
| 選択テキスト表示 | 選択文をそのまま表示                   |
| 生成ボタン    | 「タグ発行」                       |
| 結果欄      | ハッシュタグ一覧を表示。クリックでコピー可能にする案あり |

---

## 8. エラーハンドリング

| 状況              | 表示メッセージ                               |
| --------------- | ------------------------------------- |
| テキスト未選択         | 「文章が選択されていません。」                       |
| LM Studio へ接続失敗 | 「LM Studio に接続できません。アドレス設定を確認してください。」 |
| レスポンス不正         | 「タグ生成に失敗しました。」                        |

---

## 9. ファイル構成

```
/LMTAG
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── options.html
├── options.js
└── styles.css
```

---

## 10. 動作フロー

1. ユーザーが X 上で文章を選択
2. 拡張アイコンをクリック
3. popup が開く
4. 「タグ発行」クリック
5. 拡張内部の固定 API 仕様で LM Studio へ POST
6. ハッシュタグ生成
7. popup に表示
8. ユーザーがコピー・利用

