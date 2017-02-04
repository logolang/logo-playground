var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var GitRevisionPlugin = require('git-revision-webpack-plugin');
var packageJson = require('./package.json');

let extractTextPlugin = new ExtractTextPlugin("[name]-[git-revision-version].css");
var gitRevisionPlugin = new GitRevisionPlugin();

let path = require('path');

function buildWebpackConfig(options) {
    options = options || {};
    let isProduction = options.production || false;
    let env = options.env || {};

    return {
        entry: {
        },

        output: {
            path: __dirname + '/dist',
            publicPath: '',
            filename: '[name]-[git-revision-version].js'
        },

        performance: {
            hints: false
        },

        // Turn on sourcemaps
        devtool: 'source-map',

        devServer: {
            contentBase: "dist/"
        },

        resolve: {
            modules: [
                __dirname,
                "node_modules"
            ],
            extensions: ['.ts', '.tsx', '.js'],
        },

        externals: {
            /**
             * These 3 stub externals are here to silenty skip errors during bundling Enzyme package
             * They are not actually needed - only referenced in conditionals to support obsolete react 0.13
             */
            'react/addons': 'undefined',
            'react/lib/ReactContext': 'undefined',
            'react/lib/ExecutionEnvironment': 'undefined'
        },

        plugins: [
            gitRevisionPlugin,
            extractTextPlugin,

            new CopyWebpackPlugin([
                { from: 'lib/bootstrap/bootstrap.*', flatten: true },
                { from: 'lib/bootstrap/fonts', to: 'fonts' },
                { from: 'app/config/config.schema.json' },
                { from: 'app/resources/favicon.ico' },
                isProduction
                    ? { from: 'app/config/config.prod.json', to: 'config.json' }
                    : { from: 'app/config/config.json', to: 'config.json' },
            ]),

            new webpack.DefinePlugin({
                // This flag is used by ReactJS to use production optimized code
                'process.env': {
                    'NODE_ENV': isProduction ? JSON.stringify('production') : JSON.stringify('dev')
                },
                // This is custom flag to pass build version from webpack command line argument to application
                appInfo: JSON.stringify({
                    gitVersion: gitRevisionPlugin.version(),
                    buildVersion: env.buildVersion,
                    name: packageJson.name,
                    description: packageJson.description,
                    version: packageJson.version
                })
            })
        ],

        module: {
            rules: [
                { test: /\.tsx?$/, loader: "tslint-loader", enforce: "pre" },
                { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
                { test: /\.css$/, loader: extractTextPlugin.extract(["css-loader"]) },
                { test: /\.scss$/, loader: extractTextPlugin.extract(["css-loader", "sass-loader"]) },
                { test: /\.sass$/, loader: extractTextPlugin.extract(["css-loader", "sass-loader"]) },
                { test: /\.png$/, loader: "url-loader", options: { limit: 200000 } },
                { test: /\.svg$/, loader: "url-loader", options: { limit: 200000 } },
                { test: /\.jpg$/, loader: "url-loader", options: { limit: 200000 } },
                { test: /\.gif$/, loader: "url-loader", options: { limit: 200000 } },
                { test: /\.woff$/, loader: "url-loader", options: { limit: 200000 } },
                { test: /\.json$/, loader: "json-loader" },
            ]
        }
    }
}

module.exports = {
    buildWebpackConfig: buildWebpackConfig
}
