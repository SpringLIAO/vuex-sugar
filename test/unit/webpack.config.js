/* eslint-disable */
const path = require('path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, '../../', dir);
}

module.exports = {
    entry: resolve('./src/index.js'),
    output: {
        path: resolve(__dirname, 'lib'),
        filename: 'index.js'
    },
    devtool: '#inline-source-map',
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': resolve('src')
        }
    },
    module: {
        rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
            },
        ]
    },
    plugins: [
        new LodashModuleReplacementPlugin()
    ]
};
