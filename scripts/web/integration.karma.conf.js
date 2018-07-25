const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const TEST_FILES = path.resolve(PROJECT_ROOT, 'test/integration/web/**/*.spec.js');
const WEBPACK_CONFIG = path.resolve(__dirname, './webpack.karma.config.js');

module.exports = function (config) {
    config.set({
        basePath: PROJECT_ROOT,
        frameworks: ['mocha', 'chai'],
        reporters: ['mocha'],
        port: 5789,
        colors: true,
        autoWatch: false,
        singleRun: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadlessNoSandbox'], // 'ChromeHeadless', 'Edge', 'Chrome', 'Firefox'
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },
        files: [
            {pattern: TEST_FILES, watched: false}
        ],
        preprocessors: {
            [TEST_FILES]: ['webpack']
        },
        webpack: require(WEBPACK_CONFIG),
        webpackMiddleware: {
            noInfo: true
        },
        plugins: [
            'karma-webpack',
            'karma-mocha',
            'karma-chai',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-edge-launcher',
            'karma-mocha-reporter'
        ]
    })
};
