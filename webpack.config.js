const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WatchIgnorePlugin = webpack.WatchIgnorePlugin;
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const gitRevisionPlugin = new GitRevisionPlugin();

const packageJson = require("./package.json");
const appGitVersion = gitRevisionPlugin.version();

module.exports = function (env) {
  env = env || {};
  const isProduction = !!env.prod;
  const isDevBuild = !isProduction;
  const configFileName = isProduction ? "config.prod.json" : "config.json";
  const appConfig = require("./content/config/" + configFileName);

  console.log(`building app bundle with webpack. production mode:${isProduction}`);

  const webpackConfig = {
    mode: isDevBuild ? "development" : "production",

    entry: {
      app: "./src/app.tsx",
      "logo-animation": "./src/web-components/logo-animation"
    },

    optimization: {
      splitChunks: {
        chunks: "all"
      }
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      modules: [__dirname, __dirname + "/src", "node_modules"]
    },

    output: {
      path: __dirname + "/dist",
      publicPath: "",
      filename: "[name].js",
      pathinfo: false
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            transpileOnly: true
          }
        },
        { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: "url-loader", options: { limit: 200000 } },
        { test: /\.hbs$/, loader: "handlebars-loader" },
        { test: /\.(txt|html|md|po)$/, loader: "raw-loader" },

        isDevBuild
          ? { test: /\.css$/, use: ["style-loader", "css-loader"] }
          : { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
        isDevBuild
          ? { test: /\.(less|scss)$/, use: ["style-loader", "css-loader", "less-loader"] }
          : {
              test: /\.(less|scss)$/,
              use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
            }
      ].filter(x => x)
    },

    plugins: [
      new CleanWebpackPlugin({ verbose: true }),

      new WatchIgnorePlugin([path.resolve(__dirname, "./dist/")]),

      new ForkTsCheckerWebpackPlugin(),

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
          version: packageJson.version,
          builtOn: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
        })
      }),

      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "src/index.hbs",
        inject: false,
        excludeChunks: ["logo-animation"],
        minify: false,
        __gaId: appConfig.services.googleAnalyticsTrackingId,
        __version: appGitVersion
      }),

      isProduction && new MiniCssExtractPlugin({ filename: "[name].css" }),

      isProduction &&
        new BundleAnalyzerPlugin({
          // Can be `server`, `static` or `disabled`.
          // In `server` mode analyzer will start HTTP server to show bundle report.
          // In `static` mode single HTML file with bundle report will be generated.
          // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
          analyzerMode: "static",
          // Path to bundle report file that will be generated in `static` mode.
          // Relative to bundles output directory.
          reportFilename: "../dist/bundle-analyzer-app-report.html",
          // Automatically open report in default browser
          openAnalyzer: false,
          // If `true`, Webpack Stats JSON file will be generated in bundles output directory
          generateStatsFile: false,
          // Log level. Can be 'info', 'warn', 'error' or 'silent'.
          logLevel: "info"
        }),

      /**
       * This is to remove a webpack warning and also to reduce bundle size
       */
      new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, "node-noop")
    ].filter(x => x),

    externals: {
      "iconv-lite": {}
    },

    stats: { modules: false },
    performance: { hints: false },
    devServer: {
      contentBase: "dist/",
      port: 8085,
      host: "0.0.0.0"
    },
    devtool: isDevBuild ? "source-map" : false // Turn on sourcemaps for dev only
  };

  return webpackConfig;
};
