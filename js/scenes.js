// 場面ごとの進行。各場面は「次に行く場面の名前」を返す。
const Scenes = (() => {
  const D = window.GAME_DATA;
  const sc = D.scenario;
  const S = () => Game.state;

  // 試作品の終わりを出す進行度（山田の欠片をはめたあと）
  const PROTOTYPE_END = 3;

  // 空挺にはまっている欠片の数
  function placedCount() {
    return Object.values(S().ship).reduce((n, list) => n + list.length, 0);
  }

  // 空挺の骨組み（4部位×2個）の表示
  function shipHtml() {
    const parts = D.shipParts.map((p) => {
      const slots = [0, 1].map((k) => {
        const f = S().ship[p.id][k];
        if (!f) return `<div class="slot"></div>`;
        const def = D.fragments[f.id];
        return `<div class="slot filled" style="--c:${def.color}">${def.name}</div>`;
      }).join("");
      return `<div class="part"><div class="part-name">${p.name}</div><div class="slots">${slots}</div></div>`;
    }).join("");
    return `<div class="ship"><div class="ship-title">空挺（骨組み）</div><div class="parts">${parts}</div></div>`;
  }

  async function title() {
    UI.showLogButton(false);
    BGM.scene("title");
    UI.hideMsg();
    UI.hideCg();
    UI.setBg("title");
    const root = UI.setStage(`
      <div class="title-screen">
        <h1>空挺</h1>
        <p class="sub">（仮題）</p>
        <div class="menu">
          <button data-go="new">はじめから</button>
          <button data-go="continue" ${Game.hasSave() ? "" : "disabled"}>つづきから</button>
        </div>
      </div>`);
    const go = await UI.waitButtons(root);
    BGM.unlock(); // 「はじめから」「つづきから」を押したときに、音を鳴らせるようにする
    UI.setStage("");
    UI.clearLog();
    UI.showLogButton(true);
    if (go === "continue" && Game.load()) return "map";
    Game.reset();
    return "wake";
  }

  async function wake() {
    BGM.scene("wake");
    // 暗転のあいだに、相棒とプレイヤーの顔の読み込みを少しだけ待つ（回線が遅いとき用。最大3秒）
    UI.setBg("black");
    await UI.waitFirstImages(3000);
    await play(sc.wake);
    return "naming";
  }

  async function naming() {
    BGM.scene("naming");
    await play(sc.namingIntro);
    const cands = D.nameCandidates;
    const selectable = cands.filter((c) => !c.locked).length;
    const declined = new Set();
    let name = null;

    while (name === null) {
      const i = await UI.choose(
        cands.map((c, n) => ({
          label: `${n + 1}. ${c.name}`,
          locked: c.locked,
          lockedText: `${n + 1}. ${c.lockedText}`,
          note: declined.has(n)
        })),
        { columns: 2 }
      );
      const c = cands[i];
      await UI.say("aibou", c.comment);
      const ok = await UI.choose([{ label: `「${c.name}」にする` }, { label: "ほかのにする" }]);
      if (ok === 0) {
        name = c.name;
        break;
      }
      declined.add(i);
      if (declined.size >= selectable) {
        await play(sc.namingAllRefused);
        const typed = await UI.input("名前を入れる（空のままでもOK）");
        if (typed) {
          name = typed.slice(0, 12);
        } else {
          name = "ｗ";
          await play(sc.namingEmpty);
        }
      } else {
        await UI.say("aibou", "じゃあ、ほかのから");
      }
    }

    S().playerName = name;
    await play(sc.namingDone);
    BGM.scene("whyShip");
    await play(sc.whyShip);
    return "hangar";
  }

  // 格納庫：骨組みの空挺と、欠片とは何かの説明
  async function hangar() {
    BGM.scene("hangar");
    UI.setBg("base");
    UI.setStage(shipHtml());
    await play(sc.hangar);
    UI.setStage("");
    return "map";
  }

  // 移動中の町の場面。最初の一回は固定、二回目からはランダム（同じのが続かないように）
  let lastTown = -1;
  async function travel() {
    BGM.scene("town");
    const s = S();
    const t = D.townScenes;
    if (!s.flags.firstTravel) {
      s.flags.firstTravel = true;
      await play(t.first);
      return;
    }
    let i = Math.floor(Math.random() * t.random.length);
    if (t.random.length > 1 && i === lastTown) i = (i + 1) % t.random.length;
    lastTown = i;
    await play(t.random[i]);
  }

  async function map() {
    BGM.scene("map");
    UI.hideMsg();
    UI.hideCg();
    UI.setBg("map");
    const canAlchemy = S().fragments.length > 0;
    // minProgress がある場所は、その進行度になってから出す
    const places = D.places.filter((p) => S().progress >= (p.minProgress || 0)).map((p) => `
      <button class="place" data-go="${p.id}">
        <span class="place-name">${p.name}</span>
        <span class="place-desc">${p.desc}</span>
      </button>`).join("");
    const root = UI.setStage(`
      <div class="map-screen">
        <h2>地図</h2>
        <p class="compass">コンパス：空の一点を指している</p>
        <div class="places">${places}</div>
        <button class="place base" data-go="base">
          <span class="place-name">格納庫に戻る${canAlchemy ? '<span class="badge">！</span>' : ""}</span>
          <span class="place-desc">${canAlchemy ? "相棒が欠片の形を決めたがっている" : "空挺の骨組みがある"}</span>
        </button>
        <button class="small" data-go="title">タイトルへ</button>
      </div>`);
    const go = await UI.waitButtons(root);
    UI.setStage("");
    if (D.places.some((p) => p.id === go)) await travel();
    return go;
  }

  async function koun() {
    BGM.scene("koun");
    const s = S();
    if (!s.flags.metOpa) {
      Game.addTalk("opa");
      await play(sc.kounFirst);
      await play(sc.record0412);
      await play(sc.kounAfterRecord);
      s.flags.metOpa = true;
      s.fragments.push("koun0412");
      s.progress = Math.max(s.progress, 1);
    }
    UI.setBg("koun");
    while (true) {
      UI.hideMsg();
      const i = await UI.choose([
        { label: "おぱと話す" },
        { label: "記録をもう一度見る" },
        { label: "地図に戻る" }
      ]);
      if (i === 0) {
        const n = Game.addTalk("opa");
        const reading = s.choices.koun0412_reading;
        if (reading && !s.flags.toldOpa) {
          // 錬金で読んだ温度を、おぱに伝える（一度だけ）
          s.flags.toldOpa = true;
          await play(sc.opaTold[reading]);
        } else {
          await play(pickByCount(sc.opaTalks, n - 2));
        }
      } else if (i === 1) {
        await play(sc.record0412);
      } else {
        return "map";
      }
    }
  }

  // 廃校の美術室（山田）。流れはKOUNと同じ：出会い → 記録 → 山田の深読み → 欠片
  async function yamada() {
    BGM.scene("yamada");
    const s = S();
    if (!s.flags.metYamada) {
      await play(sc.yamadaFirst);
      await play(sc.recordYamada);
      await play(sc.yamadaAfterRecord);
      s.flags.metYamada = true;
      s.fragments.push("yamada");
    }
    UI.setBg("yamada");
    while (true) {
      UI.hideMsg();
      const i = await UI.choose([
        { label: "山田と話す" },
        { label: "記録をもう一度見る" },
        { label: "地図に戻る" }
      ]);
      if (i === 0) {
        const reading = s.choices.yamada_reading;
        if (reading && !s.flags.toldYamada) {
          // 錬金で読んだ温度を、山田に伝える（一度だけ。この回は話しかけ回数に数えない）
          s.flags.toldYamada = true;
          await play(sc.yamadaTold[reading]);
        } else {
          // 「山田と話す」の合計回数（ゲーム全体で足していく。セーブにも残る）
          const n = Game.addTalk("yamada");
          await play(yamadaTalkSteps(n));
        }
      } else if (i === 1) {
        await play(sc.recordYamada);
      } else {
        return "map";
      }
    }
  }

  // 山田のいつものセリフを、話しかけた合計回数から選ぶ
  function yamadaTalkSteps(n) {
    const special = sc.yamadaTalkSpecial;
    if (n === special.at) return special.steps;
    const stages = sc.yamadaTalks;
    if (n > special.at) return stages[0].steps; // 特別なセリフのあとは、最初のセリフに戻る
    const stage = stages.find((t) => n <= t.until) || stages[stages.length - 1];
    return stage.steps;
  }

  async function bar() {
    const s = S();
    s.visits.mama++;
    const sign = () => pickByCount(D.signboard, s.progress);
    // 入店の演出：絵の左端（ネオン看板）から、視火が映る位置までゆっくり流す。止まるまで会話は始めない
    UI.hideMsg();
    BGM.scene("bar");
    await UI.panBg("bar", "0% center", D.backgrounds.bar.pos, 3000);
    await play(sc.barEnter);
    while (true) {
      UI.hideMsg();
      const i = await UI.choose([
        { label: "視火と話す" },
        { label: "看板を見る" },
        { label: "地図に戻る" }
      ]);
      if (i === 0) {
        const n = Game.addTalk("mama");
        // 会話は [ ... ] か、確認のセリフを差し替える { steps, saveAsk } のどちらか
        const talk = pickByCount(sc.mamaTalks, n - 1);
        await play(talk.steps || talk);
        await play(talk.saveAsk || sc.mamaSaveAsk);
        const k = await UI.choose([{ label: "覚えておいて（セーブ）" }, { label: "またこんど" }]);
        if (k === 0) {
          if (Game.save()) {
            UI.toast("セーブしました");
            await play(sc.mamaSaved);
          } else {
            UI.toast("セーブできませんでした（ブラウザの設定を確認してね）");
          }
        } else {
          await play(sc.mamaNoSave);
        }
      } else if (i === 1) {
        // 看板は見ているあいだだけ出す
        UI.showSign(sign().text);
        await UI.say(null, `看板「${sign().text}」`);
        await UI.say("player", sign().comment);
        UI.hideSign();
      } else {
        return "map";
      }
    }
  }

  // 記録の本当の温度を読んで欠片の形を決め、空挺にはめる
  async function alchemy() {
    const s = S();
    const recordId = s.fragments.shift();
    const steps = sc["alchemy_" + recordId];
    if (!steps) return; // 古いセーブなどで会話が無いときは何もしない

    BGM.scene("renkin"); // 記録の温度を読むところから、欠片をはめ終わるまで
    const ctx = await play(steps);
    const id = ctx.reading;
    const frag = D.fragments[id];
    const part = D.shipParts.find((p) => p.system === frag.system);
    s.choices[recordId + "_reading"] = id;

    s.ship[part.id].push({ id, tuning: ctx.tuning });
    s.emotions[frag.system]++;
    // 進行度は「はめた欠片の数 + 1」（1個目で2、2個目で3）
    s.progress = Math.max(s.progress, placedCount() + 1);

    UI.setStage(shipHtml());
    UI.flash();
    // 少しだけ薄めた欠片は元気すぎて、骨組みが一度だけ震える
    const light = ctx.tuning === "light";
    if (light) UI.shake(".ship");
    await UI.say(null, `欠片「${frag.name}」が、空挺の「${part.name}」にはまった`);
    if (light) await play(sc.tuningLightAfter);
    BGM.scene("base"); // はめ終わったら格納庫の曲に戻す

    // 相棒のメモリが一つ戻る
    const m = s.partnerMemory;
    if (m < D.memories.length) {
      s.partnerMemory++;
      UI.flash();
      UI.toast("相棒のメモリが 1 つ戻った");
      UI.showCg("memory"); // メモリの中身の会話のあいだ出しておく
      await play(D.memories[m]);
      UI.hideCg();
    }
  }

  async function base() {
    const s = S();
    BGM.scene("base");
    UI.hideCg();
    UI.setBg("base");
    UI.setStage(shipHtml());

    if (s.fragments.length > 0) {
      await alchemy();
      await play(pickByCount(sc.baseAfter, placedCount() - 1));
      if (s.progress >= PROTOTYPE_END) await play(sc.prototypeEnd);
    } else {
      await play(s.progress >= PROTOTYPE_END ? sc.prototypeEnd : sc.baseIdle);
    }

    UI.hideMsg();
    await UI.choose([{ label: "地図に戻る" }]);
    UI.setStage("");
    return "map";
  }

  return { title, wake, naming, hangar, map, koun, yamada, bar, base };
})();
