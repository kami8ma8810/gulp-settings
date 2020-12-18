jQuery(function () {
  var $window = $(window),
    nowScroll = $window.scrollTop(),
    wHeight = window.innerHeight,
    $fuwattoWrap = $(".fuwatto-wrap");

  var hRatio = 0.8, //画面のどこまで要素が来た時表示させるか。:初期値0.8(画面上より80%の位置)
    fTime = 400, //fuwatto1発動までに必要な時間:初期値400(0.4秒)
    aTime = 250; //その後のfuwatto2～の発動までの必要な時間:初期値250(0.25秒)
  /*設定値ここまで*/

  //値の更新

  $window.on("scroll", function () {
    nowScroll = $window.scrollTop();
  });
  $window.on("load resize", function () {
    wHeight = window.innerHeight;
  });

  //fuwatto-wrapがある場合のみ処理
  if ($fuwattoWrap.length) {
    //fuwatto-wrapにクラス付与
    $fuwattoWrap.addClass("not-fuwatto");

    //ふわっと処理実行
    actFuwatto();

    //スクロール時の処理
    $window.on("scroll", function () {
      //not-fuwattoがある場合のみ処理
      if ($(".not-fuwatto").length) {
        //ふわっと処理実行
        actFuwatto();
      }
    });
  }

  function actFuwatto() {
    //各not-fuwatto毎の処理
    $(".not-fuwatto").each(function () {
      var $this = $(this),
        thisPos = $this.offset().top;

      //$thisの位置が画面の80%の位置に来た場合のみ処理
      if (thisPos <= wHeight * hRatio + nowScroll) {
        //$thisからnot-fuwattoクラスを消去
        $this.removeClass("not-fuwatto");

        //fTime秒後に実行
        setTimeout(function () {
          //$thisの中のfuwattoを含むクラスの数を取得
          var kaz = $this.find("[class*='fuwatto']").length,
            finish = 0,
            fuwattoTimer,
            fIndex = 2;

          //$thisの子要素にfuwatto1が存在する場合のみ処理
          if ($this.find(".fuwatto1").length) {
            //$thisの子要素のfuwatto1にf-actクラス付与
            $this.find(".fuwatto1").addClass("f-act");
          }

          //aTime秒毎に処理
          fuwattoTimer = setInterval(function () {
            //処理済のがkazを超えたら処理終了
            if (kaz <= finish) {
              clearInterval(fuwattoTimer);
            } else {
              //fuwattoの順番ごとにf-actクラス付与
              $this.find(".fuwatto" + fIndex).addClass("f-act");
              finish = $this.find(".f-act").length;
              fIndex++;
            }
          }, aTime);
        }, fTime);
      }
    });
  }
})(jQuery);
