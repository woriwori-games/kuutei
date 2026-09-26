// ゲームの状態。全部このひとつのオブジェクトに入れる。
// あとで「復活の呪文」を作るときは、これを文字列にして書き出す。
const SAVE_KEY = "kuutei-save-v1";

function newState() {
  return {
    version: 1,
    playerName: null,
    progress: 0,                 // 進行度（0:はじめ 1:欠片を持っている 2:欠片を1個はめた 3:2個はめた）
    params: { trust: 0, understanding: 0, influence: 0 }, // 信頼・理解・影響（画面には出さない）
    fragments: [],               // もらったが、まだ形の決まっていない欠片（元になった記録の id）
    ship: { propulsion: [], hull: [], helm: [], lift: [] }, // 各部位の欠片 { id, tuning }
    emotions: { dou: 0, sei: 0, sentaku: 0, joushou: 0 },  // 感情系統ごとの数（船の性格の元）
    partnerMemory: 0,            // 相棒のメモリがいくつ戻ったか
    visits: { mama: 0 },         // ママの店に行った回数
    talks: {},                   // キャラごとの話しかけ回数 { opa: 2, mama: 1, yamada: 4 }（yamada は「山田と話す」を選んだ合計。伝える会話の回は数えない）
    choices: {},                 // 選んだ答えの記録 { koun0412_reading: "ureshii" }
    flags: {}                    // できごとの記録 { metOpa: true }
  };
}

const Game = {
  state: newState(),

  reset() {
    this.state = newState();
  },

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      return true;
    } catch (e) {
      return false;
    }
  },

  hasSave() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
      return false;
    }
  },

  load() {
    try {
      const text = localStorage.getItem(SAVE_KEY);
      if (!text) return false;
      // 古いセーブに無い項目は、新しい初期値で埋める
      this.state = Object.assign(newState(), JSON.parse(text));
      return true;
    } catch (e) {
      return false;
    }
  },

  addTalk(who) {
    this.state.talks[who] = (this.state.talks[who] || 0) + 1;
    return this.state.talks[who];
  },

  applyEffects(effects) {
    if (!effects) return;
    for (const key in effects) {
      if (key in this.state.params) this.state.params[key] += effects[key];
    }
  }
};
