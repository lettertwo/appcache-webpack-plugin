gulp = require 'gulp'
coffee = require 'gulp-coffee'
{spawn} = require 'child_process'

bump = (type, callback) ->
  spawn 'npm', ['version', type, '-m', 'Release %s'], stdio: 'inherit'
    .on 'exit', callback

gulp.task 'bump:major', (callback) -> bump 'major', callback
gulp.task 'bump:minor', (callback) -> bump 'minor', callback
gulp.task 'bump:patch', (callback) -> bump 'patch', callback

gulp.task 'build', ->
  gulp.src './src/*.coffee'
    .pipe coffee(bare: true).on('error', console.log)
    .pipe gulp.dest './lib'
