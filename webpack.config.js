const path = require('path');
const entry = require('./webpack.parts').entry;

module.exports = function (isProduction, isWatch) {
    return {
        entry,
        output: {
            filename: '[name].js',
            path: path.resolve('build', 'common')
        },
        watch: isWatch,
    };
}