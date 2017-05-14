var path = require('path');

module.exports = {
    entry: './src/index.js',
    resolve: {
        modules: [
          "node_modules",
          path.resolve(__dirname, "scripts")
        ],
        // directories where to look for modules
        extensions: [".js", ".json", ".jsx", ".css"]
    },
    module: {
        loaders: [
            {
            test: /.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['es2015', 'react']
            }
          }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'scripts')
    }
};
