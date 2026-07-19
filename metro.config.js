// expo-sqlite を web で動かすための設定（https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#web-setup）
// wasm を asset として解決し、SharedArrayBuffer に必要な COOP/COEP ヘッダーを付与する
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};

module.exports = config;
