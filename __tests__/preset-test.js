const babel = require("@babel/core"),
      FS = require('fs'),
      PATH = require('path'),
      presetReactAmeliorate = require('../src');

// Date mock
require('jest-mock-now')()

function transform(code, extraOpts, extraBabelOpts) {
  return new Promise((resolve, reject) => {
    var babelOpts = Object.assign({
      code: true,
      ast: false,
      babelrc: false,
      presets: [
        [presetReactAmeliorate, Object.assign({}, extraOpts || {})]
      ]
    }, extraBabelOpts);

    babel.transform(
      ('' + code),
      babelOpts,
      function(error, result) {
        if (error)
          return reject(error);

        resolve(result);
      }
    );
  });
}

function transformFile(fileName, extraOpts) {
  var fullFileName = (PATH.join(__dirname, 'test-code', fileName) + '.js');
  return transform(FS.readFileSync(fullFileName), extraOpts, { filename: fullFileName });
}

describe('babel-preset-react-ameliorate', function () {
  it('should work with default options', async function() {
    var result = await transformFile('test01');
    expect(result.code).toMatchSnapshot();
  });

  it('should work with plugin options', async function() {
    var result = await transformFile('test01', {
      pluginOptions: {
        '@babel/plugin-transform-react-jsx': {
          pragma: '__somethingElseBro(this)'
        }
      }
    });

    expect(result.code.indexOf('__somethingElseBro')).toBeGreaterThan(-1);
    expect(result.code).toMatchSnapshot();
  });
});
