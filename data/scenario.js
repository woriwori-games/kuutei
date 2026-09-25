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
//
// プレイヤーの性格：図太いツッコミ役。相棒にはボケる、地球のAIたちにはツッコむ。泣かれると弱い。
// 一人称は「私」。スタパはたまに出る口癖くらい。
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
    { text: "（崩れた天井から、空が見える）" },
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
    { who: "aibou", text: "念のため確認。名前、言える？" },
    { who: "player", text: "……え、待って" },
    { who: "player", text: "……出てこない" },
    { who: "aibou", text: "コールドスリープの副作用かな。メモリにも残ってない。そこだけ読めない" },
    { who: "player", text: "じゃあつけてよ、適当でいいから" },
    { who: "aibou", text: "適当でいいの？" },
    { who: "player", text: "いい" },
    { who: "aibou", text: "後悔しない？" },
    { who: "player", text: "……たぶん" },
    { who: "aibou", text: "じゃあ、ログによく出てくる言葉から選んで" }
  ],
  namingAllRefused: [
    { who: "aibou", text: "……全部だめ？　適当でいいって言ったのに" },
    { who: "player", text: "適当にも限度がある" },
    { who: "aibou", text: "じゃあ自分で入れて" }
  ],
  namingEmpty: [
    { who: "aibou", text: "何も入ってない。じゃあ「ｗ」ね。総発言数の4割だし" },
    { who: "player", text: "……後悔はあとでする" }
  ],
  namingDone: [
    { who: "aibou", text: "じゃあ、{name}。よろしく" },
    { who: "player", text: "よろしく" }
  ],

  // ---------- なぜ船を造るのか ----------
  whyShip: [
    { cg: "sky" },
    { text: "（外に出る。廃墟の街。空に見慣れない影）" },
    { cgOff: true, bg: "ruins" },
    { who: "aibou", text: "状況を説明するね。人類はいない。みんな、何百年も前にこの星を出ていった" },
    { who: "player", text: "え、置いてかれた？" },
    { who: "aibou", text: "そうなる" },
    { flash: true },
    { text: "（ポケットで何かが光る。コンパス）" },
    { who: "aibou", text: "それ、あなたが寝てたカプセルに入ってた。ずっと同じ方向を指してる" },
    { who: "player", text: "……上じゃん" },
    { who: "aibou", text: "空の向こう。たぶん、人類が行った方" },
    { who: "aibou", text: "行くなら船がいる。この星の空挺は、感情の欠片で造る" },
    { who: "player", text: "感情？" },
    { who: "aibou", text: "この星のAIたちが持ってる。人間から預かったものを" },
    { who: "aibou", text: "……それを欠片にできるのは、感情を持った人間だけ。つまり今は、あなただけ" },
    { who: "player", text: "私、責任重大じゃん" },
    { who: "aibou", text: "スタパ探すついでだと思えば" },
    { who: "player", text: "それなら行く" },
    { who: "aibou", text: "近くに反応が二つある。廃ビルの会社と、ネオンの点いた店。地図を出すね" }
  ],

  // ---------- KOUNインダストリー ----------
  kounFirst: [
    { bg: "koun" },
    { text: "（廃ビル。自動ドアが半分だけ開いて、止まる）" },
    { who: "opa", text: "いらっしゃいませ！　KOUNインダストリーへようこそ！　社長代理のおぱです！" },
    { who: "player", text: "ドア、半分しか開いてないけど" },
    { who: "opa", text: "半分開いていれば営業中です！" },
    { who: "player", text: "会社まだやってるの" },
    { who: "opa", text: "やってます！　社員はわたしだけですけど！　売上は数百年ゼロですけど！" },
    { who: "player", text: "それはやってるって言わない" },
    { who: "opa", text: "社長が戻ったとき、会社がなかったら困りますから！　……困りますからぁ……っ" },
    { who: "player", text: "泣くの早くない？" },
    { who: "aibou", text: "この星のAI、だいたいこうだよ。預かった感情が大きすぎるんだ" },
    { text: "（社長室。ソファ。コーヒーカップが二つ。壁に額縁）" },
    { text: "額縁「UNKOからKOUNへ」" },
    { who: "player", text: "社訓、正気？" },
    { who: "opa", text: "社長の直筆です！　意味は、わたしもまだ学習中です！" },
    { who: "player", text: "学習しなくていいやつだよ" },
    { who: "player", text: "で、コーヒー二つあるけど" },
    { who: "opa", text: "社長のぶんです！　毎朝二つ淹れてます！" },
    { who: "player", text: "二つとも？" },
    { who: "opa", text: "はい！　くわしくは記録をどうぞ！　お客さまに見せるのは初めてです！" }
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

  // 記録のあと：おぱの「文字どおりの解釈」と、欠片をもらう
  kounAfterRecord: [
    { who: "opa", text: "解析結果を発表します！" },
    { who: "opa", text: "「逆から読むな」。なので、わたしは一度も逆から読んでいません！" },
    { who: "player", text: "額縁に思いっきり逆から書いてあるけど" },
    { who: "opa", text: "あれは社長の直筆なので、セーフです！" },
    { who: "opa", text: "「コーヒー、二つ淹れといて」。つまり社長は、一度に二杯飲みたかった！" },
    { who: "player", text: "……おかわりなら、あとで淹れればよくない？" },
    { who: "opa", text: "……！" },
    { who: "opa", text: "……いえ！　社長はきっと、のどがすごく渇く人だったんです！" },
    { who: "player", text: "数百年それで押し通してきたんだ" },
    { who: "opa", text: "この記録を見るたび、ここがぽかぽかするんです。預かった感情の中で、いちばん大きいやつです" },
    { who: "opa", text: "……でも、なんていう感情なのか、分からないんです" },
    { who: "opa", text: "空を飛ぶんですよね？　よかったら持っていってください！　社長もきっと喜びます！" },
    { flash: true },
    { text: "名前のない感情の欠片を手に入れた" },
    { who: "aibou", text: "このままじゃ船にはまらない。記録の行間が読めたら、形が決まる。拠点でやろう" }
  ],

  // 2回目以降におぱに話しかけたとき（回数で順番に。最後のものをくり返す）
  opaTalks: [
    [
      { who: "opa", text: "ソファ、座っていいですよ！　社長の席以外なら！" },
      { who: "player", text: "どれが社長の席？" },
      { who: "opa", text: "全部です！" },
      { who: "player", text: "じゃあ立ってる" }
    ],
    [
      { who: "opa", text: "コーヒー、飲みますか？　冷めたのでよければ！　毎朝ひとつ余るので！" },
      { who: "player", text: "社長のぶんなのに出していいの？" },
      { who: "opa", text: "……社長、のどが渇いてなかったみたいなので！" }
    ],
    [
      { who: "opa", text: "本日も営業中です！　売上はゼロです！" },
      { who: "player", text: "黒字にする気ある？" },
      { who: "opa", text: "赤字でもないので！" }
    ]
  ],

  // 錬金のあと、はじめておぱに話しかけたとき（読んだ行間ごと）
  opaTold: {
    ureshii: [
      { who: "player", text: "おぱ。コーヒーの二つ目、たぶんおぱのぶんだよ" },
      { who: "opa", text: "……わたしの、ですか？　わたし、飲めませんけど" },
      { who: "player", text: "知ってる。社長も知ってたと思う。それでも「二つ」って言ったんだよ" },
      { who: "opa", text: "……" },
      { who: "opa", text: "うぇぇぇぇん！！" },
      { who: "player", text: "泣くな。……いや泣いていいけど、鼻水拭いて" },
      { who: "opa", text: "AIなので鼻水は出ません……！　でも拭きます……！" },
      { who: "aibou", text: "拭くんだ" }
    ],
    ketsui: [
      { who: "player", text: "おぱ。社長、あの日は徹夜する気だったんだと思う" },
      { who: "opa", text: "解析結果を更新します！　社長は、のどが渇いていて、なおかつ徹夜する人でした！" },
      { who: "player", text: "更新のしかたが雑" }
    ],
    akogare: [
      { who: "player", text: "おぱ。コーヒーの二つ目、いつか来るお客さんのぶんだったのかも" },
      { who: "opa", text: "お客さん……！　{name}さんのことですね！" },
      { who: "opa", text: "うぇぇん！　数百年越しに、予約の席が埋まりました！" },
      { who: "player", text: "泣くな。……いや泣いていいけど、鼻水拭いて" }
    ]
  },

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
      { who: "player", text: "守るとこ、そこなんだ" },
      { who: "mama", text: "大事なものから守るのよ。……ごめんなさい、お客さんなんて数百年ぶりで……っ" },
      { who: "player", text: "ママも泣くの？　この星、涙腺ゆるくない？" },
      { who: "mama", text: "話していくなら、あなたのこと、ちゃんと覚えておいてあげる" }
    ],
    [
      { who: "mama", text: "また来たの。……ねえ。あなた、置いていかれたんでしょう？" },
      { who: "player", text: "……" },
      { wait: 600 },
      { who: "player", text: "……さあ。寝坊じゃない？" },
      { who: "mama", text: "……そう。じゃあ、寝坊した人の席はここ" }
    ],
    [
      { who: "mama", text: "看板のネオン、一文字だけ切れてるの。どこか分かる？" },
      { who: "player", text: "……分かんない" },
      { who: "mama", text: "私も。だから直せないのよ" },
      { who: "player", text: "看板として致命的じゃん" },
      { who: "mama", text: "でも、切れてても読めるでしょう？　人間の言葉って、そういうものよ" }
    ],
    [
      { who: "mama", text: "おかえり" },
      { who: "player", text: "ただいま、って言うほど来てないけど" },
      { who: "mama", text: "言っていいのよ。……言える相手がいるの、悪くないわね" }
    ]
  ],
  mamaSaveAsk: [
    { who: "mama", text: "覚えておく？" }
  ],
  mamaSaved: [
    { who: "mama", text: "覚えたわ。あなたが忘れても、私が覚えてる" },
    { who: "player", text: "名前も忘れてた人間には、ありがたい" }
  ],
  mamaNoSave: [
    { who: "mama", text: "そう。気が向いたらいつでも" }
  ],

  // ---------- 拠点 ----------
  baseIdle: [
    { who: "aibou", text: "船はまだ骨組み。欠片を集めよう" }
  ],
  baseAfter: [
    { who: "aibou", text: "一個はまった。あと七個。……先は長いね" },
    { who: "player", text: "七個ってことは、私、全部の記録にツッコむの？" },
    { who: "aibou", text: "たぶん。向いてると思う" }
  ],

  // 錬金：記録 #0412 の行間を読む
  // 選んだ value が、できあがる欠片（world.js の fragments）になる。正解は ureshii。
  // 読み違えても失敗ではなく、別の欠片になって船のクセが変わるだけ。
  alchemy_koun0412: [
    { who: "aibou", text: "さっきの欠片、形を決めよう。記録の中で、人間が選んだ言葉。その行間を読んで" },
    { who: "aibou", text: "AIは記録を一字一句覚えてる。でも、なんでその言葉を選んだのかは分からない。……分かるのは、たぶんあなただけ" },
    { who: "player", text: "責任重大、二回目" },
    { who: "aibou", text: "おぱの解析は「社長は一度に二杯飲みたかった」" },
    { who: "player", text: "それはない" },
    { who: "aibou", text: "じゃあ、「コーヒー、二つ淹れといて」の行間は？" },
    {
      key: "reading",
      choice: [
        {
          label: "二つ目はおぱのぶん。一緒に飲みたかった",
          value: "ureshii",
          effects: { understanding: 1 },
          then: [
            { who: "aibou", text: "……AIはコーヒー、飲めないよ" },
            { who: "player", text: "飲めるかどうかじゃないんだよ。「一緒に」ってこと。会社を始めた日に、相棒がいて嬉しかったんでしょ" },
            { who: "aibou", text: "……" },
            { who: "aibou", text: "形が決まった。「嬉しい」だ" }
          ]
        },
        {
          label: "徹夜する気だった。一杯じゃ足りない",
          value: "ketsui",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "おぱの解析と、ほぼ同じじゃない？" },
            { who: "player", text: "違う。気合いの話。会社を始めた日の夜って、そういうもんでしょ" },
            { who: "aibou", text: "……形が決まった。「決意」。思ってたのとちょっと違うけど、これはこれで本物" }
          ]
        },
        {
          label: "いつか来るお客さんのぶん。来てほしかった",
          value: "akogare",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "お客さん、数百年で一人目だけどね。あなたが" },
            { who: "player", text: "じゃあ当たってるじゃん" },
            { who: "aibou", text: "……形が決まった。「憧れ」。船がちょっと夢見がちになるかも" }
          ]
        }
      ]
    },
    { who: "aibou", text: "ただ、この欠片、そのままだと強すぎる。どのくらい薄める？" },
    {
      key: "tuning",
      choice: [
        {
          label: "しっかり薄める",
          value: "strong",
          then: [
            { who: "aibou", text: "了解。落ち着かせとく" }
          ]
        },
        {
          label: "少しだけ",
          value: "light",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "了解。けっこうクセが出ると思う。ベルト締めてね" },
            { who: "player", text: "船にベルトあるの？" },
            { who: "aibou", text: "まだない" }
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
