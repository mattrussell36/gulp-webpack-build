const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const gulp = require('gulp');
const merge = require('merge-stream');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const gulpStylelint = require('gulp-stylelint');
const sourcemaps = require('gulp-sourcemaps');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync');
const webpack = require('webpack-stream');
const CONFIG = require('./config.themes.json');
const javascriptEntry = require('./webpack.parts').entry;
const IS_PRODUCTION = argv.production ? true : false;
const IS_WATCH = argv.watch ? true : false;
const TARGETS = Object.keys(CONFIG);
const TARGET = argv._[0];
const targets = TARGET ? [TARGET] : TARGETS;
const webpackConfig = require('./webpack.config.js')(IS_PRODUCTION, IS_WATCH);

function getFullPath(file, target) {
    return path.resolve('themes', target, file);
}

gulp.task('styles', ['stylelint'], function () {
    const tasks = targets.map((target) => {
        const config = CONFIG[target];
        const files = Object.values(config.styles).map(file => {
            return getFullPath(file, target);
        });
        
        return gulp.src(files)
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.write())
            .pipe(
                gulpif(IS_PRODUCTION, uglifycss())
            )
            .pipe(gulp.dest(`./build/${target}`))
            .pipe(
                gulpif(IS_WATCH, browserSync.reload({
                    stream: true,
                }))
            );
    });
    
    return merge(tasks);
});

gulp.task('stylelint', function () {
    const tasks = targets.map((target) => {
        const config = CONFIG[target];
        const files = Object.values(config.styles).map(file => {
            return getFullPath(file, target);
        });
        
        return gulp.src([
            './styles/**/*.scss',
            `./themes/${target}/**/*.scss`,
        ])
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

const tasks = IS_WATCH ?
    ['browsersync', 'styles', 'webpack'] :
    ['styles', 'webpack'];

TARGETS.forEach(function(target) {
    gulp.task(target, tasks, function() {
        console.log(`building ${target} in ${IS_PRODUCTION ? 'production' : 'development'} mode`);

        if (IS_WATCH) {
            gulp.watch([
                './styles/**/*.scss',
                `./themes/${target}/**/*.scss`,
            ], ['styles']);
            console.log('Watching...');
        }
    });
});

