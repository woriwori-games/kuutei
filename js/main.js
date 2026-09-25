// 起動。場面を順番に回す。
(async () => {
  UI.init();
  let next = "title";
  while (true) {
    try {
      next = (await Scenes[next]()) || "map";
      if (!Scenes[next]) next = "map";
    } catch (e) {
      console.error(e);
      await UI.sleep(1000); // エラーが続いても固まらないように
      next = "title";
    }
  }
})();
