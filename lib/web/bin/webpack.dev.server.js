const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require(path.resolve(__dirname, 'webpack.config.js'));

const PROJECT_ROOT = process.cwd();
const cfg = require(path.resolve(PROJECT_ROOT, 'package.json'));

const devConfig = {
    quiet: false,
    stats: { colors: true },
    publicPath: '/',
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    }
};

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, devConfig);

const port = (cfg.hokku && cfg.hokku.web && cfg.hokku.web.devServer && cfg.hokku.web.devServer.port) || 8080;

console.log(`Hokku dev server is running. Try it here: http://localhost:${port}/`);
server.listen(port);
