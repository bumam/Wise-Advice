"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var cssnano = require("gulp-cssnano");
var del = require("del");
var gulpIf = require("gulp-if");
var newer = require("gulp-newer");
var htmlmin = require("gulp-htmlmin");

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

gulp.task("css", function () {
  return gulp
    .src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(gulpIf(isDev, sourcemap.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulpIf(!isDev, cssnano()))
    .pipe(rename("style.min.css"))
    .pipe(gulpIf(!isDev, sourcemap.write(".")))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("minify-html", () => {
  return gulp
    .src("source/**.html")
    .pipe(gulpIf(!isDev, htmlmin({
      collapseWhitespace: true
    })))
    .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
  return gulp
    .src(["source/fonts/**/*.{woff,woff2}", "source/img/**", "!source/img/icon-*.svg"], {
      base: "source",
    })
    .pipe(gulp.dest("build"));
});

gulp.task("copy:fonts", () => {
  return src("source/fonts/*.{woff,woff2}")
    .pipe(newer("build/fonts"))
    .pipe(dest("build/fonts"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false,
    index: "index.html",
  });
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("watch", function () {
  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("minify-html", "refresh"));
  gulp.watch("source/fonts/*.{woff,woff2}", gulp.series("copy:fonts"));
});

gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel("css", "copy"),
    "minify-html",
  )
);
gulp.task("development", gulp.series("build", gulp.parallel("watch", "server")));

gulp.task("default", gulp.series("development"));
