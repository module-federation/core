import './Header.css';

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

export default Header;
