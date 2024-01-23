import axios from 'axios';

describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({
      message: 'Welcome to node-host!',
      remotes: {
        node_remote: 'module from node-remote',
        node_local_remote: 'module from node-local-remote',
      },
    });
  });
});
