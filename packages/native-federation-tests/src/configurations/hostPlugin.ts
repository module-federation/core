import {HostOptions} from '../interfaces/HostOptions'

const defaultOptions = {
  testsFolder: '@mf-tests',
  mocksFolder: './__mocks__',
  deleteTestsFolder: true
}

const buildZipUrl = (hostOptions: Required<HostOptions>, remote: string) => {
  const remoteStringUrl = remote.split('@').at(-1)!
  const remoteUrl = new URL(remoteStringUrl)

  const pathnameWithoutEntry = remoteUrl.pathname.split('/').slice(0, -1).join('/')
  remoteUrl.pathname = `${pathnameWithoutEntry}/${hostOptions.testsFolder}.zip`

  return remoteUrl.href
}

const resolveRemotes = (hostOptions: Required<HostOptions>) => {
  return Object.entries(hostOptions.moduleFederationConfig.remotes as Record<string, string>)
    .reduce((accumulator, [key, remote]) => {
      accumulator[key] = buildZipUrl(hostOptions, remote)
      return accumulator
    }, {} as Record<string, string>)
}

export const retrieveHostConfig = (options: HostOptions) => {
  if (!options.moduleFederationConfig) {
    throw new Error('moduleFederationConfig is required')
  }

  const hostOptions: Required<HostOptions> = {...defaultOptions, ...options}
  const mapRemotesToDownload = resolveRemotes(hostOptions)

  return {
    hostOptions,
    mapRemotesToDownload
  }
}
