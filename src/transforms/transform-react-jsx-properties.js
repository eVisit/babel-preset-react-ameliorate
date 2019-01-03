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
      return types.numericLiteral(value);
  }

  if (Array.isArray(value))
    return types.arrayExpression(value.map(valueToASTLiteral));

  return types.objectExpression(Object.keys(value).map((key) => {
    var propValue = value[key];
    if (propValue === undefined)
      return;

    return types.objectProperty(
      types.identifier(key),
      valueToASTLiteral(propValue)
    );
  }).filter(Boolean));
}

function getMatchingPropsMerged(nodeName, elements) {
  var props = {};

  for (var i = 0, il = elements.length; i < il; i++) {
    var element = elements[i],
        matcher = (typeof element.test === 'string' || element.test instanceof String) ? new RegExp(element.test) : element.test;

    if (!element.test)
      throw new TypeError('"elements[*].type" option for plugin must be a valid regular expression or string');

    matcher.lastIndex = 0;
    if (!matcher.test(nodeName))
      continue;

    if (!element.props)
      continue;

    Object.assign(props, element.props);
  }

  return props;
}

module.exports = pluginUtils.declare((api, _opts) => {
  api.assertVersion(7);

  var opts            = _opts || {},
      elements        = opts.elements || [],
      startElementID  = opts.startElementID;

  if (elements && !(elements instanceof Array))
    throw new TypeError('"elements" option for plugin must be an array with the schema: [{ test: String|RegExp, props: { ... } }, ... ]');

  if (typeof startElementID === 'function')
    startElementID = startElementID(api, props);

  var idCounter = startElementID || Date.now();

  const visitor = {
    JSXOpeningElement({ node }) {
      var nodeName = node.name;

      if (nodeName.type === 'JSXIdentifier')
        nodeName = nodeName.name;
      else if (nodeName.type === 'JSXMemberExpression')
        nodeName = [ nodeName.object.name, nodeName.property.name ].join('.');

      var isFragment  = (nodeName === 'Fragment' || nodeName === 'React.Fragment'),
          props       = getMatchingPropsMerged(nodeName, elements),
          keys        = Object.keys(props);

      for (var i = 0, il = keys.length; i < il; i++) {
        var key       = keys[i],
            propValue = props[key];

        if (isFragment && key !== 'key')
          continue;

        if (propValue === '__ID__')
          propValue = ('' + idCounter++);

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