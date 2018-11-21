import { declare }            from "@babel/helper-plugin-utils";
import pluginSearchAndReplace from "babel-plugin-search-and-replace";

export default declare((api, opts) => {
  api.assertVersion(7);

  return {
    plugins: [
      [
        pluginSearchAndReplace,
        {
          rules: [
            {
              search: "_react",
              replace: "__JSXcreateElement"
            }
          ]
        }
      ]
    ].filter(Boolean)
  };
});
