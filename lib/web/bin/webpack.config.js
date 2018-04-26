const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PROJECT_ROOT = process.cwd();
const cfg = require(path.resolve(PROJECT_ROOT, 'package.json'));
const OUTPUT_FILE = 'index.js';
const BUILD_PATH = path.resolve(PROJECT_ROOT, 'build');
const entryPoint = (cfg.hokku && cfg.hokku.web && cfg.hokku.web.main) || cfg.main;

const plugins = [
    new webpack.EnvironmentPlugin({
        NODE_ENV: 'development'
    }),
    new CleanWebpackPlugin([BUILD_PATH], {
        root: PROJECT_ROOT,
        verbose: true,
        dry: false
    }),
    new HtmlWebpackPlugin()
];

const rules = [
    {
        test: /(\.jsx|\.js)$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['es2015', 'react'],
                plugins: [
                    require('babel-plugin-transform-object-rest-spread'),
                    require('babel-plugin-transform-decorators-legacy').default,
                    require('babel-plugin-transform-class-properties')
                ]
            }
        }
    },
    {
        test: /\.css$/,
        use: [
            'style-loader',
            'css-loader'
        ]
    },
    {
        test: /\.less$/,
        use: [
            'style-loader',
            'css-loader',
            'less-loader'
        ]
    },
    {
        test: /\.(png|jpg|gif|eot|woff2|woff|ttf|svg)$/,
        use: [
            {
                loader: 'file-loader',
                options: {}
            }
        ]
    }
];

const configuration = {
    entry: path.resolve(PROJECT_ROOT, entryPoint),
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            path.resolve(PROJECT_ROOT, 'node_modules')
        ]
    },
    output: {
        path: BUILD_PATH,
        filename: OUTPUT_FILE
    },
    module: {
        rules
    },
    plugins
};

module.exports = configuration;
