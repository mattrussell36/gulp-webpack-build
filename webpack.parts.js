const path = require('path');

exports.entry = {
    app: path.resolve('javascript', 'app.js'),
    'app-legacy': path.resolve('javascript', 'app-legacy.js'),
};