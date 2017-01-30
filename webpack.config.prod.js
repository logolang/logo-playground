/**
 * This is Webpack configuration for production
 * It has enabled code minification and NODE_ENV=production environment variable which affects React bundling 
 */
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function (env) {
    var config = require('./webpack.config.base.js').buildWebpackConfig({ production: true, env: env });

    config.entry = {
        app: './app/app.tsx',
    };

    config.plugins.push(
        new HtmlWebpackPlugin({
            template: 'app/resources/index.ejs',
            filename: 'index.html',
            hash: true,
            inject: false
        }),

        new CleanWebpackPlugin(['dist', 'reports'], { verbose: true }),

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
            reportFilename: '../reports/bundle-analyzer-report.html',
            // Automatically open report in default browser
            openAnalyzer: false,
            // If `true`, Webpack Stats JSON file will be generated in bundles output directory
            generateStatsFile: false,
            // Log level. Can be 'info', 'warn', 'error' or 'silent'.
            logLevel: 'info',
        })
    );

    return config;
};