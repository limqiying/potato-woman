const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Potato Woman",
        }),
        new FaviconsWebpackPlugin({
            logo: './logo.png',
            prefix: 'assets/',
            outputPath: 'assets/'
        })
    ],
};