const path = require('path');

const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';

module.exports = {
  i18n: {
    locales: ['en', 'zh'], // 支持的语言列表
    defaultLocale: defaultLocale, // 默认语言
    localeDetection: true, // 是否启用自动语言检测
  },
  // Absolute path so Vercel file tracing resolves locale files correctly
  localePath: path.resolve('./public/locales'),
};
