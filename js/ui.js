// 画面の部品：会話ウィンドウ、選択肢、背景、一枚絵、演出など。
const UI = (() => {
  const $ = (id) => document.getElementById(id);
  const D = window.GAME_DATA;
  const TYPE_SPEED = 35; // 一文字にかける時間（ミリ秒）
  const LOG_MAX = 200;   // ログに残す数（古いものから消える）

  // 決定待ちのときに呼ぶ関数（クリック・キーで進める）
  let onAdvance = null;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // 会話の {name} をプレイヤーの名前に、{time} を端末の今の時刻（「16時03分」の形）に置き換える
  function fillName(text) {
    const name = Game.state.playerName || "？？？";
    return text.replace(/\{name\}/g, () => name).replace(/\{time\}/g, () => nowText());
  }

  function nowText() {
    const d = new Date();
    return `${d.getHours()}時${String(d.getMinutes()).padStart(2, "0")}分`;
  }

  // ---------- 画像 ----------
  // 画像の読み込み
  // - 読み込めたら ok()、読み直してもだめなら ng() を呼ぶ
  // - 失敗したら少し間をあけて、2回まで読み直す
  // - 前に失敗した画像は、次に頼まれたときにもう一度だけ試す
  // - 読み込み中に同じ画像を頼まれたら、新しく読み込まずに終わるのを待つ（待っている全員に知らせる）
  const RETRY_MAX = 2;      // 読み直す回数
  const RETRY_WAIT = 800;   // 読み直すまでの間（ミリ秒）
  const imgState = {};      // 画像 → "ok"（読めた）/ "failed"（だめだった）
  const imgSize = {};       // 読めた画像 → { w, h }（元の大きさ）
  const imgWaiting = {};    // 読み込み中の画像 → 終わるのを待っている人たち

  function loadImage(src, ok, ng) {
    if (imgState[src] === "ok") return ok();
    if (imgWaiting[src]) {
      imgWaiting[src].push({ ok, ng });
      return;
    }
    imgWaiting[src] = [{ ok, ng }];
    tryLoad(src, imgState[src] === "failed" ? 0 : RETRY_MAX);
  }

  function tryLoad(src, retriesLeft) {
    const img = new Image();
    img.onload = () => {
      imgSize[src] = { w: img.naturalWidth, h: img.naturalHeight };
      finishLoad(src, true);
    };
    img.onerror = () => {
      if (retriesLeft > 0) setTimeout(() => tryLoad(src, retriesLeft - 1), RETRY_WAIT);
      else finishLoad(src, false);
    };
    img.src = src;
  }

  function finishLoad(src, loaded) {
    imgState[src] = loaded ? "ok" : "failed";
    const waiting = imgWaiting[src];
    delete imgWaiting[src];
    for (const w of waiting) {
      if (loaded) w.ok();
      else if (w.ng) w.ng();
    }
  }

  // 読み込めたら true、だめなら false になる形
  function loadImageP(src) {
    return new Promise((resolve) => loadImage(src, () => resolve(true), () => resolve(false)));
  }

  // 使う画像を先に読み込んでおく。最初に出る player と aibou の顔、目覚めの一枚絵、カプセルと廃墟の背景を先に。
  // それが終わってから、残りのキャラと背景
  let firstReady = Promise.resolve();
  async function preload() {
    const faceList = (id) => Object.values(D.characters[id].faces || {});
    const firstFaces = [...faceList("player"), ...faceList("aibou")];
    // 目覚めの一枚絵、カプセルの背景、廃墟の背景も最初のグループに入れる
    // 相棒の全身（目覚めのあとの紹介カット）はカプセルの背景と一緒に
    const firstBgs = [D.cgs.wake.image, D.backgrounds.capsule.image, D.characters.aibou.body, D.backgrounds.ruins.image];
    const first = [...firstFaces, ...firstBgs];
    // 顔と目覚めの一枚絵を真っ先に（目覚めの暗転中に待つのはここまで）。そのあと背景（カプセル → 廃墟の順）
    firstReady = Promise.all([...firstFaces, D.cgs.wake.image].map(loadImageP));
    await firstReady;
    for (const src of firstBgs) await loadImageP(src);

    const rest = [];
    for (const id in D.characters) {
      if (id !== "player" && id !== "aibou") rest.push(...faceList(id));
    }
    for (const id in D.backgrounds) if (D.backgrounds[id].image) rest.push(D.backgrounds[id].image);
    // 紹介カットの全身（KOUN・美術室・時計台の背景と一緒に。そのほかのキャラはそのあと）
    for (const id of ["opa", "yamada", "jemi"]) rest.push(D.characters[id].body);
    for (const id in D.characters) if (D.characters[id].body) rest.push(D.characters[id].body);
    for (const id in D.cgs) if (D.cgs[id].image) rest.push(D.cgs[id].image);
    await Promise.all([...new Set(rest)].filter((src) => !first.includes(src)).map(loadImageP));
  }

  // 最初に出る顔（player と aibou）と目覚めの一枚絵の読み込みを、最大 ms ミリ秒だけ待つ
  function waitFirstImages(ms) {
    return Promise.race([firstReady, sleep(ms)]);
  }

  // 背景・一枚絵を塗る
  // - 画像がある場所：読み込み中は色だけ（場所の名前は出さない）。読めたら絵にする。読み直してもだめなら名前を出す
  // - 画像がない場所：色と名前
  // 背景と一枚絵は、中に2枚重ねてある
  //   .pic  … くっきりした絵
  //   .fill … 同じ絵を画面いっぱいに広げて、強くぼかして暗くしたもの（スマホ縦で絵のまわりの空いたところを埋める）
  function paint(el, def, labelEl, labelText, layout) {
    const pic = el.querySelector(".pic");
    const fill = el.querySelector(".fill");
    el.dataset.src = def.image || "";
    el.style.backgroundColor = def.color || "#000";
    pic.style.backgroundImage = "";
    fill.style.backgroundImage = "";
    layout();
    if (!def.image) {
      labelEl.textContent = labelText || "";
      return;
    }
    labelEl.textContent = "";
    loadImage(def.image, () => {
      if (el.dataset.src !== def.image) return; // もう別の背景に変わっていたら何もしない
      pic.style.backgroundImage = `url("${def.image}")`;
      fill.style.backgroundImage = `url("${def.image}")`;
      layout(); // 絵の大きさが分かったので、置き直す
    }, () => {
      if (el.dataset.src !== def.image) return;
      labelEl.textContent = labelText || "";
    });
  }

  // 「スマホ縦」＝ゲーム画面の高さが幅の1.3倍より大きいとき（パソコンはゲーム画面の幅に上限があるので、ほぼ正方形になる）
  function isPortrait() {
    const g = $("game");
    return g.clientHeight > g.clientWidth * PORTRAIT_RATIO;
  }

  // pos（"35% center" や "center"）から、横の位置（0〜1）を取り出す
  function posX(pos) {
    const n = parseFloat(pos);
    return isNaN(n) ? 0.5 : n / 100;
  }

  // スマホ縦のときに、絵を zoom 倍（画面の横幅の何倍か）にして、pos の位置が画面の真ん中に来るように置く
  // top … 絵の上端の位置（絵の高さ h を受け取って決める）。まわりはぼかしで埋める
  function frame(el, src, zoom, pos, top) {
    const pic = el.querySelector(".pic");
    const size = imgSize[src];
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const w = cw * zoom;
    const h = w * size.h / size.w;
    const x = Math.min(0, Math.max(cw - w, cw / 2 - w * posX(pos))); // 絵の端より外は見せない
    el.classList.add("framed");
    pic.style.backgroundSize = `${w}px ${h}px`;
    pic.style.backgroundPosition = `${x}px ${top(h, ch)}px`;
  }

  // ふだんの置き方（パソコン、または絵がまだ読めていないとき）
  function unframe(el, fit, pos) {
    const pic = el.querySelector(".pic");
    el.classList.remove("framed");
    pic.style.backgroundSize = fit;
    pic.style.backgroundPosition = pos;
  }

  // 背景をスマホ縦で置くとき、絵は画面の上の方（会話ウィンドウにかからない位置）に置く
  const BG_TOP_MIN = 52;     // 右上のボタンのぶん空ける
  const BG_BOTTOM = 200;     // 会話ウィンドウのぶん空ける
  let currentBg = null;

  // zoomOverride … その大きさで置く（入店の看板を見せるとき。パソコンでも同じ置き方にする）
  function layoutBg(id, posOverride, zoomOverride) {
    const def = D.backgrounds[id] || D.backgrounds.black;
    const el = $("bg");
    const pos = posOverride || def.pos || "center";
    const zoom = zoomOverride || def.zoom;
    if (def.image && zoom && imgSize[def.image] && el.dataset.src === def.image && (zoomOverride || isPortrait())) {
      frame(el, def.image, zoom, pos, (h, ch) => Math.max(BG_TOP_MIN, (ch - BG_BOTTOM - h) / 2));
    } else {
      unframe(el, def.fit || "cover", pos);
    }
  }

  function setBg(id) {
    const def = D.backgrounds[id] || D.backgrounds.black;
    currentBg = id;
    paint($("bg"), def, $("bg-label"), def.label, () => layoutBg(id));
  }

  // 入店の演出：背景を from の位置から、ふだんの位置（def.pos）まで動かす（終わるまで待つ）
  // - パソコン：ms ミリ秒かけてゆっくり横に流す
  // - スマホ縦、または端末の「動きを減らす」設定がオン：from を1.2秒見せて、0.4秒で暗く → 位置を切り替え → 0.4秒で明るく
  //   from を見せる間だけ、背景の signZoom の大きさにする（看板が全部入るように）
  // - 途中で画面をタップしたら、すぐふだんの位置にして終わる
  // 画像が読み込めないときは動かさずに、ふだんの位置で止まった状態にする
  async function panBg(id, from, ms) {
    const def = D.backgrounds[id];
    setBg(id);
    const el = $("bg");
    const pic = el.querySelector(".pic");
    if (!def.image) return;
    // 読み込みを待つ（回線が遅いときは4秒まで。それを過ぎたら動かさない）
    const loaded = await Promise.race([loadImageP(def.image), sleep(4000).then(() => false)]);
    if (!loaded || currentBg !== id) return;

    let skipped = false;
    const skip = new Promise((resolve) => { onAdvance = () => { skipped = true; resolve(); }; });
    const wait = (t) => (skipped ? Promise.resolve() : Promise.race([sleep(t), skip]));
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isPortrait() || reduceMotion) {
      layoutBg(id, from, def.signZoom);
      await wait(1200);
      if (!skipped) {
        el.style.transition = "opacity 0.4s";
        el.style.opacity = "0";
        await wait(400);
      }
      layoutBg(id);
      if (!skipped) {
        el.style.opacity = "1";
        await wait(400);
      }
    } else {
      pic.style.transition = "none";
      layoutBg(id, from);
      void pic.offsetWidth; // いったん from の位置で描いてから流し始める
      pic.style.transition = `background-position ${ms}ms ease-in-out`;
      layoutBg(id);
      await wait(ms);
    }
    // 終わり（タップで飛ばしたときも、ここでふだんの位置・明るさにそろえる）
    onAdvance = null;
    pic.style.transition = "";
    el.style.transition = "";
    el.style.opacity = "";
    layoutBg(id);
  }

  // ---------- 初登場の紹介カット ----------
  // キャラに初めて会ったとき、背景の上に全身の絵をふわっと出して、名前を添える
  // - 0.4秒で出す → 2.5秒見せる → 0.4秒で消す。タップ（早送りがオンのときも）ですぐ消す
  // - 全身の絵が読み込めていなければ最大1秒待つ。それでもだめなら出さない
  // 出せたら true、出せなかったら false を返す
  const INTRO_FADE = 400;
  const INTRO_SHOW = 2500;
  const INTRO_WAIT_LOAD = 1000;
  let introShowing = false;

  async function showIntro(id) {
    const c = D.characters[id];
    if (!c || !c.body) return false;
    const loaded = await Promise.race([loadImageP(c.body), sleep(INTRO_WAIT_LOAD).then(() => false)]);
    if (!loaded) return false;
    const el = $("intro");
    el.querySelector("img").src = c.body;
    el.querySelector(".intro-name").textContent = fillName(c.name);
    el.classList.toggle("portrait", isPortrait());
    hideMsg();
    el.classList.remove("hidden");
    void el.offsetWidth;
    el.classList.add("show");
    let skipped = false;
    const skip = new Promise((resolve) => { onAdvance = () => { skipped = true; resolve(); }; });
    const wait = (t) => (skipped ? Promise.resolve() : Promise.race([sleep(t), skip]));
    introShowing = true;
    if (fastForward) onAdvance();
    await wait(INTRO_FADE + INTRO_SHOW);
    el.classList.remove("show");
    await wait(INTRO_FADE);
    introShowing = false;
    onAdvance = null;
    el.classList.add("hidden");
    return true;
  }

  // 会話ウィンドウのすぐ上に出す看板（「本日のおすすめ」など）
  function showSign(text) {
    const el = $("sign");
    el.textContent = text;
    el.classList.remove("hidden");
  }

  function hideSign() {
    $("sign").classList.add("hidden");
  }

  // 一枚絵はふつう切らずに全体を見せて、少し上寄りに置く（会話ウィンドウに顔が隠れないように）
  const CG_TOP = 0.4;         // 上下の余白のうち、上に置く割合
  const PORTRAIT_RATIO = 1.3; // 高さが幅のこの倍より大きければ「スマホ縦」として拡大する
  let currentCg = null;

  function showCg(id) {
    const def = D.cgs[id];
    currentCg = id;
    paint($("cg"), def, $("cg-caption"), def.caption, () => layoutCg(id));
    $("cg").classList.add("show");
  }

  // スマホ縦（画面が縦長）のときだけ、zoom 倍に拡大して、pos の位置が画面の真ん中に来るように置く（左右の端は切れる）
  // パソコン（横長の画面）では何もしない（切らずに全体表示のまま）
  // スマホ縦のときは、まわりの余白をぼかしで埋める
  function layoutCg(id) {
    const def = D.cgs[id];
    const el = $("cg");
    if (currentCg !== id) return;
    if (def.zoom && def.image && imgSize[def.image] && el.dataset.src === def.image && isPortrait()) {
      frame(el, def.image, def.zoom, def.pos, (h, ch) => (ch - h) * CG_TOP);
    } else {
      unframe(el, def.fit || "contain", def.fit === "cover" ? "center" : `center ${CG_TOP * 100}%`);
    }
  }

  function hideCg() {
    currentCg = null;
    $("cg").classList.remove("show");
  }

  function flash() {
    const el = $("flash");
    el.classList.remove("go");
    void el.offsetWidth; // アニメーションをやり直すため
    el.classList.add("go");
  }

  // 指定した部品を一度だけガタッと揺らす
  function shake(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.remove("jolt");
    void el.offsetWidth;
    el.classList.add("jolt");
  }

  function toast(text) {
    const el = $("toast");
    el.textContent = text;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  }

  // 表情の名前から顔画像のパスを決める（無い表情ならふだんの表情）
  function facePath(c, face) {
    if (!c.faces) return null;
    return c.faces[face] || c.faces[c.face] || null;
  }

  // 顔アイコンを塗る
  // - 画像があるキャラ：読み込み中は明るい無地の枠。読めたら顔。読み直してもだめなら仮の四角＋文字
  // - 画像がないキャラ：仮の四角＋文字
  function paintFace(el, c, face) {
    const src = facePath(c, face);
    el.dataset.src = src || "";
    const placeholder = () => {
      el.classList.remove("has-image");
      el.style.backgroundColor = c.color;
      el.style.backgroundImage = `linear-gradient(135deg, transparent 70%, ${c.accent} 70%)`;
      el.textContent = c.label;
    };
    if (!src) return placeholder();
    el.classList.add("has-image");
    el.style.backgroundColor = "";
    el.style.backgroundImage = "";
    el.textContent = "";
    loadImage(src, () => {
      if (el.dataset.src !== src) return; // もう別の顔に変わっていたら何もしない
      el.style.backgroundImage = `url("${src}")`;
    }, () => {
      if (el.dataset.src === src) placeholder();
    });
  }

  function setFace(who, face) {
    const el = $("face");
    const c = who && D.characters[who];
    el.hidden = !c;
    if (c) paintFace(el, c, face);
  }

  // ---------- ログ（スレを遡る） ----------
  // { who, name, text } か { choice: "選んだ文字" } を古い順にためる
  const logEntries = [];

  function addLog(entry) {
    logEntries.push(entry);
    if (logEntries.length > LOG_MAX) logEntries.shift();
  }

  function clearLog() {
    logEntries.length = 0;
  }

  // 会話中だけ出すボタン（早送り、スレを遡る）
  function showLogButton(show) {
    $("log-btn").classList.toggle("hidden", !show);
    $("ff-btn").classList.toggle("hidden", !show);
    if (!show) setFastForward(false);
  }

  function isLogOpen() {
    return !$("log").classList.contains("hidden");
  }

  function openLog() {
    const list = $("log-list");
    list.innerHTML = "";
    if (logEntries.length === 0) {
      list.innerHTML = `<p class="log-empty">まだ何もない</p>`;
    }
    for (const e of logEntries) {
      const row = document.createElement("div");
      if (e.choice) {
        row.className = "log-row log-choice";
        row.textContent = "▶ " + e.choice;
      } else {
        row.className = "log-row" + (e.who ? "" : " log-narration");
        const c = e.who && D.characters[e.who];
        if (c) {
          const face = document.createElement("div");
          face.className = "log-face";
          paintFace(face, c, e.face);
          row.appendChild(face);
        }
        const body = document.createElement("div");
        body.className = "log-body";
        if (c) {
          const name = document.createElement("div");
          name.className = "log-name";
          name.textContent = e.name;
          body.appendChild(name);
        }
        const text = document.createElement("div");
        text.className = "log-text";
        text.textContent = e.text;
        body.appendChild(text);
        row.appendChild(body);
      }
      list.appendChild(row);
    }
    $("log").classList.remove("hidden");
    list.scrollTop = list.scrollHeight; // いちばん新しいところから、上へ遡る
  }

  function closeLog() {
    $("log").classList.add("hidden");
  }

  // セリフを一文字ずつ出し、クリックを待つ
  // face を書くと、その1行だけその表情になる
  // 早送り：オンの間は、一度読んだ会話を自動でどんどん進める（まだ読んでいない会話と、選択肢では止まる）
  const FF_WAIT = 150;     // 早送りで、読んだ会話を次へ進めるまでの間（ミリ秒）
  let fastForward = false;
  let lineWaitingRead = false; // 今クリック待ちの会話が、読んだことのある会話か

  function setFastForward(on) {
    fastForward = on;
    const b = $("ff-btn");
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
    // クリック待ちの会話が読んだことのあるものなら、すぐ進める
    // 紹介カットの途中なら、すぐ消す
    if (on && (lineWaitingRead || introShowing) && onAdvance) onAdvance();
  }

  async function say(who, text, face) {
    const msg = $("msg");
    const body = $("text");
    const c = who && D.characters[who];
    const key = Game.lineKey(who, text);
    const wasRead = Game.isRead(key);
    $("speaker").textContent = c ? fillName(c.name) : "";
    setFace(who, face);
    msg.classList.remove("hidden");
    msg.classList.toggle("narration", !c);
    msg.classList.remove("waiting");

    const full = fillName(text);
    addLog({ who: c ? who : null, face, name: c ? fillName(c.name) : "", text: full });
    let shown = 0;
    let skip = fastForward && wasRead; // 早送り中の読んだ会話は、一文字ずつ出さずに全部出す
    body.textContent = "";

    await new Promise((resolve) => {
      onAdvance = () => { skip = true; };
      const timer = setInterval(() => {
        if (skip) shown = full.length;
        else shown++;
        body.textContent = full.slice(0, shown);
        if (shown >= full.length) {
          clearInterval(timer);
          resolve();
        }
      }, TYPE_SPEED);
    });

    msg.classList.add("waiting");
    lineWaitingRead = wasRead;
    await new Promise((resolve) => {
      let timer = null;
      onAdvance = () => {
        clearTimeout(timer);
        onAdvance = null;
        resolve();
      };
      if (fastForward && wasRead) timer = setTimeout(() => { if (onAdvance) onAdvance(); }, FF_WAIT);
    });
    lineWaitingRead = false;
    Game.markRead(key);
    msg.classList.remove("waiting");
  }

  function hideMsg() {
    $("msg").classList.add("hidden");
  }

  // 選択肢。options: [{ label, locked, lockedText, note }]。選んだ番号を返す
  function choose(options, { columns = 1 } = {}) {
    const box = $("choices");
    box.innerHTML = "";
    box.style.setProperty("--cols", columns);
    box.classList.remove("hidden");
    return new Promise((resolve) => {
      options.forEach((opt, i) => {
        const b = document.createElement("button");
        b.className = "choice";
        b.textContent = fillName(opt.label);
        if (opt.note) b.classList.add("done");
        if (opt.locked) {
          b.classList.add("locked");
          b.addEventListener("click", (e) => {
            e.stopPropagation();
            b.textContent = opt.lockedText || "選べません";
            b.classList.remove("shake");
            void b.offsetWidth;
            b.classList.add("shake");
          });
        } else {
          b.addEventListener("click", (e) => {
            e.stopPropagation();
            box.classList.add("hidden");
            box.innerHTML = "";
            addLog({ choice: fillName(opt.label) });
            resolve(i);
          });
        }
        box.appendChild(b);
      });
    });
  }

  // 文字の入力
  function input(placeholder) {
    const box = $("input-box");
    const field = $("input-field");
    field.value = "";
    field.placeholder = placeholder || "";
    box.classList.remove("hidden");
    field.focus();
    return new Promise((resolve) => {
      const done = (e) => {
        e.preventDefault();
        box.classList.add("hidden");
        box.removeEventListener("submit", done);
        resolve(field.value.trim());
      };
      box.addEventListener("submit", done);
    });
  }

  // 背景の上に置く画面（タイトル・地図・空挺など）
  function setStage(html) {
    $("stage").innerHTML = html || "";
    return $("stage");
  }

  // ボタンの並んだ画面で、どれかが押されるのを待つ。押された data-go の値を返す
  function waitButtons(root) {
    return new Promise((resolve) => {
      root.querySelectorAll("[data-go]").forEach((b) => {
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          if (b.disabled) return;
          resolve(b.dataset.go);
        });
      });
    });
  }

  function init() {
    preload();
    // 画面の向きや大きさが変わったら、一枚絵を置き直す
    window.addEventListener("resize", () => {
      if (currentBg) layoutBg(currentBg);
      if (currentCg) layoutCg(currentCg);
    });
    const advance = () => { if (onAdvance && !isLogOpen()) onAdvance(); };
    $("game").addEventListener("click", advance);

    // ログを開いている間は、会話が進まないようにクリックを止める
    $("log-btn").addEventListener("click", (e) => { e.stopPropagation(); openLog(); });

    // 早送りのオン・オフ
    $("ff-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      setFastForward(!fastForward);
    });

    // 音のオン・オフ（設定はセーブとは別にブラウザに覚えておく）
    const soundBtn = $("sound-btn");
    const showSound = () => {
      const on = BGM.isEnabled();
      soundBtn.textContent = on ? "♪ 音：オン" : "♪ 音：オフ";
      soundBtn.classList.toggle("off", !on);
      soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
    };
    soundBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      BGM.setEnabled(!BGM.isEnabled());
      showSound();
    });
    showSound();
    $("log").addEventListener("click", (e) => e.stopPropagation());
    $("log-close").addEventListener("click", closeLog);

    document.addEventListener("keydown", (e) => {
      if (isLogOpen()) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          closeLog();
        }
        return;
      }
      if (e.target.tagName === "INPUT") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    });
  }

  return {
    sleep, fillName, waitFirstImages, setBg, panBg, showIntro, showSign, hideSign, showCg, hideCg, flash, shake, toast,
    say, hideMsg, choose, input, setStage, waitButtons, init,
    clearLog, showLogButton
  };
})();
