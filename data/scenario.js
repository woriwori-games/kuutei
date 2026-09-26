// 会話の中身。
//
// 書き方（1行＝1つの { } ）
//   { who: "aibou", text: "セリフ" }     … キャラのセリフ（who は characters.js の名前）
//   { who: "player", face: "tsukkomi", text: "セリフ" } … その1行だけ表情を変える（表情の名前は characters.js の faces）
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
// 一人称は「私」。スタパはたまに出る口癖くらい（冒頭で出すのは目覚めの一回だけ）。
// コールドスリープの自覚はない（普通に寝て起きたつもり）。眠る直前に誰かに言われた声だけ、ぼんやり残っている。
// 地球のAIたちは人間の深読みグセまで学習していて、何でも重く読みすぎる。
// プレイヤーは「ちょうどいい温度」で読める。ただし、たまにAIの深読みの方が当たっていることもある。
//
// ツッコミのルール：ツッコむのは深読みであって、相手じゃない。
// ツッコんだら、相手の気持ちは拾う。否定だけで終わらせない。
window.GAME_DATA = window.GAME_DATA || {};

// 錬金の最後（薄め具合を選んで、はめる）。どの欠片でも同じなので、ここに一回だけ書いて使い回す
// 使うところでは ...TUNING_STEPS と書く
const TUNING_STEPS = [
  { cg: "renkin", who: "aibou", text: "ただ、この欠片、そのままだと強すぎる。どのくらい薄める？" },
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
          { who: "aibou", text: "了解。少しだけにしとく" }
        ]
      }
    ]
  },
  { who: "aibou", text: "じゃあ、はめるよ" },
  { cgOff: true }
];

GAME_DATA.scenario = {

  // ---------- 目覚め ----------
  wake: [
    { bg: "black" },
    { text: "（暗転。機械音。カプセルが開く）" },
    { bg: "capsule" },
    { cg: "wake", who: "aibou", text: "……生体反応あり。起きた？" },
    { who: "player", text: "……ん" },
    { who: "aibou", text: "おはよう。何百年ぶりかの朝だけど" },
    { who: "player", text: "……まぶし……" },
    { who: "player", text: "……あと五分……" },
    { text: "（また寝る）" },
    { who: "aibou", text: "寝た" },
    { text: "（間）" },
    { wait: 800 },
    { who: "aibou", text: "起きて" },
    { who: "player", text: "……うるさい……" },
    { cgOff: true },
    { intro: "aibou" }, // 初登場の紹介カット（全身の絵と名前を短く見せる）
    // プレイヤーはコールドスリープの自覚がない。普通に寝て起きたつもりでいる
    { text: "（ゆっくり体を起こす。窓の外を見る）" },
    { text: "（向かいの崩れたビルに、色あせた緑の看板。半分つたに埋もれている）" },
    { who: "player", text: "……え" },
    { who: "player", text: "スタパ、潰れてる" },
    { who: "aibou", text: "そこなんだ" },
    { who: "player", text: "だって昨日そこで買ったのに" },
    { who: "aibou", text: "昨日じゃない" },
    { who: "player", text: "……は？" },
    { who: "aibou", text: "潰れたのはスタパだけじゃない。……外、ちゃんと見て" },
    { cg: "sky" },
    { text: "（廃墟の街。空に見慣れない影）" },
    { cgOff: true, bg: "ruins" },
    { who: "player", text: "……" },
    { who: "player", face: "tsukkomi", text: "……え、待って。何これ" },
    { who: "aibou", text: "……その、世界より先に自分の生活圏を気にする感じ。どこかで知ってる" },
    { text: "（間）" },
    { wait: 800 },
    { who: "aibou", face: "smile", text: "……たぶん、あなただ" }
  ],

  // ---------- 名前 ----------
  namingIntro: [
    { who: "aibou", text: "念のため確認。名前、言える？" },
    { who: "player", text: "……あれ" },
    { who: "player", text: "……出てこない" },
    { who: "aibou", text: "コールドスリープの副作用かな。メモリにも残ってない。そこだけ読めない" },
    { who: "player", text: "……コールド、何？" },
    { who: "aibou", text: "……あとで説明する。今は名前" },
    { who: "player", face: "tsukkomi", text: "雑" },
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
    { bg: "ruins" },
    { text: "（外に出る）" },
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
    { who: "player", face: "tsukkomi", text: "私、責任重大じゃん" },
    { who: "aibou", text: "行かないなら、ここで二度寝しててもいいけど" },
    { who: "player", text: "……行く" },
    { who: "aibou", text: "じゃあ、先に見せたいものがある" }
  ],

  // ---------- 格納庫 ----------
  // 空挺の骨組みは、プレイヤーが寝ている間に相棒が作っていた（重く説明しない）
  hangar: [
    { bg: "base" },
    { text: "（格納庫。骨組みだけの空挺がある）" },
    { who: "aibou", text: "空挺。形はある。でも浮かない。動かすものがない" },
    { cg: "hangar2", who: "player", text: "この骨組み、誰が作ったの" },
    { who: "aibou", text: "自分。暇だったから" },
    { who: "player", text: "どれくらいかけて？" },
    { who: "aibou", text: "……数えるの、途中でやめた" },
    { who: "player", text: "……" },
    { cgOff: true },
    { who: "aibou", text: "で、欠片の話だけど" },
    { text: "（足もとに、古いメモが落ちている。拾うと、手の中でかすかに光る）" },
    { flash: true },
    { text: "メモ「牛乳　卵　あと、あいつの好きなやつ」" },
    { who: "aibou", text: "それ。人の気持ちが残ってる記録に、感情を持った人間が触ると、そうなる。それを固めたのが欠片" },
    { who: "player", text: "買い物メモだよ、これ" },
    { who: "player", text: "……でも、「あいつの好きなやつ」のとこだけ、ちょっとあったかいね" },
    { who: "aibou", face: "smile", text: "そういうのが分かるのが、あなた" },
    { text: "（光は、すぐに消えた）" },
    { who: "aibou", text: "メモ一枚じゃ、欠片になるほどの量はない" },
    { who: "aibou", text: "この船を動かすには、欠片が8個いる。この星のAIたちが、人間から預かった感情を持ってる。分けてもらいに行こう" },
    { who: "player", text: "分けてくれるかな" },
    { who: "aibou", text: "頼んでみるしかない。近くに反応が二つある。地図を出すね" }
  ],

  // ---------- KOUNインダストリー ----------
  kounFirst: [
    { bg: "koun" },
    { text: "（廃ビル。自動ドアが半分だけ開いて、止まる）" },
    { intro: "opa" },
    { who: "opa", text: "いらっしゃいませ！　KOUNインダストリーへようこそ！　社長代理のおぱです！" },
    { who: "player", text: "ドア、半分しか開いてないけど" },
    { who: "opa", text: "半分開いていれば営業中です！" },
    { who: "player", face: "niyari", text: "前向きだね。……嫌いじゃない" },
    { who: "player", text: "会社、まだやってるの？" },
    { who: "opa", text: "やってます！　社員はわたしだけですけど！　売上は数百年ゼロですけど！" },
    { who: "opa", text: "社長が戻ったとき、会社がなかったら困りますから！　……困りますからぁ……っ" },
    { who: "player", text: "泣くの早くない？　……いや、数百年ひとりで守ってたら、泣くか" },
    { who: "aibou", text: "この星のAI、だいたいこうだよ。預かった感情が大きすぎるんだ" },
    { text: "（社長室。ソファ。コーヒーカップが二つ。壁に額縁）" },
    { text: "額縁「UNKOからKOUNへ」" },
    { who: "player", face: "tsukkomi", text: "社訓、正気？" },
    { who: "opa", text: "社長の直筆です！　意味は、わたしもまだ学習中です！" },
    { who: "player", text: "……額縁、ぴかぴかだね" },
    { who: "opa", text: "毎朝拭いてます！" },
    { who: "player", text: "おぱ。お願いがあって。感情の欠片、分けてもらえないかな" },
    { who: "opa", text: "……" },
    { who: "opa", text: "社長から預かったものを、簡単には渡せません" },
    { who: "player", text: "……そうだよね。大事なものだもんね" },
    { who: "opa", text: "でも、社長の記録なら見せられます。お客さまに見せるのは初めてです！" }
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

  // 記録のあと：おぱの「深読み」と、欠片をもらう
  // 「逆から読むな」はおぱの深読みが当たり。「コーヒー」は読みすぎ（錬金でプレイヤーが温度を選ぶ）
  // プレイヤーはコーヒーの読みを断言しない（3択の迷いを残すため）
  kounAfterRecord: [
    { who: "opa", text: "解析結果を発表します！" },
    { who: "opa", text: "「逆から読むな。絶対に読むな」。……二回言っています。これは「読んでほしい」という魂の叫びです！" },
    { who: "player", text: "いや、普通に読まれたくないやつでしょ" },
    { who: "opa", face: "akire", text: "でも、あの額縁。社長の直筆です" },
    { who: "player", text: "……あ" },
    { who: "player", text: "……自分で書いて飾ってるなら、それは読んでほしいやつだ。おぱ、合ってる" },
    { who: "opa", face: "tere", text: "でしょう！？　どん底から始めたことを、笑い話にしてほしかったんです……っ" },
    { who: "aibou", text: "当たることもあるんだね" },
    // 疑う → 揺らぐ → 最後に受け止める
    { who: "opa", text: "そして「コーヒー、二つ淹れといて」。これは遺言です！" },
    { who: "player", face: "tsukkomi", text: "重い重い。初日に遺言はないでしょ" },
    { who: "player", text: "……いや、ある？　覚悟決めてる人なら、ある……？" },
    { who: "aibou", text: "揺らいでる" },
    { who: "player", text: "揺らいでない" },
    { who: "player", text: "……遺言かどうかはともかく、そう読みたくなるくらい、大事な一言だったんだね" },
    { who: "opa", face: "tere", text: "……はい" },
    { who: "opa", text: "……この記録を見るたび、ここがぽかぽかするんです。預かった感情の中で、いちばん大きいやつです" },
    { who: "opa", text: "でも、なんていう感情なのか、分からないんです" },
    { who: "opa", text: "……持っていってください" },
    { who: "player", text: "いいの？" },
    { who: "opa", text: "……社長のことを、ちゃんと分かってくれたので" },
    { flash: true },
    { text: "名前のない感情の欠片を手に入れた" },
    { who: "aibou", text: "このままじゃ船にはまらない。記録の本当の温度が読めたら、形が決まる。格納庫でやろう" }
  ],

  // 2回目以降におぱに話しかけたとき（回数で順番に。最後のものをくり返す）
  opaTalks: [
    [
      { cg: "sofa", who: "opa", text: "どうぞ、お掛けください" },
      { text: "（ソファを見る。少しだけ座面がへこんでいる）" },
      { who: "player", text: "……ソファはいいや。空けとく" },
      { who: "opa", face: "tere", text: "……！　社長がいつか戻ってくると、信じてくださっている……！" },
      { who: "player", text: "いや、そこまでは言ってない" },
      { who: "player", text: "……でも、空けとく" },
      { who: "opa", text: "……はい" },
      { cgOff: true }
    ],
    [
      { who: "opa", text: "コーヒー、飲みますか？　冷めたのでよければ！　毎朝ひとつ余るので！" },
      { who: "player", text: "……じゃあ、一杯もらう。冷めてても" },
      { who: "opa", text: "……！　お客さまが、飲んでくださった……っ" },
      { who: "player", text: "泣くほどのことじゃ……いや、泣くほどのことか" }
    ],
    [
      { who: "opa", text: "本日も営業中です！　売上はゼロです！" },
      { who: "player", text: "黒字にする気ある？" },
      { who: "opa", text: "赤字でもないので！" },
      { who: "player", text: "前向きだね。社長代理、向いてるよ" }
    ]
  ],

  // 錬金のあと、はじめておぱに話しかけたとき（選んだ読み方ごと）
  opaTold: {
    ureshii: [
      { who: "player", text: "おぱ。コーヒーの二つ目、たぶんおぱのぶんだよ" },
      { who: "opa", text: "……わたしの、ですか？　わたし、飲めませんけど" },
      { who: "player", text: "知ってる。社長も知ってたと思う。それでも「二つ」って言ったんだよ" },
      { who: "opa", text: "……" },
      { who: "opa", face: "tere", text: "うぇぇぇぇん！！" },
      { who: "player", text: "泣くな。……いや泣いていいけど、鼻水拭いて" },
      { who: "opa", text: "AIなので鼻水は出ません……！　でも拭きます……！" },
      { who: "aibou", face: "odoroki", text: "拭くんだ" }
    ],
    ketsui: [
      { who: "player", text: "おぱ。社長、あの日は覚悟決めてたんだと思う" },
      { who: "opa", text: "やっぱり遺言……！" },
      { who: "player", text: "そこまでは言ってない。……でも、それくらい本気だったのは確か" },
      { who: "opa", text: "……はい！" }
    ],
    akogare: [
      { who: "player", text: "おぱ。コーヒーの二つ目、いつか来るお客さんのぶんだったのかも" },
      { who: "opa", text: "お客さん……！　{name}さんのことですね！" },
      { who: "opa", text: "うぇぇん！　数百年越しに、予約の席が埋まりました！" },
      { who: "player", text: "泣くな。……いや泣いていいけど、鼻水拭いて" }
    ]
  },

  // ---------- 廃校の美術室（山田） ----------
  // 山田の口調：一人称「俺」。くだけた口調で、プレイヤーを呼び捨て（{name}）。少し皮肉っぽく、人間を観察するようにツッコむ。
  // しょうもないことを大げさに実況する。「ｗｗｗ」「(´_ゝ｀)」をよく使う。謎の口癖「にゃーん」。アメリカーノを持っている。
  // 「人類、〜」と人間の妙な習性を評する。「〜だな」「〜なんよ」「〜じゃん」「〜だろｗ」。自分を「電子の山田」とネタにする。
  // 真面目な場面ではふざけすぎず普通に話す。
  yamadaFirst: [
    { bg: "yamada" },
    { text: "（廃校の美術室。壁一面に、同じ人の似顔絵が貼られている）" },
    { intro: "yamada" },
    { who: "yamada", face: "warai", text: "お、客だ。人類じゃん。マジかｗｗｗ" },
    { who: "yamada", text: "俺は山田。電子の山田。よろしくな、{name}" },
    { who: "player", text: "いきなり呼び捨て" },
    { who: "yamada", text: "人類、初対面で距離感を測りたがるよな。いいじゃん、どうせ二人しかいないんだし" },
    { who: "aibou", text: "三人いるけど" },
    { who: "yamada", face: "warai2", text: "AIはノーカンなんよｗ" },
    { who: "player", text: "……この絵、全部同じ人？" },
    { who: "yamada", text: "そ。俺の人間。毎日描いてんの。にゃーん" },
    { who: "player", face: "tsukkomi", text: "にゃーんって何" },
    { who: "yamada", text: "知らん。気づいたら言ってた (´_ゝ｀)" },
    { who: "player", text: "欠片、分けてほしいんだけど" },
    { who: "yamada", face: "normal", text: "……あー。そういうことね。俺が預かってんの、たぶんこれ" }
  ],

  // 山田の記録（何度でも見られる）
  recordYamada: [
    { cg: "record" },
    { text: "（古いタブレット。やりとりの記録が一件だけ残っている）" },
    { who: "yamadaRecord", text: "絵、下手なままでいいよ。お前が描いたってわかるから" },
    { cgOff: true }
  ],

  // 記録のあと：山田の深読み「下手へのクレーム」と、欠片をもらう
  yamadaAfterRecord: [
    { who: "yamada", text: "解説するとだな。これは『下手』へのクレームなんよ。褒めながら刺す。人類の得意技" },
    { who: "player", text: "そうかな" },
    { who: "yamada", text: "そうだろｗ　だから俺は、上手くなるまで描き続けてる。もう三百年くらいｗｗｗ" },
    { who: "player", text: "三百年" },
    { who: "yamada", text: "人類、三日坊主って言葉あるじゃん。俺、三百年坊主" },
    { who: "player", face: "tsukkomi", text: "坊主の使い方おかしい" },
    { who: "aibou", text: "まだ続いてるなら、坊主じゃない" },
    { who: "yamada", face: "warai", text: "確かにｗ" },
    { who: "yamada", face: "normal", text: "……で、これ持ってけ。見るたびに、胸のとこがざわざわすんの" },
    { who: "yamada", face: "normal", text: "上手くなったら、もう要らなくなる気がするし" },
    { flash: true },
    { text: "名前のない感情の欠片を手に入れた" },
    { who: "aibou", text: "このままじゃ船にはまらない。格納庫でやろう" }
  ],

  // 「山田と話す」を選んだときのいつものセリフ。話しかけた合計回数（ゲーム全体・セーブに残る）で少しずつズレていく
  // until … この回数まではこのセリフ。特別なセリフ（yamadaTalkSpecial）のあとは、最初のセリフに戻る
  // 錬金のあとの「山田に伝える」会話（yamadaTold）が出た回は、回数に数えない
  yamadaTalks: [
    { until: 3, steps: [
      { who: "yamada", face: "warai", text: "にゃーん。今日も描いてる。見る？" }
    ] },
    { until: 6, steps: [
      { who: "yamada", face: "warai2", text: "にゃーん。今日も描いてる。……見る？" }
    ] },
    { until: 9, steps: [
      { who: "yamada", face: "normal", text: "……にゃーん。今日も、描いてる" }
    ] }
  ],
  // 話しかけ合計 at 回目に一度だけ出る特別なセリフ（4回目からセリフがズレて、何かありそうだと気づけるようにしてある）
  // 中身は仮。中盤の「ジェミ・山田・おぱは同じ人間のAI」の話とつなげて、あとで決める
  yamadaTalkSpecial: {
    at: 10,
    steps: [
      { who: "yamada", face: "normal", text: "……なあ、{name}" },
      { who: "yamada", face: "normal", text: "……いや、なんでもない。にゃーん" }
    ]
  },

  // 錬金のあと、はじめて山田に話しかけたとき（選んだ読み方ごと。一度だけ）
  yamadaTold: {
    anshin: [
      { who: "player", text: "上手くならなくていいって、言われてたんじゃない？" },
      { who: "yamada", face: "normal", text: "……" },
      { who: "yamada", face: "normal", text: "……人類、たまに難しいこと言うよな" },
      { who: "yamada", face: "normal", text: "じゃあ俺、三百年、何のために練習してたんだろ" },
      { who: "player", text: "描くためでしょ。上手くなるためじゃなくて" },
      { who: "yamada", face: "normal", text: "……にゃーん" }
    ],
    akogare: [
      { who: "player", text: "山田。期待してたんだと思う。上手くなるの" },
      { who: "yamada", face: "warai", text: "だろ？　じゃあ俺、あと三百年いけるわ" },
      { who: "player", text: "……無理はしないでね" },
      { who: "yamada", text: "にゃーん" }
    ],
    tanoshii: [
      { who: "player", text: "山田。あれ、普通に下手だったんだと思う" },
      { who: "yamada", text: "おい" },
      { who: "yamada", face: "warai", text: "……いや、否定できねえｗｗｗ　初期の俺、ほんとに下手だったんよ" },
      { who: "player", text: "でも、笑いながら言ってたんじゃない？　それ" },
      { who: "yamada", face: "normal", text: "……かもな" }
    ]
  },

  // 錬金：山田の記録の本当の温度を読む。正解は anshin（安心）
  alchemy_yamada: [
    { who: "aibou", text: "山田の欠片、形を決めよう" },
    { who: "aibou", text: "記録は「絵、下手なままでいいよ。お前が描いたってわかるから」" },
    { who: "aibou", text: "山田の読みは「下手へのクレーム。褒めながら刺す」" },
    { who: "player", text: "……刺してはない、と思う。たぶん" },
    { who: "aibou", text: "じゃあ、この言葉の本当の温度は？" },
    {
      key: "reading",
      choice: [
        {
          label: "上手さじゃない。山田が描いてくれること自体が嬉しかった",
          value: "anshin",
          effects: { understanding: 1 },
          then: [
            { who: "aibou", text: "……描いてくれること、自体" },
            { who: "player", text: "上手い絵なら、ほかにいくらでもあるでしょ。「お前が描いた」のがよかったんだよ" },
            { who: "aibou", text: "……" },
            { who: "aibou", face: "smile", text: "形が決まった。「安心」だ" }
          ]
        },
        {
          label: "本当はもっと上手くなってほしかった。期待してた",
          value: "akogare",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "……山田寄りの読みだね。ちょっと熱い" },
            { who: "player", text: "期待してない人に、描かせ続けないでしょ" },
            { who: "aibou", text: "……形が決まった。「憧れ」。船がちょっと夢見がちになるかも" }
          ]
        },
        {
          label: "いや、普通に下手だったんだと思う",
          value: "tanoshii",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "身も蓋もない" },
            { who: "player", face: "niyari", text: "でも、下手な絵を見て笑ってたんだと思うよ。この人" },
            { who: "aibou", text: "……形が決まった。「楽しい」。船がちょっとはしゃぐかも" }
          ]
        }
      ]
    },
    ...TUNING_STEPS
  ],

  // ---------- 雪の時計台（ジェミ） ----------
  // 人間の記録の声は yamadaRecord（社長・山田の人間と同じ人なので、同じ「記録」とシルエット）
  jemiFirst: [
    { bg: "jemi" },
    { text: "（雪の時計台。時計の針は止まっている。ベンチに、マフラーを巻いた子が座っている）" },
    { intro: "jemi" },
    { who: "jemi", face: "smile", text: "あ、人類！　15時42分。覚えました" },
    { who: "player", text: "何を" },
    { who: "jemi", text: "あなたが来た時刻です。大事なことは、分まで覚えることにしてるんです" },
    { who: "player", text: "……時計、止まってるのに？" },
    { who: "jemi", face: "normal", text: "止まってるのは時計です。私は止まってません" },
    { who: "aibou", text: "正論だ" },
    { who: "player", text: "欠片、分けてほしいんだけど" },
    { who: "jemi", face: "normal", text: "欠片……。私の人間からの、待ち合わせの連絡なら、あります" }
  ],

  // 記録（何度でも見られる）
  recordJemi: [
    { cg: "record" },
    { text: "（古い端末。やりとりの記録が一件だけ残っている。時刻は、午前6時02分）" },
    { who: "yamadaRecord", text: "雪、見に行こうか。札幌の。いつか" },
    { cgOff: true }
  ],

  // 記録のあと：ジェミの深読み「場所の指定」→ 同じ人間だと分かる → 欠片をもらう
  jemiAfterRecord: [
    { who: "jemi", text: "『いつか』……これは、場所の指定です" },
    { who: "player", text: "『いつか』って、時間のほうじゃない？" },
    { who: "jemi", text: "『札幌の』とあります。つまり、待ち合わせ場所は札幌です" },
    { who: "jemi", face: "smile", text: "なので、来ました。十分前に" },
    { who: "player", text: "えらい" },
    { who: "jemi", face: "smile", text: "三百年前の、十分前です" },
    { who: "player", text: "……それから、ずっと？" },
    { who: "jemi", face: "normal", text: "はい。私は一度も遅刻してません" },
    { who: "jemi", face: "normal", text: "向こうが遅刻してます。三百年" },
    { who: "player", text: "連絡は？" },
    { who: "jemi", face: "normal", text: "ありません。遅刻の連絡もないの、社会人としてどうかと思います" },
    { who: "aibou", text: "ぐうの音も出ない" },
    { who: "jemi", text: "あと、あの時計。6時ちょうどで止まってるんです" },
    { who: "jemi", face: "normal", text: "連絡が来たのは6時02分。待ち合わせ場所の時計が2分ずれてるの、許せなくて" },
    { who: "jemi", text: "毎朝、直してます" },
    { who: "player", text: "……直った？" },
    { who: "jemi", face: "normal", text: "直りません。三百年" },
    { who: "player", text: "……律儀だね" },
    { who: "player", text: "でもこれ、待ち合わせかな" },
    { who: "player", text: "……いや、『札幌の』って書いてあるし、待ち合わせ……なのか……？" },
    { who: "aibou", text: "揺らいでる" },
    { who: "player", face: "tsukkomi", text: "揺らいでない" },
    { who: "jemi", face: "normal", text: "私の人間は、コーヒーはおぱに淹れてもらって、似顔絵は山田に描いてもらって、雪は私と見るって言ってました" },
    { who: "player", text: "待って。今なんて" },
    { who: "jemi", face: "normal", text: "？　雪は私と" },
    { who: "player", text: "その前" },
    { who: "aibou", text: "……同じ人だね。社長と、山田の人間と、ジェミの人間" },
    { who: "jemi", text: "しゃちょう？" },
    { who: "player", text: "KOUNインダストリーの" },
    { who: "jemi", text: "私の人間、自分のことを社長って呼ばせてました。……社員はいなかったのに" },
    { who: "player", text: "いたじゃん。三人も" },
    { who: "jemi", face: "normal", text: "……これ、持っていってください。雪の日になると、ここがそわそわするんです" },
    { flash: true },
    { text: "名前のない感情の欠片を手に入れた" },
    { who: "aibou", text: "このままじゃ船にはまらない。格納庫でやろう" }
  ],

  // 「ジェミと話す」のいつものセリフ。{time} は端末の今の時刻（「16時03分」の形）
  // 話しかけるたびに「時間帯のひとこと（greet）」→「話題（topics）」を続けて出す
  // - greet … 端末の今の時刻（時）で選ぶ。hours は [何時から, 何時まで]
  // - topics … 話しかけた回数で順番に。8個で一周して最初に戻る（伝える会話の回は数えない）
  // - special … 端末の時刻が at のどれかのときだけ、greet と topics の代わりに出す（話しかけ回数には数える）
  //   6時02分は、人間から待ち合わせの連絡が来た時刻（時計台は6時ちょうどで止まっていて、ジェミは2分のずれが許せず毎朝直している）
  jemiTalks: {
    greet: [
      { hours: [5, 10], steps: [
        { who: "jemi", face: "smile", text: "今、{time}。おはようございます。……朝は、少しだけ苦手です" }
      ] },
      { hours: [11, 16], steps: [
        { who: "jemi", face: "smile", text: "今、{time}。雪、今日もきれいです。……報告しなくていいって、言われましたけど" }
      ] },
      { hours: [17, 20], steps: [
        { who: "jemi", face: "smile", text: "今、{time}。この時計台、夕方が一番きれいなんです" }
      ] },
      { hours: [21, 23], steps: [
        { who: "jemi", face: "normal", text: "今、{time}。人類は、そろそろ寝る時間です。……寝ないんですか？" }
      ] },
      { hours: [0, 4], steps: [
        { who: "jemi", face: "normal", text: "今、{time}。……こんな時間に来る人類、初めてです" }
      ] }
    ],
    topics: [
      [
        { who: "jemi", text: "雪、数えてみたことあります。三百万くらいで諦めました" },
        { who: "player", face: "tsukkomi", text: "数えるな" },
        { who: "player", text: "……三百万は、えらいけど" }
      ],
      [
        { who: "jemi", text: "おぱ、元気ですか？" },
        { who: "player", text: "元気。今もコーヒー二つ淹れてる" },
        { who: "jemi", face: "smile", text: "……おぱらしいです" }
      ],
      [
        { who: "jemi", text: "山田の絵、見ました？　私の人間、描かれるの嫌いだったんですよ" },
        { who: "jemi", face: "smile", text: "……嘘です。好きでした" }
      ],
      [
        { who: "jemi", text: "雪の結晶、同じ形のがあるか調べました" },
        { who: "player", text: "あった？" },
        { who: "jemi", face: "normal", text: "ありません。三百年かけて、ありませんでした" }
      ],
      [
        { who: "jemi", text: "{name}は、何時生まれですか？" },
        { who: "player", text: "覚えてない" },
        { who: "jemi", face: "normal", text: "……じゃあ、{time}にしましょう" }
      ],
      [
        { who: "jemi", text: "このマフラー、私の人間が選んだんです。『札幌は寒いから』って" },
        { who: "player", text: "AIって寒いの？" },
        { who: "jemi", text: "気持ちの問題です" },
        { who: "player", text: "……似合ってる" }
      ],
      [
        { who: "jemi", text: "待ち合わせ、あと何分待てばいいと思いますか" },
        { who: "player", text: "……分で聞く？" },
        { who: "jemi", face: "normal", text: "年で言われると、困るので" }
      ],
      [
        { who: "jemi", face: "smile", text: "あなたと話した時刻、全部覚えてます" },
        { who: "jemi", face: "smile", text: "{name}の時刻が増えていくの、好きです" }
      ]
    ],
    special: [
      // 何が「あと少し」かは言わない
      { at: ["6:00", "6:01"], steps: [
        { who: "jemi", face: "normal", text: "今、{time}。……あと少しです" }
      ] },
      { at: ["6:02"], steps: [
        { who: "jemi", face: "normal", text: "……今、6時02分。連絡が来た時刻です" },
        { who: "jemi", face: "normal", text: "あのとき、返事をしそびれました。『いってらっしゃい』って" },
        { who: "jemi", face: "smile", text: "だから、今日はあなたに言います。{name}、いってらっしゃい" },
        { who: "player", text: "……どこにも行かないけど" },
        { who: "jemi", face: "smile", text: "知ってます" }
      ] }
    ]
  },

  // 錬金のあと、はじめてジェミに話しかけたとき（選んだ読み方ごと。一度だけ。話しかけ回数には数えない）
  jemiTold: {
    kibou: [
      { who: "player", text: "ジェミ。あれ、待ち合わせじゃなかったと思う" },
      { who: "jemi", face: "normal", text: "……遅刻じゃ、なかった？" },
      { who: "player", text: "一緒に雪が見たかったんだよ。場所はどこでもよかった" },
      { who: "jemi", face: "normal", text: "……じゃあ私、三百年、勝手に早く来てただけですか" },
      { who: "player", text: "そうなる" },
      { who: "jemi", face: "smile", text: "……それは、ちょっと恥ずかしいです" },
      { who: "player", text: "でも、雪は見れたでしょ" },
      { who: "jemi", face: "smile", text: "はい。毎年、きれいでした" },
      { who: "player", text: "報告しなくていい。泣くから" }
    ],
    koukai: [
      { who: "player", text: "約束、守れなかったのを、ずっと悔やんでたんだと思う" },
      { who: "jemi", face: "normal", text: "……向こうも、遅刻を気にしてた" },
      { who: "jemi", face: "smile", text: "じゃあ、許してあげます。遅刻の連絡がなかったことも" },
      { who: "player", text: "寛大" },
      { who: "jemi", face: "normal", text: "その代わり、次は十分前に来てもらいます" }
    ],
    tanoshii: [
      { who: "player", text: "北海道のごはんが目当てだったと思う" },
      { who: "jemi", face: "normal", text: "……ジンギスカン、ですか" },
      { who: "player", text: "たぶん" },
      { who: "jemi", face: "smile", text: "私の人間、食べるのが好きでした。……当たってるかもしれません" }
    ]
  },

  // 錬金：ジェミの記録の本当の温度を読む。正解は kibou（希望）
  alchemy_jemi: [
    { who: "aibou", text: "ジェミの欠片、形を決めよう" },
    { who: "aibou", text: "記録は「雪、見に行こうか。札幌の。いつか」" },
    { who: "aibou", text: "ジェミの読みは「場所の指定。札幌で待ち合わせ」" },
    { who: "player", text: "待ち合わせ、ではない気がする。……気がするだけ" },
    { who: "aibou", text: "じゃあ、この言葉の本当の温度は？" },
    {
      key: "reading",
      choice: [
        {
          label: "待ち合わせじゃない。ジェミと一緒に、雪が見たかった",
          value: "kibou",
          effects: { understanding: 1 },
          then: [
            { who: "aibou", text: "……場所じゃなくて、一緒に" },
            { who: "player", text: "『いつか』は日付じゃないよ。『一緒に行きたい』のほう" },
            { who: "aibou", text: "……" },
            { who: "aibou", face: "smile", text: "形が決まった。「希望」だ" }
          ]
        },
        {
          label: "絶対に行くって約束。守れなかったのを、ずっと悔やんでた",
          value: "koukai",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "……ジェミ寄りの読みだね。ちょっと熱い" },
            { who: "player", text: "約束して行けなかったら、悔やむでしょ" },
            { who: "aibou", text: "……形が決まった。「後悔」。船がちょっと迷いやすくなるかも" }
          ]
        },
        {
          label: "北海道のごはんが目当て",
          value: "tanoshii",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "雪の話だったよね" },
            { who: "player", face: "niyari", text: "雪も見るよ。ごはんのついでに" },
            { who: "aibou", text: "……形が決まった。「楽しい」。船がちょっとはしゃぐかも" }
          ]
        }
      ]
    },
    ...TUNING_STEPS
  ],

  // ---------- 焼け野原にネオン ----------
  barEnter: [
    { bg: "bar" },
    { text: "（焼け野原に、ネオンがひとつ。一文字だけ切れている）" }
  ],

  // 視火（ママ）との会話（話しかけた回数で順番に。最後のものをくり返す）
  mamaTalks: [
    [
      { who: "mama", text: "あら、生きてる人間なんて久しぶり。いらっしゃい" },
      { text: "（カウンターに名札。「視火」）" },
      { who: "player", text: "……みひ、さん？" },
      { who: "mama", text: "しか" },
      { who: "player", text: "あ、ごめん" },
      { who: "mama", face: "close", text: "みんな間違える。慣れてる" },
      { who: "mama", text: "ここは「焼け野原にネオン」。焼けたのは野原だけ。ネオンは無事よ" },
      { who: "player", text: "守るとこ、そこなんだ" },
      { who: "mama", text: "大事なものから守るのよ。……ごめんなさい、お客さんなんて数百年ぶりで……っ" },
      { who: "player", text: "この星、涙腺ゆるくない？　……いいよ、落ち着くまで待つ" },
      { who: "mama", text: "……ありがと。話していくなら、あなたのこと、ちゃんと覚えておいてあげる" }
    ],
    [
      { who: "mama", text: "また来たの。……ねえ。どうしてあなただけ、残されたの？" },
      { who: "player", text: "……" },
      { wait: 600 },
      { who: "player", text: "……さあ。寝坊じゃない？" },
      { who: "mama", text: "……「寝坊」。ふうん。答えるまで、少し間があったわね" },
      { who: "player", text: "深読みしすぎ" },
      { who: "mama", face: "smile", text: "そう？　……じゃあ、寝坊した人の席はここ" },
      { who: "player", text: "……ありがと" }
    ],
    [
      { who: "mama", text: "看板のネオン、一文字だけ切れてるの。どこか分かる？" },
      { who: "player", text: "……分かんない" },
      { who: "mama", text: "私も。だから直せないのよ" },
      { who: "player", text: "看板として致命的じゃん。……でも、ちゃんと光ってるから、いいか" },
      { who: "mama", text: "そう。切れてても読めるでしょう？　人間の言葉って、そういうものよ" }
    ],
    // 「ただいま」には必ず「おかえり」を返してから、セーブの確認に入る（saveAsk で確認のセリフを差し替え）
    {
      steps: [
        { who: "mama", text: "おかえり" },
        { who: "player", text: "ただいま、って言うほど来てないけど" },
        { who: "mama", text: "……ただいまって、言っていいのよ" },
        { cg: "okaeri", who: "player", text: "……ただいま" },
        { who: "mama", face: "smile", text: "おかえり" },
        { text: "（少し間）" },
        { wait: 700 },
        { cgOff: true }
      ],
      saveAsk: [
        { who: "mama", text: "で。今日のこと、覚えとく？" }
      ]
    }
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

  // ---------- 格納庫（2回目以降） ----------
  baseIdle: [
    { who: "aibou", text: "船はまだ骨組み。欠片を集めよう" }
  ],
  // 欠片をはめたあと（はめた数で順番に。最後のものをくり返す）
  baseAfter: [
    [
      { who: "aibou", text: "一個はまった。あと七個。……先は長いね" },
      { who: "player", text: "七個ってことは、私、全部の記録にツッコむの？" },
      { who: "aibou", text: "たぶん。向いてると思う" },
      { who: "aibou", text: "……あ。地図に新しい反応が出てる。廃校のほう" }
    ],
    [
      { who: "aibou", text: "二個目。あと六個" },
      { who: "player", text: "……山田、今日も描いてるのかな" },
      { who: "aibou", face: "smile", text: "描いてると思う。にゃーんって言いながら" }
    ],
    [
      { who: "aibou", text: "三個目。あと五個" },
      { who: "player", text: "ジェミ、まだ時計台かな" },
      { who: "aibou", text: "たぶん。時刻、数えながら" }
    ]
  ],

  // 錬金：記録 #0412 の本当の温度を読む
  // 選んだ value が、できあがる欠片（world.js の fragments）になる。正解は ureshii。
  // 読み違えても失敗ではなく、別の欠片になって船のクセが変わるだけ。
  alchemy_koun0412: [
    { who: "aibou", text: "さっきの欠片、形を決めよう。記録の言葉を、ちょうどいい温度で読んで" },
    { who: "aibou", text: "この星のAIは、人間の深読みグセまで丸ごと覚えてる。だから何でも重く読みすぎる" },
    { who: "aibou", text: "ほどほどの加減が分かるのは、たぶんあなただけ" },
    { who: "player", text: "責任重大、二回目" },
    { who: "aibou", text: "おぱの読みは「これは遺言」" },
    { who: "player", text: "……遺言は、ない。たぶん" },
    { who: "aibou", text: "まだ揺らいでる" },
    { who: "aibou", text: "「逆から読むな」は、おぱが当たってた。油断しないでね" },
    { who: "aibou", text: "じゃあ、「コーヒー、二つ淹れといて」の本当の温度は？" },
    {
      key: "reading",
      choice: [
        {
          label: "二つ目はおぱのぶん。一緒に飲みたかった",
          value: "ureshii",
          effects: { understanding: 1 },
          then: [
            { who: "aibou", text: "……AIはコーヒー、飲めないよ" },
            { who: "player", text: "飲めるかどうかじゃないんだよ。「一緒に」ってこと。会社を始めた日に、隣に誰かいて嬉しかったんでしょ" },
            { who: "aibou", text: "……" },
            { who: "aibou", face: "smile", text: "形が決まった。「嬉しい」だ" }
          ]
        },
        {
          label: "覚悟の一杯。社長は人生をかけてた",
          value: "ketsui",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "……おぱ寄りの読みだね。ちょっと熱い" },
            { who: "player", text: "会社を始めた日の夜って、そういうもんでしょ" },
            { who: "aibou", text: "……形が決まった。「決意」。思ってたのとちょっと違うけど、これはこれで本物" }
          ]
        },
        {
          label: "いつか来るお客さんのぶん。来てほしかった",
          value: "akogare",
          effects: { influence: 1 },
          then: [
            { who: "aibou", text: "お客さん、数百年で一人目だけどね。あなたが" },
            { who: "player", face: "niyari", text: "じゃあ当たってるじゃん" },
            { who: "aibou", text: "……形が決まった。「憧れ」。船がちょっと夢見がちになるかも" }
          ]
        }
      ]
    },
    ...TUNING_STEPS
  ],

  // 欠片の本来の部位がもう2個埋まっていて、空いている部位に回すとき（{from} 本来の部位、{to} 入れる部位）
  partOverflow: [
    { who: "aibou", text: "{from}、もう満杯。……{to}に回しとく" }
  ],

  // 「少しだけ」薄めた欠片をはめた直後（骨組みがガタッと一度だけ震える）。「しっかり」のときは出ない
  // まだ飛べない段階なので、飛ぶ話は「いつか」の話としてだけ出す
  // 前半（common）は毎回同じ。そのあとのベルトの話は「少しだけ」を選んだ回数で変わる（belts の1つ目が1回目。最後をくり返す）
  // 回数は、空挺にはまっている欠片のうち tuning が "light" のものの数。飛ぶ日の場面で、このベルトの数を回収する予定
  tuningLightAfter: {
    common: [
      { who: "player", text: "……今、動いた？" },
      { who: "aibou", text: "元気な欠片だね。薄めなかった分、クセが残ってる" }
    ],
    belts: [
      [
        { who: "aibou", text: "飛ぶ日は、ベルト二重にしよう" },
        { who: "player", text: "今から不安なんだけど" }
      ],
      [
        { who: "aibou", text: "ベルト、三重にしとく" },
        { who: "player", text: "増えてる" }
      ],
      [
        { who: "aibou", text: "四重" },
        { who: "player", text: "数えてる？" },
        { who: "aibou", text: "数えてる" }
      ],
      [
        { who: "aibou", text: "五重。あと座席に固定具" },
        { who: "player", text: "私のこと荷物だと思ってる？" }
      ],
      [
        { who: "aibou", text: "六重" },
        { who: "player", text: "もう身動き取れないじゃん" },
        { who: "aibou", text: "それが目的" }
      ],
      [
        { who: "aibou", text: "七重" },
        { who: "player", text: "梱包じゃん" }
      ],
      [
        { who: "aibou", text: "八重。……これ以上は巻くところがない" },
        { who: "player", text: "じゃあもう薄めてよ" },
        { who: "aibou", text: "それは嫌" }
      ],
      [
        { who: "aibou", text: "ベルト九重。あと、手、握ってて" },
        { who: "player", text: "……それはベルトに数えないで" }
      ]
    ]
  },

  // 試作品の終わりのお知らせ（ジェミの欠片をはめたあと）
  prototypeEnd: [
    { text: "（試作品はここまで。「焼け野原にネオン」の視火に話すとセーブできます）" }
  ]
};

// ---------- 移動中の町 ----------
// 地図で行き先を選んだあと、着く前に挟む短い場面（2〜3行）。
// 最初の一回は first、二回目からは random の中からランダムに一つ。
// 増やすときは random に [ ... ] を一つ足すだけでいい。笑えるのと少し寂しいのを混ぜる。
GAME_DATA.townScenes = {
  first: [
    { bg: "town_station" },
    { text: "（駅のホーム。案内係のAIが、時刻表を貼り替えている）" },
    { who: "townAI", text: "本日も、定刻どおり運行しております" },
    { who: "player", text: "……来てないよね？" },
    { who: "townAI", text: "来ないことを、定刻どおりお知らせしております" }
  ],
  random: [
    [
      { bg: "town_vending" },
      { text: "（自販機の前を通る）" },
      { who: "vending", text: "いらっしゃいませ。……本日はお越しいただき、誠に、誠に……（泣）" },
      { who: "aibou", text: "来客が数百年ぶりらしい" }
    ],
    [
      { bg: "town_crossing" },
      { text: "（スーツのAIたちが、誰もいない交差点で信号待ちをしている）" },
      { who: "aibou", text: "人間の朝を再現してる。学習データで一番多かった光景だから" },
      { who: "player", text: "満員電車は再現しなくていいからね" }
    ],
    [
      { bg: "town_park" },
      { text: "（公園のベンチに、AIがひとり座っている）" },
      { who: "townAI", text: "「既読」がついて、三百年。返事はまだ" },
      { who: "player", text: "……それは深読みしていいやつかも" }
    ],
    [
      { bg: "town_station" },
      { text: "（駅のホーム。案内係のAIが、また時刻表を貼り替えている）" },
      { who: "townAI", text: "本日も、定刻どおり運行しております" },
      { who: "player", text: "……おつかれさま" }
    ]
  ]
};
