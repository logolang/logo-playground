/**
 * This is Webpack configuration for developers
 * It has separation of 3rd party libraries to special bundle
 */

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');

module.exports = function (env) {
    var config = require('./webpack.config.base.js').buildWebpackConfig({ production: false, env: env });

    config.entry = {
        thirdparty: [
            'tslib',
            'core-js',
            'isomorphic-fetch',
            'tv4',
            'react',
            'react-dom',
            'react-router',
            'react-bootstrap',
            'classnames',
            'moment'
        ],
        app: './app/app.tsx',
        tests: './app/resources/build/tests/tests-entry-point.spec.ts'
    };

    config.output.pathinfo = true;

    config.devServer = {
        contentBase: "dist/",
        port: 8085,
    };

    config.plugins.push(
        new WebpackNotifierPlugin(),

        new HtmlWebpackPlugin({
            template: 'app/resources/index.ejs',
            filename: 'index.html',
            hash: true,
            chunks: ['thirdparty', 'app'],
            inject: false
        }),

        new HtmlWebpackPlugin({
            template: 'app/resources/build/tests/index.ejs',
            filename: 'tests.html',
            hash: true,
            chunks: ['thirdparty', 'tests']
        }),

        // Remove 3rd party from app and tests bundles
        new webpack.optimize.CommonsChunkPlugin({ name: 'thirdparty', chunks: ['app'] }),
        new webpack.optimize.CommonsChunkPlugin({ name: 'thirdparty', chunks: ['tests'] })
    );

    return config;
};