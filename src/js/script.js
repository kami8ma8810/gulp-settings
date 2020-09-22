// before(テストES6記述)
const HOGE = (name) => {
  console.log(name);
};
HOGE('taro');

// after(こうなればOK)
'use strict';
var hoge = function hoge(name) {
  console.log(name);
};
hoge('taro');