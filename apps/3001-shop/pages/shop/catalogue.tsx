import React from 'react';
import type { GetServerSideProps } from 'next'
import Head from 'next/head';

import WebpackPng from '../../components/WebpackPng';

const Catalogue = ({ date }) => (
  <div>
    <Head>
      <title>Catalogue</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <div className="hero">
      <h1>Catalogue Page</h1>
      <h3 className="title">
        This is a federated page owned by localhost:3001
      </h3>
      <p className="description">
        This application manually exposes <code>page-map</code> and its modules
        (see next.config.js file).
        <br />
        <br />
        Date: {date}
        <br />
        <br />
        <WebpackPng />
      </p>
    </div>
    <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 20px;
      }
      .title,
      .description {
        text-align: center;
      }
    `}</style>
  </div>
);

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      date: new Date().toISOString(),
    }
  }
};

export default Catalogue;
