const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const ServerMessage = async () => {
  await wait(20);
  const renderedAt = new Date().toISOString();

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Server Component</h2>
      <p>Rendered at: {renderedAt}</p>
    </section>
  );
};

export default ServerMessage;
