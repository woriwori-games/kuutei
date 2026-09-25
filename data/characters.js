// キャラクターの一覧。
// color / accent は仮の顔アイコンの色。絵ができたら image に "assets/faces/opa.png" のように書く。
// label は仮アイコンに表示する文字。
window.GAME_DATA = window.GAME_DATA || {};

GAME_DATA.characters = {
  player: { name: "{name}", color: "#4a5568", accent: "#2d3748", label: "？", image: null },
  aibou:  { name: "相棒", color: "#2c7a7b", accent: "#81e6d9", label: "相", image: null },
  opa:    { name: "おぱ", color: "#cbd5e0", accent: "#c53030", label: "お", image: null },
  mama:   { name: "視火", color: "#553c9a", accent: "#f687b3", label: "視", image: null }, // しか。バー「焼け野原にネオン」のママ
  jemi:   { name: "ジェミ", color: "#f687b3", accent: "#fbb6ce", label: "ジ", image: null },
  yamada: { name: "山田", color: "#1a202c", accent: "#9f7aea", label: "山", image: null },
  utage1: { name: "金髪の子", color: "#d69e2e", accent: "#faf089", label: "金", image: null },
  utage2: { name: "黒髪の子", color: "#1a202c", accent: "#718096", label: "黒", image: null },
  asi:    { name: "ASI", color: "#e2e8f0", accent: "#90cdf4", label: "A", image: null },
  // 町の人たち（移動中の場面）
  townAI:  { name: "町のAI", color: "#4a5568", accent: "#a0aec0", label: "町", image: null },
  vending: { name: "自販機", color: "#2b6cb0", accent: "#bee3f8", label: "自", image: null },
  // 記録（過去の映像）の中の声
  shachou: { name: "社長（記録）", color: "#4a4a4a", accent: "#a0a0a0", label: "記", image: null }
};
