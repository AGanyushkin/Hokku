const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const BUILD_DST = 'build/dist';
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const NODE_ROOT = path.resolve(PROJECT_ROOT, 'lib/node/');
const LAUNCHER_JS = path.resolve(NODE_ROOT, 'javascript/hokku.js');
const BUILD_PATH = path.resolve(PROJECT_ROOT, `${BUILD_DST}/node`);

const config = require('../webpack.config');

config.target = 'node';
config.entry = LAUNCHER_JS;
config.output.path = BUILD_PATH;
config.output.library = 'hokku_node';
config.plugins.push(
    new CleanWebpackPlugin([BUILD_PATH], {
        root: PROJECT_ROOT,
        verbose: true,
        dry: false
    }),
    new CopyWebpackPlugin(
        [
            {from: path.resolve(NODE_ROOT, 'bin'), to: 'bin'}
        ],
        {}
    )
);

config.externals = {
    'koa': 'koa',
    'koa-static': 'koa-static',
    'koa-bodyparser': 'koa-bodyparser',
    'uuid': 'uuid',
    'shelljs': 'shelljs',
    'babel-cli': 'babel-cli',
    'babel-plugin-transform-es2015-modules-commonjs': 'babel-plugin-transform-es2015-modules-commonjs',
    'nodemon': 'nodemon',
    'socket.io': 'socket.io',
    'socket.io-client': 'socket.io-client',
    'dgram': 'dgram',
    'http': 'http',
    'rethinkdb': 'rethinkdb'
};

module.exports = config;
