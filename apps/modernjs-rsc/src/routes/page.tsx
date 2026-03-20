import ClientCounter from '../client/ClientCounter';
import ServerMessage from '../server/ServerMessage';

const Page = async () => {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>ModernJS RSC + Module Federation</h1>
      <p>This example exposes both server and client components.</p>
      <ServerMessage />
      <ClientCounter />
    </main>
  );
};

export default Page;
