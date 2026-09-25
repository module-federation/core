import lib from 'shared-lib';

export default async () => {
  const remote = await import('self/Button');
  return { button: remote.default(), remoteLib: remote.lib, hostLib: lib };
};
