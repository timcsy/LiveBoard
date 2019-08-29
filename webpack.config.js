const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  entry: {
    index: './client/src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'client/views/index.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: path.resolve(__dirname, 'client/views/login.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'signup.html',
      template: path.resolve(__dirname, 'client/views/signup.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'member.html',
      template: path.resolve(__dirname, 'client/views/member.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'connect_login.html',
      template: path.resolve(__dirname, 'client/views/connect_login.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'connect_signup.html',
      template: path.resolve(__dirname, 'client/views/connect_signup.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'data/index.html',
      template: path.resolve(__dirname, 'client/views/data/index.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'board/index.html',
      template: path.resolve(__dirname, 'client/views/board/index.html')
    }),
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'client/dist')
  }
}