/* eslint-disable security/detect-non-literal-fs-filename */
const browserify = require('browserify');
const fs = require('fs');

async function bundle(modulePath, outputPath, cb) {
  browserify(fs.createReadStream(modulePath), {
    basedir: process.cwd(),
    standalone: 'bundle',
  })
    .transform('uglifyify', { global: true })
    .bundle()
    .pipe(fs.createWriteStream(outputPath))
    .on('close', function () {
      try {
        fs.unlinkSync(modulePath);
      } catch (error) {
        cb(error);
      }
      cb(null);
    })
    .on('error', function (err) {
      cb(err);
    });
}

module.exports = {
  bundle,
};
