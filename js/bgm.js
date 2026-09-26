// BGM（背景の音楽）。曲と場面の割り当ては data/world.js の GAME_DATA.bgm にある。
// - Web Audio API で読み込んで、隙間なくループさせる（<audio loop> だとMP3の継ぎ目に一瞬の隙間が入るため）
// - その曲が必要になったときに、その曲だけ読み込む。読み込み中は無音のまま進める（会話やタップは止めない）
// - 音がオフの人には曲を読み込まない。オン・オフはセーブとは別にブラウザに覚えておく
// - ブラウザの決まりで、プレイヤーが一度タップするまでは鳴らせない（「はじめから」「つづきから」で unlock する）
const BGM = (() => {
  const SOUND_KEY = "kuutei-sound";   // オン・オフを覚えておく場所
  const FADE = 1.0;                   // 曲を入れ替えるときにかける時間（秒）
  const RETRY_MAX = 2;                // 読み込みに失敗したとき、読み直す回数
  const RETRY_WAIT = 1500;            // 読み直すまでの間（ミリ秒）
  const SILENCE = 0.001;              // これより小さい音は「無音」とみなす（頭の無音を探すとき）

  let ctx = null;          // AudioContext（最初のタップのあとで作る）
  let master = null;       // 全体の音量
  let enabled = readSetting();
  let wanted = null;       // 今の場面で流したい曲の名前（null なら無音）
  let playing = null;      // 今鳴っている曲 { name, source, gain }
  const buffers = {};      // 読み込み済みの曲
  const loading = {};      // 読み込み中の曲 → Promise

  function readSetting() {
    try {
      return localStorage.getItem(SOUND_KEY) !== "off";
    } catch (e) {
      return true;
    }
  }

  function saveSetting() {
    try {
      localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
    } catch (e) { /* 覚えられなくても、今回だけの設定で続ける */ }
  }

  function tracks() {
    return (window.GAME_DATA.bgm && window.GAME_DATA.bgm.tracks) || {};
  }

  // 最初のタップのあとに呼ぶ。ここで初めて音を鳴らす準備をする
  function unlock() {
    if (!enabled) return;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return; // 音が出せないブラウザでは、ずっと無音
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = window.GAME_DATA.bgm.volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended" && !document.hidden) ctx.resume();
    if (wanted) start(wanted);
  }

  // 曲を読み込む（読み込み済みならそれを使う。読み込み中なら終わるのを待つ）
  function load(name) {
    if (buffers[name]) return Promise.resolve(buffers[name]);
    if (loading[name]) return loading[name];
    const t = tracks()[name];
    const attempt = (left) => fetch(t.file)
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.arrayBuffer();
      })
      .then((data) => new Promise((ok, ng) => ctx.decodeAudioData(data, ok, ng)))
      .catch((err) => {
        if (left <= 0) throw err;
        return new Promise((r) => setTimeout(r, RETRY_WAIT)).then(() => attempt(left - 1));
      });
    loading[name] = attempt(RETRY_MAX)
      .then((buf) => {
        buffers[name] = buf;
        return buf;
      })
      .catch(() => null) // 読み込めなかった曲は無音のまま（次に必要になったらもう一度試す）
      .finally(() => { delete loading[name]; });
    return loading[name];
  }

  // ループの範囲を決める
  // - loop（本当のループの長さ）を使う。MP3は前後に余白が付くことがあるので、ファイルの長さは使わない
  // - 頭に無音があり、そこからループの長さぶんがファイルに収まるなら、最初に音が出る位置から始める
  function loopRange(buf, loopLength) {
    const data = buf.getChannelData(0);
    let first = 0;
    while (first < data.length && Math.abs(data[first]) <= SILENCE) first++;
    let start = first / buf.sampleRate;
    if (start + loopLength > buf.duration) start = 0; // 収まらないときは頭から
    const end = Math.min(buf.duration, start + loopLength);
    return { start, end };
  }

  // 曲を流し始める（読み込みが終わってから）。前の曲は小さくしながら止める
  function start(name) {
    if (!ctx || !enabled) return;
    if (playing && playing.name === name) return;
    fadeOut();
    load(name).then((buf) => {
      if (!buf || wanted !== name || !enabled || (playing && playing.name === name)) return;
      const range = loopRange(buf, tracks()[name].loop);
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.loop = true;
      source.loopStart = range.start;
      source.loopEnd = range.end;
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + FADE);
      source.connect(gain);
      gain.connect(master);
      source.start(now, range.start);
      playing = { name, source, gain, range };
    });
  }

  function fadeOut() {
    if (!playing) return;
    const { source, gain } = playing;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + FADE);
    source.stop(now + FADE + 0.05);
    playing = null;
  }

  // 流したい曲を決める（null で無音）。同じ曲ならそのまま流し続ける
  function play(name) {
    wanted = name && tracks()[name] ? name : null;
    if (!ctx || !enabled) return;
    if (wanted) start(wanted);
    else fadeOut();
  }

  // 場面の名前から曲を決める（割り当ては data/world.js の GAME_DATA.bgm.scenes）
  function scene(sceneName) {
    const scenes = window.GAME_DATA.bgm.scenes;
    play(sceneName in scenes ? scenes[sceneName] : wanted);
  }

  function setEnabled(on) {
    enabled = on;
    saveSetting();
    if (!on) {
      if (ctx) {
        fadeOut();
        setTimeout(() => { if (!enabled && ctx) ctx.suspend(); }, FADE * 1000 + 100);
      }
    } else {
      unlock(); // タップの中で呼ばれるので、ここで鳴らし始められる
    }
    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  // 別のタブに切り替えたり画面を閉じたりしたら止めて、戻ったら続きから鳴らす
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (enabled) ctx.resume();
  });

  // テスト用：今の様子
  function debugState() {
    return {
      enabled,
      wanted,
      playing: playing ? playing.name : null,
      range: playing ? playing.range : null,
      loaded: Object.keys(buffers),
      ctxState: ctx ? ctx.state : null
    };
  }

  return { unlock, play, scene, setEnabled, isEnabled, loopRange, debugState };
})();
