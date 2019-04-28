'use strict';

const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');

const base = require('./webpack.config.js');

module.exports = merge(base, {
    devtool: 'inline-source-map',
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({
            DEVELOPER_MODE: JSON.stringify(true),
            ENABLE_LOGGING: JSON.stringify(true),
            FEATURE_FLAGS: JSON.stringify(require('./flags.dev.json')),
            MINUTES_UNTIL_IDLE: 120,
            MINUTES_BETWEEN_KEEPALIVE: 1,
            UAT_MODE: JSON.stringify(true),
        }),
    ]
});
