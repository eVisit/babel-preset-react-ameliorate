module.exports = function(api) {
  api.cache(() => process.env.NODE_ENV);

  return {
    presets: [
      ["@babel/preset-env", {
        modules: "commonjs"
      }]
    ]
  };
}
