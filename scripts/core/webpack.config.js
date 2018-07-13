const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const BUILD_DST = 'build/dist';
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const CORE_ROOT = path.resolve(PROJECT_ROOT, 'lib/core/');
const LAUNCHER_JS = path.resolve(CORE_ROOT, 'javascript/hokku.js');
const BUILD_PATH = path.resolve(PROJECT_ROOT, `${BUILD_DST}/core`);

const config = require('../webpack.config');

config.entry = LAUNCHER_JS;
config.output.path = BUILD_PATH;
config.output.library = 'hokku_core';
config.plugins.push(
    new CleanWebpackPlugin([BUILD_PATH], {
        root: PROJECT_ROOT,
        verbose: true,
        dry: false
    })
);

module.exports = config;
