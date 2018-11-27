/**
 * Copyright (c) eVisit, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const PATH = require('path');

function getHMRTransform(filename) {
  var hmrTransform  = 'react-transform-hmr/lib/index.js',
      transformPath = require.resolve(hmrTransform),
      transform     = (filename)
                        ? ('./' + PATH.relative(PATH.dirname(filename), transformPath)) // packager can't handle absolute paths
                        : hmrTransform;

  // Fix the module PATH to use '/' on Windows.
  if (PATH.sep === '\\')
    transform = transform.replace(/\\/g, '/');

  return transform;
}

function getPluginOptions(_context, pluginName, _opts) {
  var context               = _context || {},
      opts                  = _opts || {},
      defaultPluginOptions  = {
        '@babel/plugin-proposal-class-properties': {
          loose: true
        },
        '@babel/plugin-transform-modules-commonjs': {
          strict: false,
          strictMode: false, // prevent "use strict" injections
          lazy: !!(opts.lazyImportExportTransform),
          allowTopLevelThis: true // dont rewrite global `this` -> `undefined`
        },
        '@babel/plugin-transform-template-literals': {
          loose: true // dont 'a'.concat('b'), just use 'a'+'b'
        },
        '@babel/plugin-proposal-optional-chaining': {
          loose: true
        },
        '@babel/plugin-proposal-nullish-coalescing-operator': {
          loose: true
        },
        '@babel/plugin-transform-runtime': {
          helpers: true,
          regenerator: true
        },
        'metro-babel7-plugin-react-transform': (context) => {
          return {
            transforms: [
              {
                transform: getHMRTransform(context.fileName),
                imports: ['react'],
                locals: ['module']
              }
            ]
          };
        }
      },
      defaultOpts           = defaultPluginOptions[pluginName],
      pluginOpts            = opts['pluginOptions'] || {},
      thisPluginOpts        = pluginOpts[pluginName];

  if (typeof defaultOpts === 'function')
    defaultOpts = defaultOpts(context, opts);

  if (typeof thisPluginOpts === 'function')
    thisPluginOpts = thisPluginOpts(context, opts);

  return Object.assign({}, defaultOpts || {}, context.extraOpts ||{}, thisPluginOpts || {});
}

function loadPlugin(context, name, opts, condition) {
  if (typeof condition === 'function' && !condition())
    return null;

  var altName = name;
  if (altName.indexOf('./transforms/') === 0)
    altName = altName.substring('./transforms/'.length);

  return [
    require(name),
    getPluginOptions(context, altName, opts)
  ];
}

module.exports = {
  getPluginOptions,
  loadPlugin
};
