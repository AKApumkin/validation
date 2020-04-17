"use strict";

// load plugins
const { series, parallel , src, dest, watch } = require('gulp');
const gutil        = require('gulp-util');
const concat       = require('gulp-concat-util');
const sass         = require('gulp-sass');
const postcss      = require('gulp-postcss');
const pxtorem      = require('postcss-pxtorem');
const cleanCSS     = require('gulp-clean-css');
const pug          = require('gulp-pug');
const prettyHtml   = require('gulp-pretty-html');
const ts           = require('gulp-typescript');
const rename       = require('gulp-rename');
const strip        = require('gulp-strip-comments');
const argv         = require('yargs').argv;
const newfile      = require('gulp-file');
const replace      = require('gulp-replace');
const connect      = require('gulp-connect');
const clean        = require('gulp-clean');
const gfi          = require("gulp-file-insert");
const uglify       = require('gulp-uglify');
const jasmine      = require('gulp-jasmine');

// updates the cache buster for live reload
let cache_buster;
let css_replace;
function update_cache_details() {
    cache_buster = Date.now();
    css_replace = '/main.'+cache_buster+'.css';
}
// copy sass, concatinate and minify
var processors = [
    pxtorem()
 ];

// searches for all scss files then compiles, concats and minifys as one final output with cache buster included
function scss_compile() {
    update_cache_details();
    return src('dev/**/**/*.scss')
        .pipe(concat('main.'+cache_buster+'.scss'))
        .pipe(sass({style: 'compressed'}))
        .on('error', gutil.log)
        .pipe(postcss(processors))
        .pipe(cleanCSS())
        .pipe(dest('dist/styles'))
        .pipe(connect.reload());
}

// copies across the main index pug file to html 
function index_compile() {
    return src('dev/index.pug')
        .pipe(pug({pretty: '\t',}))
        .pipe(strip())
        .pipe(prettyHtml())
        .pipe(dest('dist'))
        .pipe(connect.reload());
}

// looks for all the pug files and compiles them to html 
function pug_compile() {
    return src('dev/pages/**/*.pug')
        .pipe(pug({pretty: '\t',}))
        .pipe(strip())
        .pipe(prettyHtml())
        .pipe(rename({dirname: ''}))
        .pipe(dest('dist'))
        .pipe(connect.reload());
}

// looks for all the typescript files within pages and compiles them to js 
function typescript_compile() {
    return src('dev/pages/**/*.ts')
        .pipe(ts({
            noImplicitAny: true
        }))
        .pipe(rename({dirname: ''}))
        .pipe(dest('dist/js'))
        .pipe(connect.reload());
}

// looks for all the typescript files within componenets and compiles them to ts
function typescript_components_compile() {
    return src('dev/components/**/*.ts')
    .pipe(concat('temp.ts'))
    .pipe(dest('dev/'));
}

// inserts the components into a document ready 
function typescript_intergration() {
    return src('dev/components.ts')
    .pipe(gfi({
        '/* file 1 */' : 'dev/temp.ts'
    }))
    .pipe(ts({
        noImplicitAny: true
    }))
    .pipe(dest('dist/js'));
}

//temp function 
function typescript_temp() {
    return src('dev/libraries-ts/*.ts')
        .pipe(ts({
            noImplicitAny: true
        }))
        .pipe(rename({dirname: ''}))
        .pipe(dest('js-other-temp'))
        .pipe(connect.reload());
}

// concatinates and moves all javascript libraries to one single file
function javascript_libraries() {
    return src('dev/libraries-js/*.js')
        .pipe(rename({dirname: ''}))
        .pipe(concat('libraries-js.js'))
        .pipe(dest('js-temp'))
        .pipe(connect.reload());
}

// concatinates and moves all typescript libraries to one single file
function typescript_libraries() {
    return src('dev/libraries-ts/*.ts')
        .pipe(ts({
            noImplicitAny: true
        }))
        .pipe(rename({dirname: ''}))
        .pipe(concat('libraries-ts.js'))
        .pipe(dest('js-temp'))
        .pipe(connect.reload());
}

// concatinates and moves all dist js files as one
function concat_libraries() {
    return src('js-temp/*.js')
        .pipe(rename({dirname: ''}))
        .pipe(concat('libraries.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'))
        .pipe(connect.reload())
}

// replaces the files where main.css is located with the cache buster version
function cache_buster_replace() {
    return src('dist/*.html')
        .pipe(replace('/main.css', css_replace))
        .pipe(dest('dist/'))
}

// copy all assets(images/fonts) into the dist folder
function copy_json() {
    return src('dev/assets/**/*')
        .pipe(dest('dist/assets'))
}

// copy all json files into the dist folder
function assets() {
    return src('dev/json/*.json')
        .pipe(dest('dist/json'))
}

function clean_temp_item() {
    return src('dev/temp.ts', {read: false})
    .pipe(clean());
}

// cleans the dist folder to avoid duplicates 
function clean_dist_folder() {
    return src('dist', {read: false, allowEmpty: true})
    .pipe(clean());
}

// cleans the style folder on a css change
function clean_style_folder() {
    return src('dist/styles', {read: false, allowEmpty: true})
    .pipe(clean());
}

// cleans the dist folder to avoid duplicates 
function clean_jsTemp_folder() {
    return src('js-temp', {read: false })
    .pipe(clean());
}

// unit tests
function unit_test() {
    return src('spec/test.js')
        // gulp-jasmine works on filepaths so you can't have any plugins before it
        .pipe(jasmine())
}
 
// scafolding tool for easy page and component creation. commands are `gulp build --page new` or `gulp build --component other`
function create() {
    if(argv.page){
        return src('something', { allowEmpty: true })
            .pipe(newfile(argv.page + '.ts', 'declare var $:any;\n$( document ).ready(function() {\n\n});'))
            .pipe(newfile(argv.page + '.scss', '.'+argv.page+'{\n}'))
            .pipe(newfile(argv.page + '.pug', 'extends ../../layout.pug \nblock scripts \n\tscript(src="/js/'+argv.page+'.js") \nblock content \n\tdiv.'+argv.page))
            .pipe(dest('dev/pages/'+argv.page));
    }else if (argv.component){
        return src('something', { allowEmpty: true })
            .pipe(newfile(argv.component + '.ts', ''))
            .pipe(newfile(argv.component + '.scss', '.'+argv.component+'{\n}'))
            .pipe(newfile(argv.component + '.pug', 'div.'+argv.component))
            .pipe(dest('dev/components/'+argv.component));
    }else{
        console.log('\x1b[31m%s\x1b[0m', '*error, please use --page or --component to create files');
    }
}

// start server
function connect_server() {
    connect.server({
        port:3333,
        root: 'dist',
        livereload: true
    });
}

// watch for changes  
function watch_compile() {
    return watch(['dev/**/**/*.scss'], series(clean_style_folder, scss_compile, index_compile, pug_compile, cache_buster_replace)),
    watch(['dev/**/**/*.pug'], series(index_compile, pug_compile, cache_buster_replace)),
    watch(['dev/pages/**/*{.js,.ts}'], series(typescript_compile)),
    watch(['dev/components/**/*{.js,.ts}'], series(typescript_components_compile, typescript_intergration, clean_temp_item)),
    watch(['dev/**/**/*{.js,.ts}'], series(javascript_libraries, typescript_libraries, concat_libraries, clean_jsTemp_folder));
}

// gulp functions
exports.default = 
    series(
        clean_dist_folder,
        assets,
        copy_json,
        scss_compile,
        typescript_compile,
        typescript_temp,
        typescript_components_compile,
        typescript_intergration,
        clean_temp_item,
        index_compile, 
        pug_compile,
        javascript_libraries,
        typescript_libraries,
        concat_libraries,
        clean_jsTemp_folder,
        cache_buster_replace,
        parallel(
            connect_server,
            watch_compile
        )
    );
exports.build = create;
exports.unit_test = unit_test;