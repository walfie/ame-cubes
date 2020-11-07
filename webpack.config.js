const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, options) => {
  const isProd = options.mode === "production";

  const webpackConfig = {
    entry: "./src/index.js",
    mode: "development",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProd ? "[name].[contenthash:8].js" : "[name].js",
      publicPath: "/",
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: "Ame Cubes",
      }),
    ],
    devServer: {
      overlay: true,
      hot: true,
      stats: "errors-only",
    },
  };

  return webpackConfig;
};
