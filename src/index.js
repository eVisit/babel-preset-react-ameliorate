/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Modified by eVisit, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const pluginUtils       = require('@babel/helper-plugin-utils'),
      common            = require('./common'),
      getPluginOptions  = common.getPluginOptions,
      loadPlugin        = common.loadPlugin;

function getDefaultPlugins(context, opts) {
  var defaultPlugins = [
    loadPlugin(context, '@babel/plugin-proposal-optional-catch-binding', opts),
    loadPlugin(context, '@babel/plugin-transform-block-scoping',         opts),
    // the flow strip types plugin must go BEFORE class properties!
    // there'll be a test case that fails if you don't.
    loadPlugin(context, '@babel/plugin-transform-flow-strip-types',      opts),
    loadPlugin(context, '@babel/plugin-proposal-class-properties',       opts),
    loadPlugin(context, '@babel/plugin-syntax-dynamic-import',           opts),
    loadPlugin(context, '@babel/plugin-syntax-export-default-from',      opts),
    loadPlugin(context, '@babel/plugin-transform-computed-properties',   opts),
    loadPlugin(context, '@babel/plugin-transform-destructuring',         opts),
    loadPlugin(context, '@babel/plugin-transform-function-name',         opts),
    loadPlugin(context, '@babel/plugin-transform-literals',              opts),
    loadPlugin(context, '@babel/plugin-transform-parameters',            opts),
    loadPlugin(context, '@babel/plugin-transform-shorthand-properties',  opts),
    loadPlugin(context, '@babel/plugin-transform-react-jsx',             opts),
    loadPlugin(context, '@babel/plugin-transform-regenerator',           opts),
    loadPlugin(context, '@babel/plugin-transform-sticky-regex',          opts),
    loadPlugin(context, '@babel/plugin-transform-unicode-regex',         opts)
  ];

  return defaultPlugins.filter(Boolean);
}

function getExtraPlugins(_context, opts) {
  const context = _context || {},
        src = context.src || null,
        isNull = (src == null),
        hasClass = (isNull || src.indexOf('class') > -1),
        hasForOf = (isNull || (src.indexOf('for') > -1 && src.indexOf('of') > -1));

  var extraPlugins = [
    loadPlugin(context, '@babel/plugin-proposal-export-default-from',          opts, () => (!opts.disableImportExportTransform)),
    loadPlugin(context, '@babel/plugin-transform-modules-commonjs',            opts, () => (!opts.disableImportExportTransform)),
    loadPlugin(context, '@babel/plugin-transform-classes',                     opts, () => (hasClass)),
    loadPlugin(context, '@babel/plugin-transform-arrow-functions',             opts, () => (isNull || src.indexOf('=>') > -1)),
    loadPlugin(context, '@babel/plugin-transform-spread',                      opts, () => (isNull || hasClass || src.indexOf('...') > -1)),
    loadPlugin(context, '@babel/plugin-proposal-object-rest-spread',           opts, () => (isNull || hasClass || src.indexOf('...') > -1)),
    loadPlugin(context, '@babel/plugin-transform-template-literals',           opts, () => (isNull || src.indexOf('`') > -1)),
    loadPlugin(context, '@babel/plugin-transform-exponentiation-operator',     opts, () => (isNull || src.indexOf('**') > -1)),
    loadPlugin(context, '@babel/plugin-transform-object-assign',               opts, () => (isNull || src.indexOf('Object.assign') > -1)),
    loadPlugin(context, '@babel/plugin-transform-for-of',                      opts, () => (hasForOf)),
    loadPlugin(context, './transforms/transform-symbol-member',                opts, () => (hasForOf || src.indexOf('Symbol') > -1)),
    loadPlugin(context, '@babel/plugin-transform-react-display-name',          opts, () => (isNull || src.indexOf('React.createClass') > -1 || src.indexOf('createReactClass') > -1)),
    loadPlugin(context, '@babel/plugin-proposal-optional-chaining',            opts, () => (isNull || src.indexOf('?.') !== -1)),
    loadPlugin(context, '@babel/plugin-proposal-nullish-coalescing-operator',  opts, () => (isNull || src.indexOf('??') > -1)),
    loadPlugin(context, '@babel/plugin-transform-react-jsx-source',            opts, () => (opts.dev)),
    loadPlugin(context, '@babel/plugin-transform-runtime',                     opts, () => (opts.enableBabelRuntime !== false))
  ];

  var userSpecifiedPlugins = opts.plugins;
  if (typeof userSpecifiedPlugins === 'function')
    userSpecifiedPlugins = userSpecifiedPlugins(context, opts);

  if (userSpecifiedPlugins instanceof Array)
    extraPlugins = extraPlugins.concat(userSpecifiedPlugins);

  return extraPlugins.filter(Boolean);
}

function getPreset(context, _opts) {
  var opts = _opts || {};

  return {
    comments: false,
    compact: true,
    overrides: [
      {
        plugins: preset.getDefaultPlugins(context, opts)
      },
      {
        test: (fileName) => (/\.ts$/).test(('' + fileName)),
        plugins: [
          loadPlugin(context, '@babel/plugin-transform-typescript', opts, undefined, { isTSX: false })
        ]
      },
      {
        test: (fileName) => (/\.tsx$/).test(('' + fileName)),
        plugins: [
          loadPlugin(context, '@babel/plugin-transform-typescript', opts, undefined, { isTSX: true })
        ]
      },
      {
        plugins: preset.getExtraPlugins(context, opts)
      }
    ]
  };
};

const preset = pluginUtils.declare((api, opts) => {
  api.assertVersion(7);

  if (opts.withDevTools == null) {
    const env = (process.env.BABEL_ENV || process.env.NODE_ENV);
    if (!env || env === 'development')
      return preset.getPreset(null, Object.assign({}, opts, { dev: true }));
  }

  return preset.getPreset(null, opts);
});

preset.getPluginOptions = getPluginOptions;
preset.loadPlugin = loadPlugin;
preset.getDefaultPlugins = getDefaultPlugins;
preset.getExtraPlugins = getExtraPlugins;
preset.getPreset = (src, ...args) => getPreset({ src, fileName: null }, ...args);

module.exports = preset;
