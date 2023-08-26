import AdmZip from 'adm-zip'
import ansiColors from 'ansi-colors'
import axios from 'axios'
import {join} from 'path'

import {HostOptions} from '../interfaces/HostOptions'
import {RemoteOptions} from '../interfaces/RemoteOptions'

const retrieveTestsZipPath = (remoteOptions: Required<RemoteOptions>) => join(remoteOptions.distFolder, `${remoteOptions.testsFolder}.zip`)

export const createTypesArchive = async (remoteOptions: Required<RemoteOptions>, compiledFilesFolder: string) => {
  const zip = new AdmZip()
  zip.addLocalFolder(compiledFilesFolder)
  return zip.writeZipPromise(retrieveTestsZipPath(remoteOptions))
}

const downloadErrorLogger = (destinationFolder: string, fileToDownload: string) => (reason: Error) => {
  console.error(ansiColors.red(`Unable to download federated mocks for '${destinationFolder}' from '${fileToDownload}' because '${reason.message}', skipping...`))
  throw reason
}

export const downloadTypesArchive = (hostOptions: Required<HostOptions>) => async ([destinationFolder, fileToDownload]: string[]) => {
  const response = await axios.get(fileToDownload, {responseType: 'arraybuffer'}).catch(downloadErrorLogger(destinationFolder, fileToDownload))

  const destinationPath = join(hostOptions.mocksFolder, destinationFolder)

  const zip = new AdmZip(Buffer.from(response.data))
  zip.extractAllTo(destinationPath, true)
}
