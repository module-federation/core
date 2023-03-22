import {HostOptions} from '../interfaces/HostOptions'

const defaultOptions = {
    typesFolder: '@mf-types',
    deleteTypesFolder: true
}

const buildZipUrl = (hostOptions: Required<HostOptions>, remote: string) => {
    const remoteStringUrl = remote.split('@').at(-1)!
    const remoteUrl = new URL(remoteStringUrl)
    remoteUrl.pathname = `${hostOptions.typesFolder}.zip`

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