const {
  src,
  dest,
  watch,
  lastRun,
  series, //記述順に処理
  parallel //平行して処理
} = require("gulp");

// Sassコンパイル
const sass = require("gulp-sass");
const sassGlob = require('gulp-sass-glob');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postCss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssDeclSort = require('css-declaration-sorter');
const mqpacker = require('css-mqpacker');
const cleanCss = require('gulp-clean-css');
const rename = require("gulp-rename");
const styleLint = require('gulp-stylelint');

// 画像圧縮
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");

// ブラウザ同期
const browserSync = require('browser-sync');

//本番(production)と開発(development)で処理を分ける
const mode = require("gulp-mode")({
  modes: ["production", "development"],
  default: "development",
  verbose: false
});

//読み込むパスと出力するパスを指定
const paths = {
  html: {
    src: "index.html",
    // src: ["./ejs/**/*.ejs", "!" + "./ejs/**/_*.ejs"],
    dist: "./"
  },
  styles: {
    src: "./src/scss/**/*.scss",
    dist: "./dist/css/",
    map: "./dist/css/map"
  },
  scripts: {
    src: "./src/js/**/*.js",
    dist: "./dist/js/",
    map: "./dist/js/map",
    core: "src/js/core/**/*.js",
    app: "src/js/app/**/*.js"
  },
  images: {
    src: "./src/img/**/*.{jpg,jpeg,png,gif,svg}",
    dist: "./dist/img/"
  }
};

// Sassコンパイル
const compileSass = () => {
  return src(paths.styles.src, {
      sourcemaps: true
    })
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sassGlob())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on("error", sass.logError))
    .pipe(postCss([autoprefixer({
        //指定の内容はpackage.jsonに記述
        cascade: false,
        grid: 'autoplace' // IE11のgrid対応('-ms-')
      }),
      cssDeclSort({
        order: 'smacss'
      }),
      mqpacker()
    ]))
    .pipe(dest(paths.styles.dist))
    .pipe(cleanCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(dest(paths.styles.dist, {
      sourcemaps: "./map"
    }));
};

// 画像圧縮
const imagesFunc = () => {
  return src(paths.images.src, {
      since: lastRun(imagesFunc)
    })
    .pipe(plumber({
      errorHandler: notify.onError("<%= error.message %>")
    }))
    .pipe(
      imagemin([
        imageminMozjpeg({
          quality: 80
        }),
        imageminPngquant(
          [0.7, 0.8] //画質の最小,最大
        ),
        imageminSvgo({
          plugins: [{
            removeViewbox: false //フォトショやイラレで書きだされるviewboxを消さない
          }]
        })
      ], {
        verbose: true //メタ情報削除
      })
    )
    .pipe(dest(paths.images.dist));
};

// ブラウザの読み込み処理
const browserSyncFunc = () => {
  browserSync.init({
    port: 8080,
    notify: false,
    server: {
      baseDir: "./",
      // browser: ['google chrome'],//ブラウザの指定
      index: "index.html"
    },
    reloadOnRestart: true
  });
};

// リロードの処理
const browserReloadFunc = () => {
  browserSync.reload({
    stream: true
  });
};

// ファイル監視
const watchFiles = () => {
  watch(paths.html.src, browserReloadFunc);
  watch(paths.styles.src, series(compileSass, browserReloadFunc));
  watch(paths.images.src, series(imagesFunc, browserReloadFunc));
};

exports.default = parallel(watchFiles, browserSyncFunc);