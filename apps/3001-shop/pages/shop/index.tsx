import React from 'react';
import Head from 'next/head';

import WebpackPng from '../../components/WebpackPng';

const Shop = (props) => {
  return (
    <div>
      <Head>
        <title>Shop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="hero">
        <h1>Shop Page</h1>
        <h3 className="title">
          This is a federated page owned by localhost:3001
        </h3>
        <p className="description">
          This application manually exposes <code>page-map</code> and its
          modules (see next.config.js file).
          <br />
          <br />
          <WebpackPng />
        </p>
        <pre>{JSON.stringify(props)}</pre>
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
};
Shop.getInitialProps = async () => {
  const timeout = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fallback = {
    name: 'Luke Skywalker',
    height: '172',
    mass: '77',
    hair_color: 'blond',
    skin_color: 'fair',
    eye_color: 'blue',
    birth_year: '19BBY',
    gender: 'male',
    homeworld: 'https://swapi.dev/api/planets/1/',
    films: [
      'https://swapi.dev/api/films/1/',
      'https://swapi.dev/api/films/2/',
      'https://swapi.dev/api/films/3/',
      'https://swapi.dev/api/films/6/',
    ],
    species: [],
    vehicles: [
      'https://swapi.dev/api/vehicles/14/',
      'https://swapi.dev/api/vehicles/30/',
    ],
    starships: [
      'https://swapi.dev/api/starships/12/',
      'https://swapi.dev/api/starships/22/',
    ],
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-20T21:17:56.891000Z',
  };

  const timerPromise = timeout(500).then(() => fallback);

  return Promise.race([timerPromise]);
};

export default Shop;
