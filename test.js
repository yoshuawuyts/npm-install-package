var pkg = require('base-package-json')
var concat = require('concat-stream')
var mapLimit = require('map-limit')
var readdirp = require('readdirp')
var json = require('JSONStream')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var pump = require('pump')
var path = require('path')
var test = require('tape')
var fs = require('fs')

var install = require('./')

test('should install dependencies', function (t) {
  t.plan(5)
  var dir = 'tmp'

  var fns = [ mkdir, createPkg, installDeps, readDirs, clean ]
  mapLimit(fns, 1, function (fn, cb) { fn(cb) }, function (err) {
    t.error(err, 'no err')
  })

  function mkdir (next) {
    mkdirp(dir, function (err) {
      if (err) return next(err)
      process.chdir(dir)
      next()
    })
  }

  function createPkg (next) {
    var rs = pkg()
    var ts = json.stringify()
    var ws = fs.createWriteStream(path.join(process.cwd(), 'package.json'))
    pump(rs, ts, ws, next)
  }

  function installDeps (next) {
    var devDeps = [ 'map-limit', 'minimist' ]
    var opts = { saveDev: true, cache: true }
    install(devDeps, opts, next)
  }

  function readDirs (next) {
    var opts = {
      rootDir: path.join(dir, 'node_modules'),
      entryType: 'directories',
      depth: 1
    }
    var rs = readdirp(opts)
    var ws = concat({ object: true }, function (arr) {
      t.ok(Array.isArray(arr), 'is array')
      var paths = arr.map(function (el) { return el.path })
      t.notEqual(paths.indexOf('node_modules'), -1)
      t.notEqual(paths.indexOf('node_modules/minimist'), -1)
      t.notEqual(paths.indexOf('node_modules/map-limit'), -1)
      next()
    })
    rs.pipe(ws)
  }

  function clean (next) {
    process.chdir(path.join(process.cwd(), '..'))
    rimraf(path.join(process.cwd(), dir), next)
  }
})

test('should install a single dependency', function (t) {
  t.plan(4)
  var dir = 'tmp'

  var fns = [ mkdir, createPkg, installDeps, readDirs, clean ]
  mapLimit(fns, 1, function (fn, cb) { fn(cb) }, function (err) {
    t.error(err, 'no err')
  })

  function mkdir (next) {
    mkdirp(dir, function (err) {
      if (err) return next(err)
      process.chdir(dir)
      next()
    })
  }

  function createPkg (next) {
    var rs = pkg()
    var ts = json.stringify()
    var ws = fs.createWriteStream(path.join(process.cwd(), 'package.json'))
    pump(rs, ts, ws, next)
  }

  function installDeps (next) {
    var deps = 'map-limit'
    var opts = { save: true, cache: true }
    install(deps, opts, next)
  }

  function readDirs (next) {
    var opts = {
      rootDir: path.join(dir, 'node_modules'),
      entryType: 'directories',
      depth: 1
    }
    var rs = readdirp(opts)
    var ws = concat({ object: true }, function (arr) {
      t.ok(Array.isArray(arr), 'is array')
      var paths = arr.map(function (el) { return el.path })
      t.notEqual(paths.indexOf('node_modules'), -1)
      t.notEqual(paths.indexOf('node_modules/map-limit'), -1)
      next()
    })
    rs.pipe(ws)
  }

  function clean (next) {
    process.chdir(path.join(process.cwd(), '..'))
    rimraf(path.join(process.cwd(), dir), next)
  }
})
