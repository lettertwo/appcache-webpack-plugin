gulp = require 'gulp'
coffee = require 'gulp-coffee'
gbump = require 'gulp-bump'

bump = (type) ->
  gulp.src ['./package.json']
    .pipe gbump {type}
    .pipe gulp.dest './'

gulp.task 'bump:major', -> bump 'major'
gulp.task 'bump:minor', -> bump 'minor'
gulp.task 'bump:patch', -> bump 'patch'

gulp.task 'build', ->
  gulp.src './src/*.coffee'
    .pipe coffee(bare: true).on('error', console.log)
    .pipe gulp.dest './lib'
