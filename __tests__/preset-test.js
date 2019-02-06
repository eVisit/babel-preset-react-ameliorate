const babel = require("@babel/core"),
      FS = require('fs'),
      PATH = require('path'),
      presetReactAmeliorate = require('../src');

// Date mock
require('jest-mock-now')();

const baseProps = {
  id: '__ID__',
  customPropString: 'hello world!',
  customPropBoolean: true,
  customPropNumber: 5,
  customPropArray: [
    5,
    true,
    "derp!!!"
  ],
  customPropObject: {
    sweet: 'stuff',
    awesome: 453,
    dude: 'crazy!'
  }
};

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
        'babel-plugin-transform-react-ameliorate-jsx': {
          pragma: '__somethingElseBro(this)'
        }
      }
    });

    expect(result.code.indexOf('__somethingElseBro')).toBeGreaterThan(-1);
    expect(result.code).toMatchSnapshot();
  });

  it('should work allow adding extra JSX properties', async function() {
    var result = await transformFile('test01', {
      pluginOptions: {
        'transform-react-jsx-properties': {
          elements: [
            {
              test: '^.*$',
              props: baseProps
            },
            {
              test: '^div$',
              props: { elementType: 'div' }
            },
            {
              test: '^span$',
              props: { elementType: 'span' }
            }
          ]
        }
      }
    });

    expect(result.code.indexOf('customPropString')).toBeGreaterThan(-1);
    expect(result.code.indexOf('customPropBoolean')).toBeGreaterThan(-1);
    expect(result.code.indexOf('customPropNumber')).toBeGreaterThan(-1);
    expect(result.code.indexOf('customPropArray')).toBeGreaterThan(-1);
    expect(result.code.indexOf('derp!!!')).toBeGreaterThan(-1);
    expect(result.code.indexOf('sweet')).toBeGreaterThan(-1);
    expect(result.code.indexOf('stuff')).toBeGreaterThan(-1);
    expect(result.code.indexOf('awesome')).toBeGreaterThan(-1);
    expect(result.code.indexOf('453')).toBeGreaterThan(-1);
    expect(result.code.indexOf('dude')).toBeGreaterThan(-1);
    expect(result.code.indexOf('crazy!')).toBeGreaterThan(-1);
    expect(result.code).toMatchSnapshot();
  });
});
