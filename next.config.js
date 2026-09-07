/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const { i18n } = require('./next-i18next.config');
const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
i18n.defaultLocale = defaultLocale;

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  swcMinify: true,
  basePath: isProd ? '' : undefined,
  // basePath: '',
  //assetPrefix: isProd ? 'https://nextjs.spruko.com/nowa/preview/' : undefined,
  images: {
    loader: 'imgix',
    path: '/',
  },
  i18n,
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

module.exports = nextConfig;
