# CueSheetCreator

CueSheetCreator は、イベント進行表や照明・音響向けのキューシートをブラウザだけで作成・編集・印刷できる、ビルド不要のローカル Web アプリです。

## Current Status

- このリポジトリは Git 管理を開始した状態に整理済みです。
- `css/print.css` は現在 `@page { size: A4 portrait; }` になっており、印刷プレビューと PDF 保存は縦向き前提です。
- ただし `v1` / `v1.1` のタグやリリースノートはまだ無いため、履歴上は「どのコミットが v1.1 か」を厳密には判別できません。

## Structure

```text
.
├── index.html
├── css/
├── js/
├── docs/
└── cuesheets/
```

## Usage

1. ブラウザで `index.html` を開きます。
2. 編集内容はブラウザの `localStorage` に自動保存されます。
3. チーム共有やバックアップ時は右上の「エクスポート」から `.cuesheet` を保存します。

## Local Export Directory

リポジトリ直下の `cuesheets/` は、各開発者がローカルで書き出した `.cuesheet` を置くための既定ディレクトリです。

- `cuesheets/` 自体は共有のため残します。
- 中身の `.cuesheet` は `.gitignore` で除外しています。
- fork した各自が同じ場所を使えるようにしています。
- ブラウザから保存する都合上、保存先フォルダをアプリ側で強制はできません。書き出し時に `cuesheets/` を選ぶ運用を想定しています。

## Versioning Notes

現状確認できた範囲では、現行の印刷設定は以下に反映されています。

- `css/print.css`: `A4 portrait`
- `index.html`: 印刷説明に縦向きの案内あり
- `docs/ARCHITECTURE.md`: 印刷最適化の記述あり

過去の `v1` / `v1.1` に対する厳密な対応関係はタグなしでは断定できませんが、少なくとも現行ワークツリーの印刷設定は縦向きに更新済みです。

## Git Remote

この時点では `origin` は未設定です。GitHub 上の作成先が決まれば `origin` を追加して push できます。
