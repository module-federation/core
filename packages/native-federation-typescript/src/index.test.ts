import AdmZip from 'adm-zip'
import axios from 'axios'
import dirTree from 'directory-tree'
import {rm} from 'fs/promises'
import {join, resolve} from 'path'
import {UnpluginOptions} from 'unplugin'
import {describe, expect, it, vi} from 'vitest'

import {NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote} from './index'

describe('index', () => {
    describe('NativeFederationTypeScriptRemote', () => {
        it('throws for missing moduleFederationConfig', () => {
            // @ts-expect-error missing moduleFederationConfig
            const writeBundle = () => NativeFederationTypeScriptRemote.rollup({})
            expect(writeBundle).toThrowError('moduleFederationConfig is required')
        })

        it('correctly writeBundle', async () => {
            const options = {
                moduleFederationConfig: {
                    name: 'moduleFederationTypescript',
                    filename: 'remoteEntry.js',
                    exposes: {
                        './index': './src/index.ts',
                    },
                    shared: {
                        react: {singleton: true, eager: true},
                        'react-dom': {singleton: true, eager: true}
                    },
                },
                tsConfigPath: './tsconfig.json',
                typesFolder: '@mf-types',
                compiledTypesFolder: 'compiled-types',
                deleteTypesFolder: false,
                additionalFilesToCompile: []
            }

            const distFolder = join('./dist', options.typesFolder)

            const unplugin = NativeFederationTypeScriptRemote.rollup(options) as UnpluginOptions
            await unplugin.writeBundle?.()

            expect(dirTree(distFolder)).toMatchObject({
                name: '@mf-types',
                children: [
                    {
                        name: 'compiled-types',
                        children: [
                            {
                                name: 'configurations',
                                children: [
                                    {name: 'hostPlugin.d.ts'},
                                    {name: 'remotePlugin.d.ts'},
                                ],
                            },
                            {name: 'index.d.ts'},
                            {
                                name: 'interfaces',
                                children: [
                                    {name: 'HostOptions.d.ts'},
                                    {name: 'RemoteOptions.d.ts'},
                                ],
                            },
                            {
                                name: 'lib',
                                children: [
                                    {name: 'archiveHandler.d.ts'},
                                    {name: 'typeScriptCompiler.d.ts'},
                                ],
                            },
                        ],
                    },
                ],
            })
        })

        it('correctly enrich webpack config', async () => {
            const options = {
                moduleFederationConfig: {
                    name: 'moduleFederationTypescript',
                    filename: 'remoteEntry.js',
                    exposes: {
                        './index': './src/index.ts',
                    },
                    shared: {
                        react: {singleton: true, eager: true},
                        'react-dom': {singleton: true, eager: true}
                    },
                },
                deleteTestsFolder: false,
                testsFolder: '@mf-tests'
            }

            const webpackCompiler = {
                options: {
                    devServer: {
                        foo: {}
                    }
                }
            }

            const unplugin = NativeFederationTypeScriptRemote.rollup(options) as UnpluginOptions
            await unplugin.webpack?.(webpackCompiler)

            expect(webpackCompiler).toStrictEqual({
                options: {
                    devServer: {
                        foo: {},
                        static: {
                            directory: resolve('./dist')
                        }
                    }
                }
            })
        })
    })

    describe('NativeFederationTypeScriptHost', () => {
        it('throws for missing moduleFederationConfig', () => {
            // @ts-expect-error missing moduleFederationConfig
            const writeBundle = () => NativeFederationTypeScriptHost.rollup({})
            expect(writeBundle).toThrowError('moduleFederationConfig is required')
        })

        it('correctly writeBundle', async () => {
            const options = {
                moduleFederationConfig: {
                    name: 'moduleFederationTypescript',
                    filename: 'remoteEntry.js',
                    remotes: {
                        remotes: 'https://foo.it',
                    },
                    shared: {
                        react: {singleton: true, eager: true},
                        'react-dom': {singleton: true, eager: true},
                    },
                },
                typesFolder: '@mf-types'
            }

            const distFolder = join('./dist', options.typesFolder)
            const zip = new AdmZip()
            await zip.addLocalFolderPromise(distFolder, {})

            axios.get = vi.fn().mockResolvedValueOnce({data: zip.toBuffer()})

            const unplugin = NativeFederationTypeScriptHost.rollup(options) as UnpluginOptions
            await expect(unplugin.writeBundle?.()).resolves.not.toThrow()

            expect(dirTree(options.typesFolder)).toMatchObject({
                name: '@mf-types',
                children: [
                    {
                        name: 'remotes',
                        children: [
                            {
                                name: 'compiled-types',
                                children: [
                                    {
                                        name: 'configurations',
                                        children: [
                                            {name: 'hostPlugin.d.ts'},
                                            {name: 'remotePlugin.d.ts'},
                                        ],
                                    },
                                    {
                                        name: 'index.d.ts',
                                    },
                                    {
                                        name: 'interfaces',
                                        children: [
                                            {name: 'HostOptions.d.ts'},
                                            {name: 'RemoteOptions.d.ts'},
                                        ],
                                    },
                                    {
                                        name: 'lib',
                                        children: [
                                            {name: 'archiveHandler.d.ts'},
                                            {name: 'typeScriptCompiler.d.ts'},
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })

            await rm(options.typesFolder, {recursive: true, force: true})
        })
    })
})
