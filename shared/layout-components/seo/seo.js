import React from 'react';
import Head from 'next/head';

const Seo = ({ title }) => {
  let i = `WMS - ${title}`;
  return (
    <Head>
      <title>{i}</title>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap"
        rel="stylesheet"
      ></link>
      <meta
        name="description"
        content="Nowa - Nextjs Admin &amp; Dashboard Template"
      />
      <meta name="author" content="Spruko Technologies Private Limited" />
      <meta name="keywords" content=""></meta>
    </Head>
  );
};

export default Seo;
