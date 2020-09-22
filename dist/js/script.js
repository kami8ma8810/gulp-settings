"use strict";

// before(テストES6記述)
var HOGE = function HOGE(name) {
  console.log(name);
};

HOGE('taro'); // after(こうなればOK)

'use strict';

var hoge = function hoge(name) {
  console.log(name);
};

hoge('taro');