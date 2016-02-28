var gulp=require('gulp'),
gutil=require('gulp-util'),
coffee=require('gulp-coffee'),
browserify=require('gulp-browserify'),
compass=require('gulp-compass'),
concat=require('gulp-concat'),
browserSync = require('browser-sync'),
gulpif=require('gulp-if'),
minifyHTML=require('gulp-minify-html'),
jsonMinify=require('gulp-jsonminify'),
imagmin =require('gulp-imagemin'),
pngcrush=require('imagemin-pngcrush')
uglify = require('gulp-uglify')

;

var env,
	coffeeSources,
	jsSources,
	jsonSources,
	sassSources,
	htmlSources,
	sassStyle,
	outputDir;

env = process.env.NODE_ENV || 'development';

if(env==='development'){
	outputDir='build/development/';
	sassStyle='expanded';
} else{
	outputDir='build/production/';
	sassStyle='compressed';
}

coffeeSources =['components/coffee/tagline.coffee'];

jsSources=[
	'components/scripts/rclick.js',
	'components/scripts/pixgrid.js',
	'components/scripts/tagline.js',
	'components/scripts/template.js'
];

sassSources=['components/sass/style.scss'];

htmlSources=[outputDir +'*.html'];

jsonSources=[outputDir +'js/*.json'];

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "build/development"
        }
    });
});

gulp.task('images',function(){
	gulp.src('build/development/images/**/*.*')
	.pipe(gulpif(env==='production',imagmin({
		progressive:true,
		svgoPlugins:[{removeViewBox: false}],
		use:[pngcrush()]
	})))
	.pipe(gulpif(env==='production',gulp.dest(outputDir+'images')))
	.pipe(browser-sync.stream())
});

gulp.task('coffee', function(){
	gulp.src(coffeeSources)
	.pipe(coffee({bare:true})
		.on('error',gutil.log))
	.pipe(gulp.dest('components/scripts'))
}); 
gulp.task('js',function(){
	gulp.src(jsSources)
	.pipe(concat('script.js'))
	.pipe(browserify())
	.pipe(gulpif(env==='production', uglify()))
	.pipe(gulp.dest(outputDir+'js'))
	.pipe(browserSync.stream())
	
});

gulp.task('json',function(){
	gulp.src('build/development/js/*.json')
	 .pipe(gulpif(env==='production',jsonMinify()))
  .pipe(gulpif(env==='production',gulp.dest('build/production/js')))
	.pipe(browserSync.stream())

});

gulp.task('compass',function(){
	gulp.src(sassSources)
	.pipe(compass({
		sass:'components/sass',
		image:outputDir+'images',
		style: sassStyle
	}))
	.on('sass error',gutil.log)
	.pipe(gulp.dest(outputDir+'css'))
	.pipe(browserSync.stream());

});

gulp.task('html', function () {
  gulp.src('build/development/*.html')
  .pipe(gulpif(env==='production',minifyHTML()))
  .pipe(gulpif(env==='production',gulp.dest(outputDir)))
  .pipe(browserSync.stream())
});


gulp.task('watch',function(){
	gulp.watch(coffeeSources,['coffee']);
	gulp.watch(jsSources,['js']);
	gulp.watch('components/sass/*.scss',['compass']);
	gulp.watch('build/development/*.html',['html']);
	gulp.watch('build/development/js/*.json',['json']);
	gulp.watch('build/development/images/**/*.*',['images']);

});


gulp.task('default',['coffee','js','browser-sync','compass','images','html','watch']);
