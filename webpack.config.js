const path = require("path");
const miniCss = require('mini-css-extract-plugin');


module.exports = {
    mode: 'development', 
    entry: './frontend/js/main.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'main.js'
    },
    resolve: {
        alias: {
            "vue": "vue/dist/vue.esm-bundler.js",
            "src": "frontend/js/"
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    miniCss.loader,
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new miniCss({
           filename: 'style.css',
        }),
    ]
};  