var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var GitRevisionPlugin = require('git-revision-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var packageJson = require('./package.json');

let extractTextPlugin = new ExtractTextPlugin("[name].css");
var gitRevisionPlugin = new GitRevisionPlugin();
global.appGitVersion = gitRevisionPlugin.version();

let path = require('path');

module.exports = function (env) {
    env = env || {};
    const isProduction = !!env.prod;
    const isDevBuild = !isProduction;

    console.log(`building app bundle with webpack. production mode:${isProduction}`);

    const webpackConfig = {
        entry: isDevBuild
            ? {
                app: './app/app-entry-point.tsx',
                tests: './build/tests-entry-point.spec.ts'
            }
            : {
                app: './app/app-entry-point.tsx'
            },

        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            modules: [
                __dirname,
                "node_modules"
            ],
        },

        output: {
            path: __dirname + '/dist',
            publicPath: '',
            filename: '[name].js',
            pathinfo: isDevBuild,
        },

        module: {
            rules: [
                { test: /\.tsx?$/, loader: "tslint-loader", enforce: "pre" },
                { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
                { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: "url-loader", options: { limit: 200000 } },
                { test: /\.json$/, loader: "json-loader" },
                { test: /\.html$/, loader: "raw-loader" },
                { test: /\.txt$/, loader: "raw-loader" },
                { test: /\.css$/, loader: extractTextPlugin.extract(["css-loader"]) },
                { test: /\.(scss|sass)$/, loader: extractTextPlugin.extract(["css-loader", "sass-loader"]) },
            ]
        },

        plugins: [
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: path.join(__dirname, "dist", "vendor-manifest.json"),
            }),

            extractTextPlugin,

            new CopyWebpackPlugin([
                { from: 'content', to: 'content' }
            ]),

            new webpack.DefinePlugin({
                // Custom object injected to application and contains build version and package info
                appInfo: JSON.stringify({
                    gitVersion: global.appGitVersion,
                    buildVersion: env.buildVersion,
                    name: packageJson.name,
                    description: packageJson.description,
                    version: packageJson.version
                })
            }),
            new HtmlWebpackPlugin({
                template: 'app/app-index.ejs',
                filename: 'index.html',
                chunks: ['app'],
                inject: false
            }),
        ].concat(isDevBuild
            ? [
                new HtmlWebpackPlugin({
                    template: 'build/tests-index.ejs',
                    filename: 'tests.html',
                    chunks: ['tests']
                }),
                new WebpackNotifierPlugin(),
            ]
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
                    analyzerMode: 'static',
                    // Path to bundle report file that will be generated in `static` mode.
                    // Relative to bundles output directory.
                    reportFilename: '../reports/bundle-analyzer-app-report.html',
                    // Automatically open report in default browser
                    openAnalyzer: false,
                    // If `true`, Webpack Stats JSON file will be generated in bundles output directory
                    generateStatsFile: false,
                    // Log level. Can be 'info', 'warn', 'error' or 'silent'.
                    logLevel: 'info',
                })
            ]),

        externals: {
            /**
             * These 3 stub externals are here to silenty skip errors during bundling Enzyme package
             * They are not actually needed - only referenced in conditionals to support obsolete react 0.13
             */
            'react/addons': 'undefined',
            'react/lib/ReactContext': 'undefined',
            'react/lib/ExecutionEnvironment': 'undefined'
        },
        stats: { modules: false },
        performance: { hints: false },
        devServer: {
            contentBase: "dist/",
            port: 8085,
        },
        devtool: isDevBuild ? 'eval' : 'source-map', // Turn on sourcemaps
    }

    return webpackConfig;
};