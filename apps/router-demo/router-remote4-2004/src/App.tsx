const ErrorComponent = () => {
  throw new Error('This is a deliberately thrown error!');
  return <div>This will never be rendered</div>;
};

export default ErrorComponent;
