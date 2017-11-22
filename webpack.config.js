const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackNotifierPlugin = require("webpack-notifier");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const WatchIgnorePlugin = webpack.WatchIgnorePlugin;

// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const { CheckerPlugin } = require("awesome-typescript-loader");

const packageJson = require("./package.json");

const extractTextPlugin = new ExtractTextPlugin("[name].css");
const gitRevisionPlugin = new GitRevisionPlugin();
const appGitVersion = gitRevisionPlugin.version();

let path = require("path");

module.exports = function(env) {
  env = env || {};
  const isProduction = !!env.prod;
  const isDevBuild = !isProduction;
  const isTSLintEnabled = env.tslint_enabled === "true"; // Due to long checking time this is disabled by default.
  const configFileName = isProduction ? "config.prod.json" : "config.json";
  const appConfig = require("./content/config/" + configFileName);

  console.log(`building app bundle with webpack. production mode:${isProduction}`);

  const webpackConfig = {
    entry: isDevBuild
      ? {
          app: "./app/app-entry-point.tsx",
          tests: "./tools/tests-entry-point.spec.ts"
        }
      : {
          app: "./app/app-entry-point.tsx"
        },

    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      modules: [__dirname, "node_modules"]
    },

    output: {
      path: __dirname + "/dist",
      publicPath: "",
      filename: "[name].js",
      pathinfo: isDevBuild
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "awesome-typescript-loader",
          options: {
            target: isDevBuild ? "ES2017" : "es5",
            useCache: true,
            cacheDirectory: isDevBuild ? ".atl-cache.es2017" : ".atl-cache.es5"
          }
        },
        { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: "url-loader", options: { limit: 200000 } },
        { test: /\.json$/, loader: "json-loader" },
        { test: /\.hbs$/, loader: "handlebars-loader" },
        { test: /\.(txt|html|md|po)$/, loader: "raw-loader" },
        isDevBuild && { test: /\.css$/, loaders: ["style-loader", "css-loader"] },
        isDevBuild && { test: /\.(scss|sass)$/, loaders: ["style-loader", "css-loader", "sass-loader"] },
        !isDevBuild && { test: /\.css$/, loader: extractTextPlugin.extract(["css-loader"]) },
        !isDevBuild && { test: /\.(scss|sass)$/, loader: extractTextPlugin.extract(["css-loader", "sass-loader"]) },
        isTSLintEnabled && {
          test: /\.tsx$/,
          enforce: "pre",
          loader: "tslint-loader",
          options: {
            typeCheck: true,
            fix: true
          }
        }
      ].filter(x => !!x)
    },

    plugins: [
      new WatchIgnorePlugin([path.resolve(__dirname, "./dist/")]),

      new CheckerPlugin(),

      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: path.join(__dirname, "dist", "vendor-manifest.json")
      }),

      new CopyWebpackPlugin([
        { from: "content", to: "content", ignore: ["**/config.json", "**/config.prod.json"] },
        {
          from: "content/config/" + configFileName,
          to: "content/config/config.json"
        }
      ]),

      new webpack.DefinePlugin({
        // Custom object injected to application and contains build version and package info
        APP_WEBPACK_STATIC_INFO: JSON.stringify({
          gitVersion: appGitVersion,
          buildVersion: env.buildVersion,
          name: packageJson.name,
          description: packageJson.description,
          version: packageJson.version
        })
      }),

      new HtmlWebpackPlugin({
        template: "app/app-index-template.hbs",
        filename: "index.html",
        chunks: ["app"],
        inject: false,
        variables: {
          packageJson: packageJson,
          appGitVersion: appGitVersion,
          appConfig: appConfig
        }
      }),

      isDevBuild &&
        new HtmlWebpackPlugin({
          template: "tools/tests-index-template.hbs",
          filename: "tests.html",
          chunks: ["tests"],
          variables: {
            appGitVersion: appGitVersion
          }
        }),

      isDevBuild && new WebpackNotifierPlugin(),

      isProduction && extractTextPlugin,

      // Apply minification
      isProduction &&
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true
        }),

      isProduction &&
        new webpack.LoaderOptionsPlugin({
          minimize: true
        }),

      isProduction &&
        new BundleAnalyzerPlugin({
          // Can be `server`, `static` or `disabled`.
          // In `server` mode analyzer will start HTTP server to show bundle report.
          // In `static` mode single HTML file with bundle report will be generated.
          // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
          analyzerMode: "static",
          // Path to bundle report file that will be generated in `static` mode.
          // Relative to bundles output directory.
          reportFilename: "../reports/bundle-analyzer-app-report.html",
          // Automatically open report in default browser
          openAnalyzer: false,
          // If `true`, Webpack Stats JSON file will be generated in bundles output directory
          generateStatsFile: false,
          // Log level. Can be 'info', 'warn', 'error' or 'silent'.
          logLevel: "info"
        })
    ].filter(x => !!x),

    stats: { modules: false },
    performance: { hints: false },
    devServer: {
      contentBase: "dist/",
      port: 8085
    },
    devtool: isDevBuild ? "source-map" : "source-map" // Turn on sourcemaps
  };

  return webpackConfig;
};
