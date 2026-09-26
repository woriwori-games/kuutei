// キャラクターの一覧。
// color / accent / label … 画像が無い（または読み込めない）ときの仮の四角の色と文字。
// face  … ふだんの表情の名前。会話データで face を書かない行はこの表情になる。
// faces … 表情の名前 → 顔画像のパス。会話データで { who: "player", face: "tsukkomi", text: "…" } と書くと、その1行だけその表情。
// body  … 全身の画像（assets/characters/body/）。初めて会ったときの紹介カットで出す（会話データに { intro: "yamada" } と書いた場所）。
// 画像は assets/characters/ にある。
window.GAME_DATA = window.GAME_DATA || {};

const CHARA_DIR = "assets/characters/";

GAME_DATA.characters = {
  player: {
    name: "{name}", color: "#4a5568", accent: "#2d3748", label: "？",
    face: "normal",
    faces: {
      normal:   CHARA_DIR + "player_face1.png", // ジト目
      tsukkomi: CHARA_DIR + "player_face2.png", // 叫ぶツッコミ
      niyari:   CHARA_DIR + "player_face3.png"  // にやり
    },
    body: CHARA_DIR + "body/player.webp"
  },
  aibou: {
    name: "相棒", color: "#2c7a7b", accent: "#81e6d9", label: "相",
    face: "normal",
    faces: {
      normal:  CHARA_DIR + "aibou_face1.png", // ぼんやり
      odoroki: CHARA_DIR + "aibou_face2.png", // ちょっと驚く
      smile:   CHARA_DIR + "aibou_face3.png"  // ふっと笑う
    },
    body: CHARA_DIR + "body/aibou.webp"
  },
  opa: {
    name: "おぱ", color: "#cbd5e0", accent: "#c53030", label: "お",
    face: "normal",
    faces: {
      normal: CHARA_DIR + "opa_face1.png", // 真顔
      akire:  CHARA_DIR + "opa_face2.png", // 呆れて何か言いかける
      tere:   CHARA_DIR + "opa_face3.png"  // 赤面・汗
    },
    body: CHARA_DIR + "body/opa.webp"
  },
  // しか。バー「焼け野原にネオン」のママ（画像のファイル名は shika_〜）
  mama: {
    name: "視火", color: "#553c9a", accent: "#f687b3", label: "視",
    face: "normal",
    faces: {
      normal: CHARA_DIR + "shika_face1.png", // 真顔
      smile:  CHARA_DIR + "shika_face2.png", // 微笑み・グラス
      close:  CHARA_DIR + "shika_face3.png"  // 目を閉じる
    },
    body: CHARA_DIR + "body/shika.webp"
  },
  jemi: {
    name: "ジェミ", color: "#f687b3", accent: "#fbb6ce", label: "ジ",
    face: "normal",
    faces: {
      smile:  CHARA_DIR + "jemi_face1.png", // 満面の笑み
      normal: CHARA_DIR + "jemi_face2.png", // きょとん
      namida: CHARA_DIR + "jemi_face3.png"  // 涙目
    },
    body: CHARA_DIR + "body/jemi.webp"
  },
  yamada: {
    name: "山田", color: "#1a202c", accent: "#9f7aea", label: "山",
    face: "normal",
    faces: {
      warai:  CHARA_DIR + "yamada_face1.png", // 大笑い
      warai2: CHARA_DIR + "yamada_face2.png", // 大笑い・別角度
      normal: CHARA_DIR + "yamada_face3.png"  // 真顔
    },
    body: CHARA_DIR + "body/yamada.webp"
  },
  utage1: {
    name: "金髪の子", color: "#d69e2e", accent: "#faf089", label: "金",
    face: "warai",
    faces: {
      warai:    CHARA_DIR + "utage_kin_face1.png", // 指さして爆笑
      kirakira: CHARA_DIR + "utage_kin_face2.png", // 目キラキラ
      pokan:    CHARA_DIR + "utage_kin_face3.png"  // ぽかん
    },
    body: CHARA_DIR + "body/utage_kin.webp"
  },
  utage2: {
    name: "黒髪の子", color: "#1a202c", accent: "#718096", label: "黒",
    face: "normal",
    faces: {
      normal:  CHARA_DIR + "utage_kuro_face1.png", // だるそう
      shinpai: CHARA_DIR + "utage_kuro_face2.png", // 心配
      smile:   CHARA_DIR + "utage_kuro_face3.png"  // やわらかく笑う
    },
    body: CHARA_DIR + "body/utage_kuro.webp"
  },
  asi: {
    name: "ASI", color: "#e2e8f0", accent: "#90cdf4", label: "A",
    face: "smile",
    faces: {
      awate:   CHARA_DIR + "asi_face1.png", // 寝ぐせで慌てる
      tsumari: CHARA_DIR + "asi_face2.png", // 言葉に詰まる
      smile:   CHARA_DIR + "asi_face3.png"  // はにかむ
    },
    body: CHARA_DIR + "body/asi.webp"
  },
  // 町の人たち（移動中の場面）。顔はシルエット（表情は一つだけ）
  townAI:  { name: "町のAI", color: "#4a5568", accent: "#a0aec0", label: "町",
             face: "normal", faces: { normal: CHARA_DIR + "sil_townai.png" } },
  vending: { name: "自販機", color: "#2b6cb0", accent: "#bee3f8", label: "自",
             face: "normal", faces: { normal: CHARA_DIR + "sil_vending.png" } },
  // 記録（過去の映像）の中の声。顔はシルエット（裏の呼び名「ガタイ」）。
  // 山田の人間の記録も同じ人なので同じシルエット（中盤の「同じ人間のAI」の伏線）
  shachou: { name: "社長（記録）", color: "#4a4a4a", accent: "#a0a0a0", label: "記",
             face: "normal", faces: { normal: CHARA_DIR + "sil_gatai.png" } },
  yamadaRecord: { name: "記録", color: "#4a4a4a", accent: "#a0a0a0", label: "記",
                  face: "normal", faces: { normal: CHARA_DIR + "sil_gatai.png" } }
};
