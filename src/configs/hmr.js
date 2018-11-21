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

const common        = require('../common'),
      loadPlugin    = common.loadPlugin;

module.exports = function(opts, filename) {
  return {
    plugins: [
      loadPlugin({ src: null, fileName: filename }, 'metro-babel7-plugin-react-transform', opts || {})
    ]
  };
};
