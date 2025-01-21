import './Footer.css';

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

export default Footer;
