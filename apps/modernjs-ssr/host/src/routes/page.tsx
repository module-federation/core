import { Helmet } from '@modern-js/runtime/head';
import './index.css';

const Index = () => (
  <div className="container-box">
    <Helmet>
      <link
        rel="icon"
        type="image/x-icon"
        href="https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/favicon.ico"
      />
    </Helmet>
    <main>
      <h1 style={{ fontSize: '2em' }}>
        This is SPA combined from 6 different modern.js remotes.
      </h1>
      <div className="title">
        Welcome to
        <img
          className="logo"
          src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/modern-js-logo.svg"
          alt="Modern.js Logo"
        />
        <p className="name">Modern.js</p>
      </div>
      <p className="description">
        Click the header navigation to jump to the specified route
      </p>
      <div className="grid">
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
            />
          </h2>
          <p>View the source code of Github, feel free to contribute.</p>
        </a>
      </div>
    </main>
  </div>
);

export default Index;
