const webpackConfig = require('./webpack.config');

delete webpackConfig.output.libraryTarget;
webpackConfig.externals = {};

module.exports = webpackConfig;
