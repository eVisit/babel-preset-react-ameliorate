/**
 * Copyright (c) eVisit, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const pluginUtils       = require('@babel/helper-plugin-utils'),
      babelCore         = require('@babel/core'),
      types             = babelCore.types;

function valueToASTLiteral(_value) {
  if (_value === undefined)
    return;

  var value = _value;
  if (value instanceof String || value instanceof Number || value instanceof Boolean)
    value = value.valueOf();

  if (value === null || typeof value !== "object") {
    if (value === null)
      return types.nullLiteral();

    var thisType = typeof value;
    if (thisType === 'string')
      return types.stringLiteral(value);
    else if (thisType === 'boolean')
      return types.booleanLiteral(value);
    else if (thisType === 'number')
      return types.numberLiteral(value);
  }

  if (Array.isArray(value))
    return types.arrayExpression(value.map(valueToASTLiteral));

  return types.objectExpression(Object.keys(value).map((key) => {
    var propValue = value[key];
    if (propValue === undefined)
      return;

    return types.objectProperty(
      types.identifier(key),
      valueToASTLiteral(value)
    );
  }).filter(Boolean));
}

module.exports = pluginUtils.declare((api, opts) => {
  api.assertVersion(7);

  var props = Object.assign({}, opts.props || {});
  var idCounter = Date.now();

  const visitor = {
    JSXOpeningElement({ node }) {
      props['data-ra-id'] = ('' + idCounter++);

      var keys = Object.keys(props);
      for (var i = 0, il = keys.length; i < il; i++) {
        var key = keys[i],
            propValue = props[key];

        var jsxValue = valueToASTLiteral(propValue);
        if (jsxValue === undefined)
          continue;

        var jsxKey = types.jsxIdentifier(key);

        node.attributes.push(types.jsxAttribute(jsxKey, types.jsxExpressionContainer(jsxValue)));
      }
    }
  };

  return {
    name: "transform-react-jsx-properties",
    visitor
  };
});