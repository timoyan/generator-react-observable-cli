#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const Webpack = require("webpack");
const Path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const chalk_1 = require("chalk");
const { choosePort } = require(Path.resolve(__dirname, '../src/utilities/WebpackDevServerUtils.js'));
const isInteractive = process.stdout.isTTY;
const argv = yargs.argv;
const config = require(Path.resolve(__dirname, '../src/config/webpack.config.js'));
const openBrowser = require(Path.resolve(__dirname, '../src/utilities/openBrowser'));
const paths = require(Path.resolve(__dirname, '../src/utilities/paths'));
const formatWebpackMessages = require(Path.resolve(__dirname, '../src/utilities/formatWebpackMessages.js'));
const env = argv.env || 'test';
const isBuild = argv.build || false;
let port = argv.port || 8080;
let host = argv.host || 'localhost';
if (!isBuild) {
    const { checkBrowsers } = require(Path.resolve(__dirname, '../src/utilities/browsersHelper.js'));
    checkBrowsers(paths.appPath, isInteractive)
        .then(() => {
        // We attempt to use the default port but if it is busy, we offer the user to
        // run on a different port. `choosePort()` Promise resolves to the next free port.
        return choosePort(host, port);
    })
        .then(newPort => {
        if (newPort == null) {
            // We have not found a port.
            return;
        }
        executeDevServer(newPort, host);
    });
}
else {
    executeCompile(port, host);
}
function executeCompile(port, host) {
    const compiler = Webpack(config(env, isBuild, host, port));
    compiler.run((err, stats) => {
        if (err) {
            console.error(err.stack || err);
            if (err.message) {
                console.error(err.message);
            }
            return;
        }
        const info = formatWebpackMessages(stats.toJson());
        if (stats.hasErrors()) {
            console.error(chalk_1.default.red(info.errors));
        }
        if (stats.hasWarnings()) {
            console.warn(chalk_1.default.green(info.warnings));
        }
    });
}
function executeDevServer(port, host) {
    const compiler = Webpack(config(env, isBuild, host, port));
    const server = new WebpackDevServer(compiler, {
        contentBase: Path.join(paths.appPath, 'build'),
        compress: true,
        inline: true,
        historyApiFallback: true,
        hot: true,
        overlay: {
            warnings: true,
            errors: true
        },
        watchContentBase: true
    });
    server.listen(port, host, err => {
        if (err) {
            return console.log(err);
        }
        openBrowser(`http://${host}:${port}/`);
    });
}
