var path = require('path');

module.exports = {
    entry: './scripts/index.js',
    resolve: {
        modules: [
          "node_modules",
          path.resolve(__dirname, "scripts")
        ],
        // directories where to look for modules
        extensions: [".js", ".json", ".jsx", ".css"]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'scripts')
    }
};
