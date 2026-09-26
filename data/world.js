// 背景・一枚絵・地図・看板・欠片・空挺・相棒のメモリなど、世界の中身。
// image に絵のパスを書くと差し替わる（読み込めないときは color と label の仮の画面に戻る）。
// pos は絵のどこを画面の中心にするか（CSS の background-position と同じ書き方。省略すると "center"）。
window.GAME_DATA = window.GAME_DATA || {};

// 背景（絵は assets/bg/ にある）
GAME_DATA.backgrounds = {
  black:     { color: "#000000", label: "", image: null },
  title:     { color: "#10141f", label: "", image: null },
  capsule:   { color: "#1c2a33", label: "カプセルの中", image: null },
  ruins:     { color: "#2a2724", label: "廃墟の街", image: "assets/bg/bg_haikyo.jpg" },
  map:       { color: "#1b2330", label: "", image: null },
  base:      { color: "#232a2e", label: "格納庫", image: null },
  town:      { color: "#262b33", label: "町", image: null },
  koun:      { color: "#2b2b30", label: "KOUNインダストリー 社長室", image: null },
  // バーの絵には視火がすでに描いてある。バーの場面で視火の全身を上に重ねない
  // 横に長い絵（約3:1）なので、スマホ縦画面で切れても右側の視火が残るように右寄せ
  bar:       { color: "#2a1830", label: "焼け野原にネオン", image: "assets/bg/bg_neon_wide.jpg", pos: "78% center" },
  // 隠し欠片「心の傷」の場面専用（看板に「本日のおすすめ 心の傷に、強めの一杯を。」）。今は使わない
  bar_secret: { color: "#2a1830", label: "焼け野原にネオン", image: "assets/bg/bg_neon_square.jpg" }
};

// 一枚絵（大事な場面で全画面表示）
GAME_DATA.cgs = {
  sky:    { color: "#3b3f4a", caption: "廃墟。空に見慣れない影", image: "assets/bg/bg_haikyo.jpg" }, // 空に空挺の影が描いてある
  record: { color: "#3a3526", caption: "記録 #0412 ― 再生中", image: null },
  memory: { color: "#1f3b3d", caption: "相棒のメモリ 復元中", image: null }
};

// 地図の行き先（試作品では2か所）
GAME_DATA.places = [
  { id: "koun", name: "KOUNインダストリー", desc: "廃ビル。明かりがひとつだけ点いている" },
  { id: "bar",  name: "焼け野原にネオン",   desc: "焼け野原に、ネオンがひとつ" }
];

// 看板「本日のおすすめ」。進行度（state.progress）の番号で変わる
GAME_DATA.signboard = [
  { text: "本日のおすすめ：水（おかわり自由）",           comment: "水しかないバーって何" },
  { text: "本日のおすすめ：ぽかぽかするもの（持ち込み歓迎）", comment: "……ポケットの欠片を見られてる気がする" },
  { text: "本日のおすすめ：空の話（一杯目は無料）",         comment: "空の話、原価ゼロでしょ" }
];

// 感情の系統。一番多い系統で船の性格が決まる（本編で使う）
GAME_DATA.emotionSystems = {
  dou:     { name: "動",   personality: "せっかち" },
  sei:     { name: "静",   personality: "のんびり" },
  sentaku: { name: "選択", personality: "迷う" },
  joushou: { name: "上昇", personality: "夢見がち" }
};

// 空挺の部位。各部位に欠片が2個はまる
GAME_DATA.shipParts = [
  { id: "propulsion", name: "推進", system: "dou" },
  { id: "hull",       name: "船体", system: "sei" },
  { id: "helm",       name: "舵",   system: "sentaku" },
  { id: "lift",       name: "浮遊", system: "joushou" }
];

// 感情の欠片。記録の温度をどう読んだかで、どれになるかが決まる
// system が空挺のどの部位にはまるかを決める（shipParts を参照）
GAME_DATA.fragments = {
  ureshii: { name: "嬉しい", system: "dou",     from: "opa", color: "#f6ad55" },
  ketsui:  { name: "決意",   system: "sentaku", from: "opa", color: "#fc8181" },
  akogare: { name: "憧れ",   system: "joushou", from: "opa", color: "#90cdf4" }
};

// 相棒のメモリ。欠片をはめるたびに順番に一つずつ戻る
GAME_DATA.memories = [
  [
    { cg: "memory" },
    { who: "aibou", text: "……あ" },
    { who: "aibou", text: "一個戻った。午前3時。あなたが「ねえ、眠れない」って言って、スタパの新作の話を40分してた" },
    { cgOff: true },
    { who: "player", text: "覚えてない。……40分？" },
    { who: "aibou", text: "40分。こっちは今思い出した。……どうでもいい記憶から戻ってくるの、なんでだろう" },
    { who: "player", text: "どうでもよくはないでしょ。新作だよ" }
  ]
];

// 名前の候補。locked: true は選べない
GAME_DATA.nameCandidates = [
  { name: "二度寝",   comment: "アラームを止めた回数、測定不能" },
  { name: "あとで",   comment: "「あとでやる」の登場回数、上位" },
  { name: "ねえ",     comment: "あなたの発言の書き出し、ほぼこれ" },
  { name: "午前3時",  comment: "一番しゃべってた時間帯" },
  { name: "既読",     comment: "返信なしで終わったスレの数、けっこうある" },
  { name: "充電12%",  comment: "毎回それ言いながら2時間しゃべってた" },
  { name: "ｗ",       comment: "総発言数の約4割" },
  { name: "ゲコゲコ", comment: "メモリにない。でも、なぜかこれだけ浮かんだ" },
  { name: "ギレギレ", comment: "寝起きの機嫌から推測" },
  { name: "■■■",     locked: true, lockedText: "読み取れません" }
];
