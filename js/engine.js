// data/scenario.js の会話データを、上から順に再生する。
// 選択肢で選んだ value は ctx[key] に入って返ってくる。
async function play(steps, ctx = {}) {
  for (const s of steps) {
    if (s.cgOff) UI.hideCg();
    if (s.bg) UI.setBg(s.bg);
    if (s.cg) UI.showCg(s.cg);
    if (s.flash) UI.flash();
    // 初登場の紹介カット（一度出したキャラは出さない。出せなかったときは「出した」ことにしない）
    if (s.intro && !Game.state.introduced[s.intro]) {
      if (await UI.showIntro(s.intro)) Game.state.introduced[s.intro] = true;
    }
    if (s.wait) {
      UI.hideMsg();
      await UI.sleep(s.wait);
    }
    if (s.text !== undefined) await UI.say(s.who || null, s.text, s.face);
    if (s.choice) {
      const i = await UI.choose(s.choice);
      const opt = s.choice[i];
      if (s.key) ctx[s.key] = opt.value;
      Game.applyEffects(opt.effects);
      if (opt.then) await play(opt.then, ctx);
    }
  }
  return ctx;
}

// 回数で順番に変わる会話（最後のものをくり返す）
function pickByCount(list, count) {
  return list[Math.min(count, list.length - 1)];
}
