// 画面の部品：会話ウィンドウ、選択肢、背景、一枚絵、演出など。
const UI = (() => {
  const $ = (id) => document.getElementById(id);
  const D = window.GAME_DATA;
  const TYPE_SPEED = 35; // 一文字にかける時間（ミリ秒）

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

  function toast(text) {
    const el = $("toast");
    el.textContent = text;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  }

  function setFace(who) {
    const face = $("face");
    const c = who && D.characters[who];
    if (!c) {
      face.hidden = true;
      return;
    }
    face.hidden = false;
    face.style.backgroundColor = c.color;
    face.style.backgroundImage = c.image
      ? `url("${c.image}")`
      : `linear-gradient(135deg, transparent 70%, ${c.accent} 70%)`;
    face.textContent = c.image ? "" : c.label;
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
    const advance = () => { if (onAdvance) onAdvance(); };
    $("game").addEventListener("click", advance);
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    });
  }

  return {
    sleep, fillName, setBg, showCg, hideCg, flash, toast,
    say, hideMsg, choose, input, setStage, waitButtons, init
  };
})();
