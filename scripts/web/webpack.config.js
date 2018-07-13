const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const BUILD_DST = 'build/dist';
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const WEB_ROOT = path.resolve(PROJECT_ROOT, 'lib/web/');
const LAUNCHER_JS = path.resolve(WEB_ROOT, 'javascript/hokku.js');
const BUILD_PATH = path.resolve(PROJECT_ROOT, `${BUILD_DST}/web`);

const config = require('../webpack.config');

config.entry = LAUNCHER_JS;
config.output.path = BUILD_PATH;
config.output.library = 'hokku_web';
config.plugins.push(
    new CleanWebpackPlugin([BUILD_PATH], {
        root: PROJECT_ROOT,
        verbose: true,
        dry: false
    }),
    new CopyWebpackPlugin(
        [
            {from: path.resolve(WEB_ROOT, 'bin'), to: 'bin'}
        ],
        {}
    )
);

config.externals = {
    'react-dom': 'react-dom',
    'react': 'react',
    'react-router-dom': 'react-router-dom',
    'socket.io-client': 'socket.io-client'
};

module.exports = config;
