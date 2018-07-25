const libPackage = require('../package.json');
const path = require('path');
const webpack = require('webpack');

const PROJECT_ROOT = path.resolve(__dirname, '../');
const OUTPUT_FILE = 'index.js';

const plugins = [
    new webpack.EnvironmentPlugin({
        NODE_ENV: 'development'
    })
];

const rules = [
    {
        enforce: 'pre',
        test: /(\.jsx|\.js)$/,
        exclude: [
            /node_modules/,
            /(\.spec\.js)$/
        ],
        use: {
            loader: 'eslint-loader'
        }
    },
    {
        test: /(\.jsx|\.js)$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader'
        }
    }
];

const configuration = {
    entry: '',
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            path.resolve(PROJECT_ROOT, 'node_modules')
        ]
    },
    output: {
        path: '',
        filename: OUTPUT_FILE,
        library: `${libPackage.name}_core`,
        libraryTarget: 'commonjs2'
    },
    module: {
        rules
    },
    plugins
};

module.exports = configuration;
