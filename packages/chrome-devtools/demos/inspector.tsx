import { Helmet } from '@modern-js/runtime/head';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './inspector.css';
import { wrapComponent } from '../src/utils/chrome/ComponentInspector';

const Header = () => {
  return (
    <div className="header">
      Welcome to
      <img
        className="logo"
        src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/modern-js-logo.svg"
        alt="Modern.js Logo"
      />
      <p className="name">Modern.js</p>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="footer">
      <a
        href="https://modernjs.dev/guides/get-started/introduction.html"
        target="_blank"
        rel="noopener noreferrer"
        className="card"
      >
        <h2>
          Guide
          <img
            className="arrow-right"
            src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
            alt="Guide"
          />
        </h2>
        <p>Follow the guides to use all features of Modern.js.</p>
      </a>
      <a
        href="https://modernjs.dev/tutorials/foundations/introduction.html"
        target="_blank"
        className="card"
        rel="noreferrer"
      >
        <h2>
          Tutorials
          <img
            className="arrow-right"
            src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
            alt="Tutorials"
          />
        </h2>
        <p>Learn to use Modern.js to create your first application.</p>
      </a>
      <a
        href="https://modernjs.dev/configure/app/usage.html"
        target="_blank"
        className="card"
        rel="noreferrer"
      >
        <h2>
          Config
          <img
            className="arrow-right"
            src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
            alt="Config"
          />
        </h2>
        <p>Find all configuration options provided by Modern.js.</p>
      </a>
      <a
        href="https://github.com/web-infra-dev/modern.js"
        target="_blank"
        rel="noopener noreferrer"
        className="card"
      >
        <h2>
          Github
          <img
            className="arrow-right"
            src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
            alt="Github"
          />
        </h2>
        <p>View the source code of Github, feel free to contribute.</p>
      </a>
    </div>
  );
};

const Description = () => {
  return (
    <p className="description">
      Get started by editing <code className="code">src/routes/page.tsx</code>
    </p>
  );
};

function MyComponent() {
  return <div>Hello</div>;
}
console.log(222, MyComponent.name);

class MyClassComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}

console.log(222, MyClassComponent.name);

const Index = () => (
  <div className="container-box">
    <Helmet>
      <link
        rel="icon"
        type="image/x-icon"
        href="https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/favicon.ico"
      />
    </Helmet>

    <div className="landing-page">
      {wrapComponent({
        react: React,
        CustomComponent: Header,
        componentName: Header.name,
        mfName: 'provider1',
      })}

      {wrapComponent({
        react: React,
        CustomComponent: Description,
        componentName: Description.name,
        mfName: 'provider2',
        versionOrEntry: '1.2.3',
      })}

      {wrapComponent({
        react: React,
        CustomComponent: Footer,
        componentName: Footer.name,
        mfName: 'provider3',
      })}
    </div>
  </div>
);

export default Index;

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Index />
    </React.StrictMode>,
  );
}
