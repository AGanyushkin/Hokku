const webpackConfig = require('./webpack.config');

delete webpackConfig.output.libraryTarget;

module.exports = webpackConfig;
