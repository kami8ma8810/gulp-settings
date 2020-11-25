const {
  src,
  dest,
  watch,
  lastRun,
  series, //記述順に処理
  parallel //平行して処理
} = require("gulp");

// ファイルの削除
const del = require("del");

// html
const htmlBeautify = require("gulp-html-beautify");
const htmlMin = require("gulp-htmlmin");

//ejs
const ejs = require("gulp-ejs");

// Sassコンパイル
const sass = require("gulp-sass");
const sassGlob = require('gulp-sass-glob');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postCss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssDeclSort = require('css-declaration-sorter');
const gcmq = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const fibers = require('fibers');
// const stylelint = require("gulp-stylelint");
// const stylelint = require("stylelint");
// const reporter = require("postcss-reporter");

// JavaScript処理
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");

// 画像圧縮
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");

// ブラウザ同期
const browserSync = require('browser-sync').create();

//本番(production)と開発(development)で処理を分ける
const mode = require("gulp-mode")({
  modes: ["production", "development"],
  default: "development",
  verbose: false
});

//読み込むパスと出力するパスを指定
const paths = {
  ejs: {
    watch: ["./ejs/**/*.ejs"],
    src: ["./ejs/**/*.ejs", "!" + "./ejs/**/_*.ejs"], //アンダーバー付ejsファイルを除外する
    dist: "./public/"
  },
  html: {
    // src: "index.html",
    src: "./src/html/*.html",
    dist: "./dist/html/"
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

//ejs
const ejsFunc = () => {
  return src(paths.ejs.src)
    .pipe(ejs({}, {}, {
      ext: '.html'
    }))
    .pipe(rename({
      extname: ".html"
    }))
    .pipe(dest(paths.ejs.dist))
}

// htmlフォーマット
const htmlBeautifyFunc = () => {
  return src(paths.html.src)
    .pipe(htmlMin({
      removeComments: true, //コメントを削除
      collapseWhitespace: true, //余白を詰める
      preserveLineBreaks: true //タグ間の改行を詰める
    }))
    .pipe(htmlBeautify({
      indent_size: 2,
      indent_with_tabs: false
    }))
    .pipe(rename({
      extname: '.dist.html'
    }))
    .pipe(dest(paths.html.dist))
};

// Sassコンパイル
sass.compiler = require('sass');
const compileSass = () => {
  return src(paths.styles.src, {
      sourcemaps: true
    })
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sassGlob())
    .pipe(sass({
      fiber: fibers,
      outputStyle: 'expanded'
    }).on("error", sass.logError))
    .pipe(postCss([
      autoprefixer({ //Autoprefixerの指定範囲はpackage.jsonに記述
        cascade: false,
        grid: 'autoplace' // IE11のgrid対応('-ms-')
      }),
      cssDeclSort({
        order: 'smacss'
      })
    ]))
    .pipe(gcmq())
    .pipe(dest(paths.styles.dist))
    .pipe(cleanCss())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(paths.styles.dist, {
      sourcemaps: "./map"
    }))
};

// JavaScriptコンパイル
const jsBabel = () => {
  return src(paths.scripts.src)
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(dest(paths.scripts.dist))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(dest(paths.scripts.dist))
};

// 画像圧縮
const imagesFunc = () => {
  return src(paths.images.src, {
      since: lastRun(imagesFunc)
    })
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
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
    .pipe(dest(paths.images.dist))
};

// ブラウザシンク 同期処理
const browserSyncFunc = (done) => {
  browserSync.init({
    notify: false, //connectedのメッセージ非表示
    server: {
      baseDir: "./"
    },
    reloadOnRestart: true
  });
  done();
};

// ブラウザシンク リロード処理
const browserReloadFunc = (done) => {
  browserSync.reload();
  done();
};

// ファイル監視
const watchFiles = (done) => {
  watch(paths.ejs.watch, series(ejsFunc, browserReloadFunc));
  watch(paths.html.src, series(htmlBeautifyFunc, browserReloadFunc));
  watch(paths.styles.src, series(compileSass, browserReloadFunc));
  watch(paths.scripts.src, series(jsBabel, browserReloadFunc));
  watch(paths.images.src, series(imagesFunc, browserReloadFunc));
  done();
};

exports.default = parallel(watchFiles, browserSyncFunc);

// マップファイル除去
const cleanMap = () => {
  return del([paths.styles.map, paths.scripts.map]);
};
exports.cleanmap = cleanMap;
