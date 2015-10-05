const pkg = require('base-package-json')
const concat = require('concat-stream')
const mapLimit = require('map-limit')
const readdirp = require('readdirp')
const json = require('JSONStream')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const pump = require('pump')
const path = require('path')
const test = require('tape')
const fs = require('fs')

const install = require('./')

test('should install dependencies', function (t) {
  t.plan(5)
  const dir = 'tmp'

  const fns = [ mkdir, createPkg, installDeps, readDirs, clean ]
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
    const rs = pkg()
    const ts = json.stringify()
    const ws = fs.createWriteStream(path.join(process.cwd(), 'package.json'))
    pump(rs, ts, ws, next)
  }

  function installDeps (next) {
    const devDeps = [ 'map-limit', 'minimist' ]
    const opts = { saveDev: true, cache: true }
    install(devDeps, opts, next)
  }

  function readDirs (next) {
    const opts = {
      rootDir: path.join(dir, 'node_modules'),
      entryType: 'directories',
      depth: 1
    }
    const rs = readdirp(opts)
    const ws = concat({ object: true }, function (arr) {
      t.ok(Array.isArray(arr), 'is array')
      const paths = arr.map(function (el) { return el.path })
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
