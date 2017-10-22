var gulp = require('gulp');
// uglify = require('gulp-uglify'),
// concat = require('gulp-concat'),
// minifyCSS = require('gulp-minify-css');

// gulp.task('css', function() {
//     gulp.src([
//             'app/assets/css/*.css'
//         ])
//         //.pipe(minifyCSS())
//         //.pipe(concat('style.css'))
//         .pipe(gulp.dest('public/css'));
// });

// gulp.task('js', function() {
//     gulp.src([
//             'node_modules/jquery/dist/jquery.js',
//             'app/assets/js/**/*.js'
//         ])
//         //.pipe(uglify())
//         //.pipe(concat('script.js'))
//         .pipe(gulp.dest('public/js'));
// });

gulp.task('libs', function(){
    gulp.src(['node_modules/noty/lib/**'])
    .pipe(gulp.dest('public/libs/noty'));
    gulp.src(['node_modules/jquery/dist/**'])
    .pipe(gulp.dest('public/libs/jquery'));
    gulp.src(['node_modules/@fengyuanchen/datepicker/dist/**'])
    .pipe(gulp.dest('public/libs/datepicker'));
});

// gulp.task('img', function(){
//     gulp.src([
//         'app/assets/images/*.*'
//     ])
//     .pipe(gulp.dest('public/images'));
// });

// gulp.task('default', function() {
//     gulp.run('js', 'css', 'img');
// });
