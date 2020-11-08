const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");

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
        template: "./src/index.html",
      }),
    ],
    module: {
      rules: [
        {
          test: /\.png$/,
          type: "asset/resource",
        },
      ],
    },
    devServer: {
      overlay: true,
      hot: true,
      stats: "errors-only",
    },
  };

  if (isProd) {
    webpackConfig.plugins.push(
      new GenerateSW({
        swDest: "sw.js",
        skipWaiting: true,
        clientsClaim: true,
        include: [/\.(html|css|js|png|webmanifest)$/],
        runtimeCaching: [
          {
            urlPattern: /\/.+\.[0-9a-f]+\.[a-z]+$/i,
            handler: "CacheFirst",
          },
        ],
      })
    );
  }

  return webpackConfig;
};
