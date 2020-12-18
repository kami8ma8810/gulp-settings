jQuery(window).load(function () {
  jQuery('.msnry-container').masonry({
    itemSelector: '.msnry-item',
    columnWidth: '.msnry-item',
    isAnimated: true
  });
});


jQuery(function () {
  const $msnryContainer = jQuery('.msnry-container');
  $msnryContainer.imagesLoaded(function () {
    $msnryContainer.masonry({
      itemSelector: '.msnry-item',
      columnWidth: '.msnry-item',
      fitWidth: true,
      isAnimated: true
    });
  });
});


// imageLoadedとの組み合わせ

// 背景画像を含むすべての画像が正確に読み込みこめたら実行
$('.wrapper').imagesLoaded({
  background: true
}, function () {
  Loadingfade();
});

// 5秒経ったら、強制的にローディング非表示
$(function () {
  setTimeout(Loadingfade, 5000);
});

//ローディング非表示処理
function Loadingfade() {
  // 1秒かけてローディング部分を非表示にし、その後0.8秒かけて背景を非表示
  $('#loading-main').fadeOut(1000, function () {
    $('#loading').fadeOut(800);
  });
}
