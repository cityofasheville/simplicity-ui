'use strict';

//   ____ _   _ _     ____  
//  / ___| | | | |   |  _ \ 
// | |  _| | | | |   | |_) |
// | |_| | |_| | |___|  __/ 
//  \____|\___/|_____|_|    
//                        

 //  _   _  ___  ____  _____   ____   _    ____ _  __    _    ____ _____ ____  
 // | \ | |/ _ \|  _ \| ____| |  _ \ / \  / ___| |/ /   / \  / ___| ____/ ___| 
 // |  \| | | | | | | |  _|   | |_) / _ \| |   | ' /   / _ \| |  _|  _| \___ \ 
 // | |\  | |_| | |_| | |___  |  __/ ___ \ |___| . \  / ___ \ |_| | |___ ___) |
 // |_| \_|\___/|____/|_____| |_| /_/   \_\____|_|\_\/_/   \_\____|_____|____/ 
 //                                                                         

//***REQUIRE NODE PACKAGES***//

//***FOR GULP***//
var gulp = require('gulp');

//***FOR FILE/DIRECTORIES***//
//Logs the size of the file
var size = require('gulp-size');
//Filters files with globs so filtered files can be assigned to a variable
var filter = require('gulp-filter');
//Remove or replace relative path for files
var flatten = require('gulp-flatten');
//Concatenates files 
var concat = require('gulp-concat');
//Deletes folders and/or files using globs
var del = require('del');
//Adds a hash to a filename to prevent cacheing of changed resource
var rev = require('gulp-rev');
//Renames a file
var rename = require('gulp-rename');

//***FOR STREAMS***
//Toolkit for working with streams
var es = require('event-stream');

//***FOR SASS***//
//Compiles .scss files using lib-sass for Node (no Ruby dependency)
var sass = require('gulp-sass');

//***FOR JAVASCRIPT***//
//Checks JavaScript syntax
var jshint = require('gulp-jshint');
//Minifies JavaScript
var uglify = require('gulp-uglify');

//***FOR HTML***//
//Minifies html
var minifyHTML = require('gulp-minify-html');
//Inject CSS and JS depenencies into HTML as script and link tags
var inject = require("gulp-inject");

//***FOR ANGULARJS***// 
//Converts AngularJS views into AngularJS template cache JS files
var ngHTML2js = require("gulp-ng-html2js");
//Adds or removes AngularJS dependency injection
var ngAnnotate = require('gulp-ng-annotate');

//***FOR DEV SERVER***// 
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

//***FOR TESTING***//
var karma = require('karma').server;

//  _____  _    ____  _  ______  
// |_   _|/ \  / ___|| |/ / ___| 
//   | | / _ \ \___ \| ' /\___ \ 
//   | |/ ___ \ ___) | . \ ___) |
//   |_/_/   \_\____/|_|\_\____/ 
//

//Generic error handler for tasks
function handleError(err) {
  	console.error(err.toString());
  	this.emit('end');
}

//***** DEFAULT TASKS ******//

gulp.task('default', function () {
    //DO NOTHING BY DEFAULT
});

//***** DEV SERVER TASKS ******//

gulp.task('browser-sync', ['build'], function() {
    browserSync({
        server: {
            baseDir: "dev"
        },
        ghostMode : false
    });
});

gulp.task('serve', ['build','watch', 'browser-sync']);

gulp.task('reload', ['build'], function() {
    gulp.src('dev/*')
      .pipe(reload({stream:true}));
});

//***** WATCH TASKS ******//

gulp.task('watch',function () {
  gulp.watch('app/**/*.scss', ['reload']);
  gulp.watch('app/**/*.js', ['reload']);
  gulp.watch('app/**/*.html', ['reload']);
});


//***** BUILD TASKS ******//

//Removes the dev directory so that we can start over with a fresh build
gulp.task('clean:dev', function (cb) {
  	del('dev/**', cb);
});

//Removes the dist directory so that we can start over with a fresh build
gulp.task('clean:dist', function (cb) {
  	del('dist/**', cb);
});

//Copies index.html to the dev and dist directories 
//Target directories should be cleaned prior to copying 
gulp.task('copy-indexes', ['clean:dev', 'clean:dist'], function(){
	return gulp.src('app/index.html')
		.pipe(gulp.dest('dev'))
		.pipe(gulp.dest('dist'));
});

//Compiles SASS to dev/styles.css and dist/styles.css
gulp.task('styles', function () {
  	return gulp.src('app/assets/styles/**/*.scss')
	    .pipe(sass({style: 'expanded'}))
	    .on('error', handleError)
	    .pipe(rev())
	    .pipe(gulp.dest('dev'))
	    .pipe(gulp.dest('dist'))
	    .pipe(size());
});

//Converts HTML Templates into AngularJS Template Cache JS Files
//Collects and concantenates all other JS files
//Checks JS Syntax & Best Practices with JSHint
//Annonates AngularJS dependency injection
//Adds a hash to a filename to prevent cacheing
//Copies result to dev directory
//Ugilfies result
//Copies to dist directory

gulp.task('js', function () {
  	//Convert HTML Templates into AngularJS Template Caches, and pipe into stream
  	var htmlTemplateCacheJavaScript = gulp.src('app/components/**/*.html')
	    .pipe(minifyHTML({
	      empty: true,
	      spare: true,
	      quotes: true
	    }))
	    .pipe(ngHTML2js({
	      moduleName: 'simplicity'
	    }))
	    .pipe(concat('templateCache.js'));
	//Collect application JavaScript into a stream
	var applicationJavaScript = gulp.src([
    'app/adapters/simplicity.google.places.api.adapter.js',
    'app/adapters/simplicity.arcgis.rest.api.adapter.js', 
    'app/simplicity.http.js',
    'app/simplicity.frontend.config.js', 
    'app/simplicity.backend.config.js', 
    'app/simplicity.js',
    'app/**/*.js',
    '!app/assets/**/*.js']);
	//Merges to two streams of JavaScript files
	return es.merge(applicationJavaScript, htmlTemplateCacheJavaScript)
	    .pipe(concat('app.js'))
	    .pipe(gulp.dest('dev'))
	    .pipe(jshint())
    	.pipe(jshint.reporter('jshint-stylish'))
    	.pipe(ngAnnotate())
    	.pipe(rev())
	    .pipe(gulp.dest('dev'))
	    .pipe(rename('app.min.js'))
	    .pipe(rev())
	    .pipe(uglify())
	    .pipe(gulp.dest('dist'))
	    .pipe(size());

});

gulp.task('js-assets', function () {
  return gulp.src('app/assets/js/*.js')
      .pipe(concat('assets.js'))
      .pipe(rev())
      .pipe(gulp.dest('dev'))
      .pipe(rename('assets.min.js'))
      .pipe(rev())
      .pipe(uglify())
      .pipe(gulp.dest('dist'))
      .pipe(size());

});


//Copies fonts while flattening directory stucture
gulp.task('fonts', ['clean:dev', 'clean:dist'], function () {
  return gulp.src('app/assets/fonts/*.{eot,svg,ttf,woff}')
    .pipe(flatten())
    .pipe(gulp.dest('dev/fonts'))
    .pipe(gulp.dest('dist/fonts'))
    .pipe(size());
});

//Copies images while flattening directory stucture
gulp.task('images', ['clean:dev', 'clean:dist'],function () {
  return gulp.src('app/assets/images/*.png')
    .pipe(flatten())
    .pipe(gulp.dest('dev/images'))
    .pipe(gulp.dest('dist/images'))
    .pipe(size());
});

//Copies images while flattening directory stucture
gulp.task('logo', ['clean:dev', 'clean:dist'],function () {
  return gulp.src('app/*.png')
    .pipe(flatten())
    .pipe(gulp.dest('dev'))
    .pipe(gulp.dest('dist'))
    .pipe(size());
});

//Copies favicon while flattening directory stucture
gulp.task('favicon', ['clean:dev', 'clean:dist'],function () {
  return gulp.src('app/favicon.ico')
    .pipe(flatten())
    .pipe(gulp.dest('dev'))
    .pipe(gulp.dest('dist'))
    .pipe(size());
});

//Injects dev CSS and JS depenencies into index.html as script and link tags
gulp.task('inject:dev', ['fonts', 'favicon', 'images', 'logo', 'copy-indexes', 'styles', 'js', 'js-assets'], function(){
	var sources = gulp.src(['dev/*.js', 'dev/*.css'], {read: false});
	return gulp.src('dev/index.html')
		.pipe(inject(sources, {relative: true}))
		.pipe(gulp.dest('dev'));
});

//Injects dist CSS and JS depenencies into index.html as script and link tags
gulp.task('inject:dist', [ 'fonts', 'favicon', 'images', 'logo','copy-indexes', 'styles', 'js', 'js-assets'], function(){
	var sources = gulp.src(['dist/*.js', 'dist/*.css'], {read: false});
	return gulp.src('dist/index.html')
		.pipe(inject(sources, {relative: true}))
		.pipe(gulp.dest('dist'));
});

//** Builds dev and dist folders *//
gulp.task('build',['inject:dev', 'inject:dist']);



//***** Unit TEST TASKS ******//
/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js'
  }, done);
});

// gulp.task('default', ['tdd']);
//***** End to End (e2e) TEST TASKS ******//

// Downloads the selenium webdriver
// gulp.task('webdriver-update', $.protractor.webdriver_update);

// gulp.task('webdriver-standalone', $.protractor.webdriver_standalone);

// gulp.task('protractor-only', ['webdriver-update', 'wiredep'], function (done) {
//   var testFiles = [
//     'test/e2e/**/*.js'
//   ];

//   gulp.src(testFiles)
//     .pipe($.protractor.protractor({
//       configFile: 'test/protractor.conf.js',
//     }))
//     .on('error', function (err) {
//       // Make sure failed tests cause gulp to exit non-zero
//       throw err;
//     })
//     .on('end', function () {
//       // Close browser sync server
//       browserSync.exit();
//       done();
//     });
// });

// gulp.task('protractor', ['serve:e2e', 'protractor-only']);
// gulp.task('protractor:src', ['serve:e2e', 'protractor-only']);
// gulp.task('protractor:dist', ['serve:e2e-dist', 'protractor-only']);
	