const path = require('path');
/*
const ChromiumRevision = require('puppeteer/package.json').puppeteer.chromium_revision
const Downloader = require('puppeteer/utils/ChromiumDownloader')
const revisionInfo = Downloader.revisionInfo(Downloader.currentPlatform(), ChromiumRevision)

process.env.CHROME_BIN = revisionInfo.executablePath

ChromeHeadless
*/

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const SOURCE_FILES = path.resolve(PROJECT_ROOT, 'lib/core/**/*.js');
const TEST_FILES = path.resolve(PROJECT_ROOT, 'test/javascript/core/**/*.spec.js');
const WEBPACK_CONFIG = path.resolve(__dirname, './webpack.karma.config.js');

module.exports = function (config) {
    config.set({
        basePath: PROJECT_ROOT,
        frameworks: ['mocha', 'chai'],
        reporters: ['mocha', 'coverage', 'allure'],
        port: 5789,
        colors: true,
        autoWatch: false,
        singleRun: true,
        logLevel: config.LOG_DEBUG,
        captureConsole: true,
        browsers: ['Chrome', 'Firefox'], // 'Edge'
        files: [
            {pattern: SOURCE_FILES, watched: false},
            {pattern: TEST_FILES, watched: false}
        ],
        preprocessors: {
            [TEST_FILES]: ['webpack'],
            [SOURCE_FILES]: ['webpack']
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
            'karma-coverage',
            'karma-allure-reporter',
            'karma-mocha-reporter'
        ],
        coverageReporter: {
            dir: path.resolve(PROJECT_ROOT, 'reports/coverage/core/'),
            reporters: [
                {type: 'html'},
                {type: 'text'}
            ]
        },
        allureReport: {
            reportDir: path.resolve(PROJECT_ROOT, 'reports/allure/core/')
        }
    })
};
