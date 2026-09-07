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
  // Include locale files in serverless bundles so getServerSideProps can read them on Vercel
  experimental: {
    outputFileTracingIncludes: {
      '/outbound/[id]': ['./public/locales/**/*'],
      '/inbound/[id]': ['./public/locales/**/*'],
      '/transfer-order/[id]': ['./public/locales/**/*'],
      '/purchase-order/[id]': ['./public/locales/**/*'],
      '/purchase-order/drawer/[id]': ['./public/locales/**/*'],
      '/sales-order/[id]': ['./public/locales/**/*'],
      '/sales-order/drawer/[id]': ['./public/locales/**/*'],
    },
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

module.exports = nextConfig;
