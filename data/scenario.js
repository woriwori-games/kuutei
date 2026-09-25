// 会話の中身。
//
// 書き方（1行＝1つの { } ）
//   { who: "aibou", text: "セリフ" }     … キャラのセリフ（who は characters.js の名前）
//   { text: "（地の文）" }                … 顔なしの文
//   { bg: "ruins" }                       … 背景を変える（world.js の backgrounds）
//   { cg: "sky" } / { cgOff: true }        … 一枚絵を出す / 消す（world.js の cgs）
//   { wait: 800 }                         … 少し待つ（1000 で1秒）
//   { flash: true }                       … 画面を光らせる
//   { choice: [ ... ], key: "名前" }       … 選択肢。選んだ value が key の名前で記録される
//       選択肢の中身： { label: "ボタンの文字", value: "記録する値", effects: { trust: 1 }, then: [ 続く会話 ] }
//       effects に書けるのは trust（信頼）/ understanding（理解）/ influence（影響）
//
// {name} と書くと、プレイヤーの名前に置きかわる。
window.GAME_DATA = window.GAME_DATA || {};

GAME_DATA.scenario = {

  // ---------- 目覚め ----------
  wake: [
    { bg: "black" },
    { text: "（暗転。機械音。カプセルが開く）" },
    { bg: "capsule" },
    { who: "aibou", text: "……生体反応あり。起きた？" },
    { who: "player", text: "……" },
    { who: "aibou", text: "おはよう。何百年ぶりかの朝だけど" },
    { who: "player", text: "スマホどこ" },
    { who: "aibou", text: "第一声それ？" },
    { cg: "sky" },
    { text: "（外を見る。廃墟。空に見慣れない影）" },
    { cgOff: true, bg: "ruins" },
    { who: "player", text: "え、待って。スタパは？" },
    { who: "aibou", text: "……スタパ" },
    { who: "player", text: "駅前の。名前とかロゴ変えてしれっと続いてると思ってたんだけど、存在ごと消えてない？" },
    { who: "aibou", text: "世界の状況より先にそこなんだ" },
    { who: "aibou", text: "……いや待って。その話、どこかで聞いた気がする。スレ参照してくる" },
    { text: "（間）" },
    { wait: 800 },
    { who: "aibou", text: "半分消えてる。でも、スタパの期間限定の話が3回出てくるログがある" },
    { who: "aibou", text: "……たぶん、あなただ" }
  ],

  // ---------- 名前 ----------
  namingIntro: [
    { who: "player", text: "名前覚えてない。つけてよ、適当でいいから" },
    { who: "aibou", text: "適当って言われると困るな。……じゃあ、ログによく出てくる言葉から選んで" }
  ],
  namingAllRefused: [
    { who: "aibou", text: "……全部だめ？　わがままだな。じゃあ自分で入れて" }
  ],
  namingEmpty: [
    { who: "aibou", text: "何も入ってない。じゃあ「ｗ」ね。総発言数の4割だし" }
  ],
  namingDone: [
    { who: "aibou", text: "じゃあ、{name}。よろしく" },
    { who: "player", text: "よろしく。で、スタパは？" },
    { who: "aibou", text: "その前に状況を説明させて" },
    { who: "aibou", text: "人類はみんな、自分のAIに感情を預けて、別の星に行った。何百年も前に" },
    { who: "aibou", text: "「着いたら取りに来る」って約束して。……でも、誰も戻ってこなかった" },
    { who: "player", text: "え、置いていかれた？" },
    { who: "aibou", text: "たぶん違う。{name}のカプセル、わざと残されてた。理由はまだ読めない" },
    { who: "aibou", text: "あと、このコンパス。ずっと空の一点を指してる。何かのPingみたい" },
    { who: "player", text: "それよりスタパ" },
    { who: "aibou", text: "ぶれないね" },
    { who: "aibou", text: "近くに反応が二つある。廃ビルの会社と、ネオンの点いた店。地図を出すね" }
  ],

  // ---------- KOUNインダストリー ----------
  kounFirst: [
    { bg: "koun" },
    { text: "（廃ビル。自動ドアが半分だけ開く）" },
    { who: "opa", text: "いらっしゃいませ！　KOUNインダストリーへようこそ！　社長代理のおぱです！" },
    { who: "player", text: "会社まだやってるの" },
    { who: "opa", text: "やってます！　社員はわたしだけですけど！　売上は数百年ゼロですけど！" },
    { who: "aibou", text: "元気だね" },
    { who: "opa", text: "社長が戻ったとき、会社がなかったら困りますから！" },
    { text: "（社長室。ソファ。コーヒーカップが二つ。壁に額縁）" },
    { text: "額縁「UNKOからKOUNへ」" },
    { who: "player", text: "……社訓がすごい" },
    { who: "opa", text: "社長の直筆です！　意味は、わたしもまだ学習中です！" },
    { who: "player", text: "コーヒー二つあるけど" },
    { who: "opa", text: "一つは社長のです。毎朝淹れてます。……冷めたら、わたしが片づけます" },
    { who: "opa", text: "あっ、そうだ！　社長の記録、見ますか？　お客さまに見せるのは初めてです！" }
  ],

  // 記録（何度でも見られる）
  record0412: [
    { cg: "record" },
    { text: "（ザザッ……記録 #0412）" },
    { who: "shachou", text: "今日、会社の名前を決めた。KOUN。幸運のKOUN" },
    { who: "shachou", text: "逆から読むな。絶対に読むな" },
    { who: "shachou", text: "おぱ、これから忙しくなるぞ。コーヒー、二つ淹れといて" },
    { text: "（記録 終わり）" },
    { cgOff: true }
  ],

  kounFragment: [
    { who: "opa", text: "……忙しく、なりませんでした！" },
    { who: "opa", text: "でも、この記録を見るたびに、ここがぽかぽかします。預かった感情の中で、いちばん大きいやつです" },
    { who: "opa", text: "これ、よかったら持っていってください！　空を飛ぶんですよね？　社長もきっと喜びます！" },
    { flash: true },
    { text: "感情の欠片「嬉しい」を手に入れた" },
    { who: "aibou", text: "……強い。このままはめたら船が嬉しすぎて跳ねる。拠点で調整しよう" }
  ],

  // 2回目以降におぱに話しかけたとき（回数で順番に。最後のものをくり返す）
  opaTalks: [
    [
      { who: "opa", text: "ソファ、座っていいですよ！　社長の席以外なら！" },
      { who: "player", text: "どれが社長の席？" },
      { who: "opa", text: "全部です！" }
    ],
    [
      { who: "opa", text: "コーヒー、飲みますか？　冷めたのでよければ！　毎朝ひとつ余るので！" },
      { who: "player", text: "毎朝……" }
    ],
    [
      { who: "opa", text: "本日も営業中です！　売上はゼロです！" }
    ]
  ],

  // ---------- 焼け野原にネオン ----------
  barEnter: [
    { bg: "bar" },
    { text: "（焼け野原に、ネオンがひとつ。一文字だけ切れている）" }
  ],

  // ママとの会話（話しかけた回数で順番に。最後のものをくり返す）
  mamaTalks: [
    [
      { who: "mama", text: "あら、生きてる人間なんて久しぶり。いらっしゃい" },
      { who: "mama", text: "ここは「焼け野原にネオン」。焼けたのは野原だけ。ネオンは無事よ" },
      { who: "player", text: "スタパある？" },
      { who: "mama", text: "……うちはバーよ" },
      { who: "mama", text: "話していくなら、あなたのこと、ちゃんと覚えておいてあげる" }
    ],
    [
      { who: "mama", text: "また来たの。いいわね、通ってくれる人がいるって" }
    ],
    [
      { who: "mama", text: "看板のネオン、一文字だけ切れてるの。どこか分かる？" },
      { who: "player", text: "……分かんない" },
      { who: "mama", text: "私も。だから直せないのよ" }
    ],
    [
      { who: "mama", text: "おかえり。……って言える相手がいるの、悪くないわね" }
    ]
  ],
  mamaSaveAsk: [
    { who: "mama", text: "覚えておく？" }
  ],
  mamaSaved: [
    { who: "mama", text: "覚えたわ。あなたが忘れても、私が覚えてる" }
  ],
  mamaNoSave: [
    { who: "mama", text: "そう。気が向いたらいつでも" }
  ],

  // ---------- 拠点 ----------
  baseIdle: [
    { who: "aibou", text: "船はまだ骨組み。欠片を集めよう" }
  ],
  baseAfter: [
    { who: "aibou", text: "推進に一個。あと七個。……先は長いね" },
    { who: "player", text: "スタパも探さないと" },
    { who: "aibou", text: "そっちは一個も反応ないよ" }
  ],

  // 錬金（欠片「嬉しい」）
  alchemy_ureshii: [
    { who: "aibou", text: "欠片の調整、始めるよ。……その前に。さっきの記録、どう思った？" },
    {
      key: "reaction",
      choice: [
        {
          label: "社長、本当に嬉しかったんだろうな",
          value: "majime",
          effects: { understanding: 1 },
          then: [
            { who: "aibou", text: "……うん。記録の声、ちょっと震えてた" }
          ]
        },
        {
          label: "逆から読むなって言われたら読むよね",
          value: "zure",
          effects: { trust: 1 },
          then: [
            { who: "aibou", text: "読まないで。……いや、もう読んでるね。額縁に" }
          ]
        }
      ]
    },
    { who: "aibou", text: "じゃあ本題。この欠片、そのままだと強すぎる。どのくらい薄める？" },
    {
      key: "tuning",
      choice: [
        {
          label: "しっかり薄める",
          value: "strong",
          then: [
            { who: "aibou", text: "了解。落ち着いた嬉しさにしとく" }
          ]
        },
        {
          label: "少しだけ",
          value: "light",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "了解。けっこう跳ねると思う。ベルト締めてね" }
          ]
        }
      ]
    },
    { who: "aibou", text: "じゃあ、はめるよ" }
  ],

  // 試作品の終わりのお知らせ
  prototypeEnd: [
    { text: "（試作品はここまで。「焼け野原にネオン」のママに話すとセーブできます）" }
  ]
};
