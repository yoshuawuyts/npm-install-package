const exec = require('child_process').exec
const mapLimit = require('map-limit')
const noop = require('noop2')

module.exports = npmInstallPackage

// Install an npm package
// ([str]|str, obj, obj, fn) -> null
function npmInstallPackage (deps, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }
  deps = Array.isArray(deps) ? deps : [ deps ]
  opts = opts || opts
  cb = cb || noop

  const args = []
  if (opts.save) args.push('-S')
  if (opts.saveDev) args.push('-D')
  if (opts.cache) args.push('--cache-min Infinity')

  mapLimit(deps, Infinity, iterator, cb)

  function iterator (dep, done) {
    process.stdout.write('pkg: ' + dep + '\n')
    const cliArgs = ['npm i'].concat(args, dep).join(' ')
    exec(cliArgs, function (err, name) {
      if (err) return done(err)
      done()
    })
  }
}
