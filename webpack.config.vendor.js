/**
 * This is Webpack configuration for vendor's bundle
 * It is intended to include all 3rd party libraries used in app which do not change often
 */

var path = require("path");
var webpack = require("webpack");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = function(env) {
  env = env || {};
  const isProduction = !!env.prod;
  const isDevBuild = !isProduction;

  console.log(`building vendor bundle with webpack. production mode:${isProduction}`);

  return {
    resolve: {
      extensions: [".js", ".jsx"]
    },
    entry: {
      vendor: [
        "core-js",
        "tslib",
        "react",
        "react-dom",
        "react-router",
        "classnames",
        "rxjs",
        "golden-layout",
        "jquery",
        "codemirror",
        "codemirror/addon/runmode/runmode.js",
        "codemirror/addon/edit/closebrackets.js",
        "codemirror/addon/edit/matchbrackets.js",
        "codemirror/addon/display/placeholder.js",
        "isomorphic-fetch",
        "tv4",
        "moment",
        "file-saver",
        "color",
        "markdown-it",
        "keymaster",
        "jed",
        "po2json/lib/parse",
        "./lib/logojs/floodfill.js",
        "./lib/logojs/logo.js",
        "./lib/logojs/turtle.js",
        "./lib/codemirror-logo/cm-logo.js"
      ]
    },
    devtool: "source-map",
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js",
      library: "[name]"
    },
    plugins: [
      new CleanWebpackPlugin(["dist", "reports"], { verbose: true }),

      new webpack.DllPlugin({
        path: path.join(__dirname, "dist", "[name]-manifest.json"),
        name: "[name]"
      }),

      new webpack.DefinePlugin({
        "process.env.NODE_ENV": isDevBuild ? '"development"' : '"production"'
      })
    ].concat(
      isDevBuild
        ? []
        : [
            // Apply minification
            new webpack.optimize.UglifyJsPlugin({
              sourceMap: true
            }),
            new webpack.LoaderOptionsPlugin({
              minimize: true
            }),
            new BundleAnalyzerPlugin({
              // Can be `server`, `static` or `disabled`.
              // In `server` mode analyzer will start HTTP server to show bundle report.
              // In `static` mode single HTML file with bundle report will be generated.
              // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
              analyzerMode: "static",
              // Path to bundle report file that will be generated in `static` mode.
              // Relative to bundles output directory.
              reportFilename: "../reports/bundle-analyzer-vendor-report.html",
              // Automatically open report in default browser
              openAnalyzer: false,
              // If `true`, Webpack Stats JSON file will be generated in bundles output directory
              generateStatsFile: false,
              // Log level. Can be 'info', 'warn', 'error' or 'silent'.
              logLevel: "info"
            })
          ]
    )
  };
};
