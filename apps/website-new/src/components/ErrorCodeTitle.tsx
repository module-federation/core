import { useLang } from '@rspress/core/runtime';
import { getCustomMDXComponent } from '@rspress/core/theme';
import { errorDescMap } from '@module-federation/error-codes';

const ErrorCodeTitle = ({ code }: { code: string }) => {
  const lang = useLang();
  const { h1, ul, li } = getCustomMDXComponent();
  const Title = h1({ children: errorDescMap[code] });
  const Info = ul({
    children: li({
      children: [
        lang === 'de' ? 'Fehlercode: ' : 'Error Code: ',
        <code key={`err-code-${code}`}>{code}</code>,
      ],
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
