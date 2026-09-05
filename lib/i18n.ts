import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticTranslations = async (
  locale: string,
  namespaces: string[] = ['common'],
) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, namespaces)),
    },
  };
};
