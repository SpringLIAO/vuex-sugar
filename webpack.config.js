/* eslint-disable */
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, '/lib'),
        filename: 'index.js',
        library: 'VApi',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
                test: /\.js$/,
                loader: 'babel-loader'
            },
            // {
            //     test: /\.js$/,
            //     use: {
            //         loader: 'istanbul-instrumenter-loader',
            //         options: { esModules: true }
            //     },
            //     enforce: 'post',
            //     exclude: /node_modules|\.spec\.js$|\.test.js$/,
            // }
        ]
    }
};