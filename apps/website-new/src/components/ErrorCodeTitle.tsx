import { getCustomMDXComponent } from 'rspress/theme';
import { errorDescMap } from '@module-federation/error-codes';

const ErrorCodeTitle = ({ code }: { code: string }) => {
  const { h1, ul, li } = getCustomMDXComponent();
  const Title = h1({ children: errorDescMap[code] });
  const Info = ul({
    children: li({
      children: ['Error Code: ', <code key={`err-code-${code}`}>{code}</code>],
    }),
  });
  return (
    <>
      {Title}
      {Info}
    </>
  );
};

export default ErrorCodeTitle;
