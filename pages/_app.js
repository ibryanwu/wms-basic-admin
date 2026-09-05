import React from 'react';
import '../styles/globals.scss';
import Contentlayout from '../shared/layout-components/layout/content-layout';
import Landingpagelayout from '../shared/layout-components/layout/landingpage-layout';
import Switcherlayout from '../shared/layout-components/layout/switcher-layout';
import Authenticationlayout from '../shared/layout-components/layout/authentication-layout';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
//多语
import { appWithTranslation } from 'next-i18next';

// Create a client
const queryClient = new QueryClient();

const layouts = {
  Contentlayout: Contentlayout,
  Landingpagelayout: Landingpagelayout,
  Switcherlayout: Switcherlayout,
  Authenticationlayout: Authenticationlayout,
};
function MyApp({ Component, pageProps }) {
  const Layout =
    layouts[Component.layout] ||
    ((pageProps) => <Component>{pageProps}</Component>);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer style={{ zIndex: 199999999 }} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);
