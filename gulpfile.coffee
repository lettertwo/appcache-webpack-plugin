gulp = require 'gulp'
coffee = require 'gulp-coffee'
mocha = require 'gulp-mocha'
{spawn} = require 'child_process'

bump = (type, callback) ->
  spawn 'npm', ['version', type, '-m', 'Release %s'], stdio: 'inherit'
    .on 'exit', callback

errorHandler = (error) ->
  console.log error.toString 'utf8'
  @emit 'end'

gulp.task 'bump:major', (callback) -> bump 'major', callback
gulp.task 'bump:minor', (callback) -> bump 'minor', callback
gulp.task 'bump:patch', (callback) -> bump 'patch', callback

gulp.task 'build', ->
  gulp.src './src/*.coffee'
    .pipe coffee bare: true
      .on 'error', errorHandler
    .pipe gulp.dest './lib'

gulp.task 'build:tests', ->
  gulp.src './test/*.coffee'
    .pipe coffee bare: true
      .on 'error', errorHandler
    .pipe gulp.dest './test'

gulp.task 'test', ['build', 'build:tests'], ->
  gulp.src './test/*.js', read: false
    .pipe mocha reporter: 'spec'
      .on 'error', errorHandler

gulp.task 'watch', ->
  gulp.watch ['src/**/*.coffee', 'test/**/*.coffee'], ['test']
