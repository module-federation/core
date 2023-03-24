import {describe, expect, it} from 'vitest'

import {retrieveHostConfig} from './hostPlugin'

describe('hostPlugin', () => {
    const moduleFederationConfig = {
        name: 'moduleFederationHost',
        filename: 'remoteEntry.js',
        remotes: {
          moduleFederationTypescript: 'http://localhost:3000/remoteEntry.js',
        },
        shared: {
          react: {singleton: true, eager: true},
          'react-dom': {singleton: true, eager: true}
        },
      }

    describe('retrieveHostConfig', () => {
        it('throws for missing module federation configuration', () => {
            // @ts-expect-error Missing module federation configuration
            const invokeRetrieve = () => retrieveHostConfig({})
            expect(invokeRetrieve).toThrowError('moduleFederationConfig is required')
        })

        describe('correctly intersect with default options', () => {
            it('only moduleFederationConfig provided', () => {
                const {hostOptions, mapRemotesToDownload} = retrieveHostConfig({
                    moduleFederationConfig
                })

                expect(hostOptions).toStrictEqual({
                    moduleFederationConfig,
                    typesFolder: '@mf-types',
                    deleteTypesFolder: true
                })

                expect(mapRemotesToDownload).toStrictEqual({
                    moduleFederationTypescript: 'http://localhost:3000/@mf-types.zip'
                })
            })

            it('all options provided', () => {
                const options = {
                    moduleFederationConfig,
                    typesFolder: 'custom-types',
                    deleteTypesFolder: false
                }

                const {hostOptions, mapRemotesToDownload} = retrieveHostConfig(options)

                expect(hostOptions).toStrictEqual(options)

                expect(mapRemotesToDownload).toStrictEqual({
                    moduleFederationTypescript: 'http://localhost:3000/custom-types.zip'
                })
            })
        })
    })
})