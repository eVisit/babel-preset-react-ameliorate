const babel = require("@babel/core"),
      FS = require('fs'),
      PATH = require('path'),
      presetReact = require('@babel/preset-react'),
      presetReactAmeliorate = require('../lib');

const DEFAULT_BABEL_OPTIONS = {
  code: true,
  ast: false,
  babelrc: false,
  presets: [
    presetReact,
    presetReactAmeliorate
  ]
};

function transform(code, extraOpts) {
  return new Promise((resolve, reject) => {
    babel.transform(('' + code), Object.assign({}, DEFAULT_BABEL_OPTIONS, extraOpts || {}), function(error, result) {
      if (error)
        return reject(error);

      resolve(result);
    });
  });
}

function transformFile(fileName) {
  var fullFileName = (PATH.join(__dirname, 'test-code', fileName) + '.js');
  return transform(FS.readFileSync(fullFileName), { filename: fullFileName });
}

describe('babel-preset-react-ameliorate', function () {
  it('should work', async function() {
    var result = await transformFile('test01');
    debugger;
  });
});
