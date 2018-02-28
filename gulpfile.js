const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const gulp = require('gulp');
const merge = require('merge-stream');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const gulpStylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync');
const webpack = require('webpack-stream');
const CONFIG = require('./config.themes.json');
const IS_PRODUCTION = argv.production ? true : false;
const IS_WATCH = argv.watch ? true : false;
const TARGETS = Object.keys(CONFIG);
const TARGET = argv._[0];
const targets = TARGET ? [TARGET] : TARGETS;
const webpackConfig = require('./webpack.config.js')(IS_PRODUCTION, IS_WATCH);

const tasks = IS_WATCH ?
    ['browsersync', 'styles', 'webpack'] :
    ['styles', 'webpack'];

const javascriptEntry = require('./webpack.parts').entry;

function getStyleEntry(target) {
    const config = CONFIG[target];
    const files = Object.values(config.styles).map(file => {
        return path.resolve('themes', target, file);
    });

    return files;
}

function getScssGlob(target) {
    return [
        './styles/**/*.scss',
        `./themes/${target}/**/*.scss`,
    ];
}

gulp.task('styles', ['stylelint'], function () {
    const tasks = targets.map(target => {
        const files = getStyleEntry(target);
        
        return gulp.src(files)
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(postcss()) // gulp-postcss will grab postcss.config.js automatically
            .pipe(
                gulpif(IS_PRODUCTION, uglifycss())
            )
            .pipe(
                gulpif(IS_WATCH, browserSync.reload({
                    stream: true,
                }))
            )
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(`./build/${target}`));
    });
    
    return merge(tasks);
});

gulp.task('stylelint', function () {
    const tasks = targets.map((target) => {
        const files = getStyleEntry(target);
        const ScssGlob = getScssGlob(target);
        
        return gulp.src(ScssGlob)
            .pipe(gulpStylelint({
                reporters: [
                    { formatter: 'string', console: true }
                ]
            }));
    });

    return merge(tasks);
});

gulp.task('webpack', function () {
    gulp.src(Object.values(javascriptEntry))
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('./build/common'));
});

gulp.task('browsersync', function () {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
});

gulp.task('default', TARGETS, function () {
    console.log(`All themes built in ${IS_PRODUCTION ? 'production' : 'development mode'}`);
});

TARGETS.forEach(function(target) {
    gulp.task(target, tasks, function() {
        console.log(`building ${target} in ${IS_PRODUCTION ? 'production' : 'development'} mode`);
        const ScssGlob = getScssGlob(target);

        if (IS_WATCH) {
            gulp.watch(ScssGlob, ['styles']);
            console.log('Watching...');
        }
    });
});

