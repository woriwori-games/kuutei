// 場面ごとの進行。各場面は「次に行く場面の名前」を返す。
const Scenes = (() => {
  const D = window.GAME_DATA;
  const sc = D.scenario;
  const S = () => Game.state;

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
    UI.setStage("");
    if (go === "continue" && Game.load()) return "map";
    Game.reset();
    return "wake";
  }

  async function wake() {
    await play(sc.wake);
    return "naming";
  }

  async function naming() {
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
    return "map";
  }

  async function map() {
    UI.hideMsg();
    UI.hideCg();
    UI.setBg("map");
    const canAlchemy = S().fragments.length > 0;
    const places = D.places.map((p) => `
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
          <span class="place-name">拠点に戻る${canAlchemy ? '<span class="badge">！</span>' : ""}</span>
          <span class="place-desc">${canAlchemy ? "相棒が欠片を調整したがっている" : "空挺の骨組みがある"}</span>
        </button>
        <button class="small" data-go="title">タイトルへ</button>
      </div>`);
    const go = await UI.waitButtons(root);
    UI.setStage("");
    return go;
  }

  async function koun() {
    const s = S();
    if (!s.flags.metOpa) {
      Game.addTalk("opa");
      await play(sc.kounFirst);
      await play(sc.record0412);
      await play(sc.kounFragment);
      s.flags.metOpa = true;
      s.fragments.push("ureshii");
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
        await play(pickByCount(sc.opaTalks, n - 2));
      } else if (i === 1) {
        await play(sc.record0412);
      } else {
        return "map";
      }
    }
  }

  async function bar() {
    const s = S();
    s.visits.mama++;
    const sign = () => pickByCount(D.signboard, s.progress);
    UI.setStage(`<div class="signboard">${sign().text}</div>`);
    await play(sc.barEnter);
    while (true) {
      UI.hideMsg();
      const i = await UI.choose([
        { label: "ママと話す" },
        { label: "看板を見る" },
        { label: "地図に戻る" }
      ]);
      if (i === 0) {
        const n = Game.addTalk("mama");
        await play(pickByCount(sc.mamaTalks, n - 1));
        await play(sc.mamaSaveAsk);
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
        await UI.say(null, `看板「${sign().text}」`);
        await UI.say("player", sign().comment);
      } else {
        UI.setStage("");
        return "map";
      }
    }
  }

  // 欠片を調整して空挺にはめる
  async function alchemy() {
    const s = S();
    const id = s.fragments[0];
    const frag = D.fragments[id];
    const part = D.shipParts.find((p) => p.system === frag.system);

    const ctx = await play(sc["alchemy_" + id]);
    s.choices[id + "_reaction"] = ctx.reaction;

    s.fragments.shift();
    s.ship[part.id].push({ id, tuning: ctx.tuning });
    s.emotions[frag.system]++;
    s.progress = Math.max(s.progress, 2);

    UI.setStage(shipHtml());
    UI.flash();
    await UI.say(null, `欠片「${frag.name}」が、空挺の「${part.name}」にはまった`);

    // 相棒のメモリが一つ戻る
    const m = s.partnerMemory;
    if (m < D.memories.length) {
      s.partnerMemory++;
      UI.flash();
      UI.toast("相棒のメモリが 1 つ戻った");
      await play(D.memories[m]);
    }
  }

  async function base() {
    const s = S();
    UI.hideCg();
    UI.setBg("base");
    UI.setStage(shipHtml());

    if (s.fragments.length > 0) {
      await alchemy();
      await play(sc.baseAfter);
      await play(sc.prototypeEnd);
    } else {
      await play(s.progress >= 2 ? sc.prototypeEnd : sc.baseIdle);
    }

    UI.hideMsg();
    await UI.choose([{ label: "地図に戻る" }]);
    UI.setStage("");
    return "map";
  }

  return { title, wake, naming, map, koun, bar, base };
})();
