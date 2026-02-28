import StyledJsxRegistry from './registry';

export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StyledJsxRegistry>{children}</StyledJsxRegistry>;
}
