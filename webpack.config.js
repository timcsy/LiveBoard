const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

const pages = [
  'index',
  'login',
  'signup',
  'member',
  'connect_login',
  'connect_signup',
  'data/index',
  'board/index'
]

const config = {
  mode: 'development',
  entry: {
    index: './client/src/pages/index.js',
    auth: './client/src/pages/auth.js',
    member: './client/src/pages/member.js',
    board: './client/src/pages/board.js'
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
        test: /\.(scss|sass)$/,
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
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin()
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

pages.forEach(p => {
  config.plugins.push(new HtmlWebpackPlugin({
    filename: `${p}.html`,
    template: path.resolve(__dirname, `client/views/${p}.html`),
    inject: false
  }))
})

module.exports = config