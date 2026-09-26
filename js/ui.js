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

  // 仮の四角（色＋文字）か、画像を当てはめる
  function paint(el, def) {
    el.style.backgroundImage = "";
    el.style.backgroundColor = def.color || "#000";
    if (def.image) {
      el.style.backgroundImage = `url("${def.image}")`;
    }
  }

  function setBg(id) {
    const def = D.backgrounds[id] || D.backgrounds.black;
    const el = $("bg");
    paint(el, def);
    $("bg-label").textContent = def.image ? "" : def.label;
  }

  function showCg(id) {
    const def = D.cgs[id];
    const el = $("cg");
    paint(el, def);
    $("cg-caption").textContent = def.image ? "" : def.caption;
    el.classList.add("show");
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

  // 顔アイコン（仮の四角＋文字か、画像）を塗る
  function paintFace(el, c) {
    el.style.backgroundColor = c.color;
    el.style.backgroundImage = c.image
      ? `url("${c.image}")`
      : `linear-gradient(135deg, transparent 70%, ${c.accent} 70%)`;
    el.textContent = c.image ? "" : c.label;
  }

  function setFace(who) {
    const face = $("face");
    const c = who && D.characters[who];
    face.hidden = !c;
    if (c) paintFace(face, c);
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
          paintFace(face, c);
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
  async function say(who, text) {
    const msg = $("msg");
    const body = $("text");
    const c = who && D.characters[who];
    $("speaker").textContent = c ? fillName(c.name) : "";
    setFace(who);
    msg.classList.remove("hidden");
    msg.classList.toggle("narration", !c);
    msg.classList.remove("waiting");

    const full = fillName(text);
    addLog({ who: c ? who : null, name: c ? fillName(c.name) : "", text: full });
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
    sleep, fillName, setBg, showCg, hideCg, flash, shake, toast,
    say, hideMsg, choose, input, setStage, waitButtons, init,
    clearLog, showLogButton
  };
})();
