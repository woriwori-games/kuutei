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

  function fillName(text) {
    const name = Game.state.playerName || "？？？";
    return text.replace(/\{name\}/g, () => name);
  }

  // ---------- 画像 ----------
  // 画像が読み込めるか調べて、読み込めたら ok() を呼ぶ。結果は覚えておく（true / false）
  const imgCache = {};
  function whenLoaded(src, ok) {
    if (imgCache[src] === true) return ok();
    if (imgCache[src] === false) return;
    const img = new Image();
    img.onload = () => { imgCache[src] = true; ok(); };
    img.onerror = () => { imgCache[src] = false; };
    img.src = src;
  }

  // 使う画像を先に読み込んでおく（場面が変わるたびに仮の四角がチラつかないように）
  function preload() {
    const noop = () => {};
    for (const id in D.characters) {
      const faces = D.characters[id].faces || {};
      for (const f in faces) whenLoaded(faces[f], noop);
    }
    for (const id in D.backgrounds) if (D.backgrounds[id].image) whenLoaded(D.backgrounds[id].image, noop);
    for (const id in D.cgs) if (D.cgs[id].image) whenLoaded(D.cgs[id].image, noop);
  }

  // まず仮の画面（色＋文字）を出し、画像が読み込めたら差し替える。読み込めなければ仮のまま
  function paint(el, def, labelEl, labelText) {
    el.dataset.src = def.image || "";
    el.style.backgroundImage = "";
    el.style.backgroundColor = def.color || "#000";
    el.style.backgroundPosition = def.pos || "center";
    labelEl.textContent = labelText || "";
    if (!def.image) return;
    whenLoaded(def.image, () => {
      if (el.dataset.src !== def.image) return; // もう別の背景に変わっていたら何もしない
      el.style.backgroundImage = `url("${def.image}")`;
      labelEl.textContent = "";
    });
  }

  function setBg(id) {
    const def = D.backgrounds[id] || D.backgrounds.black;
    paint($("bg"), def, $("bg-label"), def.label);
  }

  // 背景を from の位置から to の位置まで、ms ミリ秒かけてゆっくり流す（終わるまで待つ）
  // 画像が読み込めないときは流さずに、そのまま to の位置で止まった状態にする
  async function panBg(id, from, to, ms) {
    const def = D.backgrounds[id];
    setBg(id);
    const el = $("bg");
    if (!def.image) return;
    const loaded = await new Promise((resolve) => {
      whenLoaded(def.image, () => resolve(true));
      setTimeout(() => resolve(imgCache[def.image] === true), 2000);
    });
    if (!loaded) return;
    el.style.transition = "none";
    el.style.backgroundPosition = from;
    void el.offsetWidth; // いったん from の位置で描いてから流し始める
    el.style.transition = `background-position ${ms}ms ease-in-out`;
    el.style.backgroundPosition = to;
    await sleep(ms);
    el.style.transition = "";
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

  function showCg(id) {
    const def = D.cgs[id];
    paint($("cg"), def, $("cg-caption"), def.caption);
    $("cg").classList.add("show");
  }

  function hideCg() {
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

  // 顔アイコンを塗る。まず仮の四角＋文字、画像が読み込めたら差し替える
  function paintFace(el, c, face) {
    const src = facePath(c, face);
    el.dataset.src = src || "";
    el.classList.remove("has-image");
    el.style.backgroundColor = c.color;
    el.style.backgroundImage = `linear-gradient(135deg, transparent 70%, ${c.accent} 70%)`;
    el.textContent = c.label;
    if (!src) return;
    whenLoaded(src, () => {
      if (el.dataset.src !== src) return;
      el.classList.add("has-image");
      el.style.backgroundColor = "";
      el.style.backgroundImage = `url("${src}")`;
      el.textContent = "";
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

  function showLogButton(show) {
    $("log-btn").classList.toggle("hidden", !show);
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
  async function say(who, text, face) {
    const msg = $("msg");
    const body = $("text");
    const c = who && D.characters[who];
    $("speaker").textContent = c ? fillName(c.name) : "";
    setFace(who, face);
    msg.classList.remove("hidden");
    msg.classList.toggle("narration", !c);
    msg.classList.remove("waiting");

    const full = fillName(text);
    addLog({ who: c ? who : null, face, name: c ? fillName(c.name) : "", text: full });
    let shown = 0;
    let skip = false;
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
    await new Promise((resolve) => {
      onAdvance = () => {
        onAdvance = null;
        resolve();
      };
    });
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
    const advance = () => { if (onAdvance && !isLogOpen()) onAdvance(); };
    $("game").addEventListener("click", advance);

    // ログを開いている間は、会話が進まないようにクリックを止める
    $("log-btn").addEventListener("click", (e) => { e.stopPropagation(); openLog(); });
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
    sleep, fillName, setBg, panBg, showSign, hideSign, showCg, hideCg, flash, shake, toast,
    say, hideMsg, choose, input, setStage, waitButtons, init,
    clearLog, showLogButton
  };
})();
