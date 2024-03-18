// import { DEFAULT_LOCAL_IPS } from '../constant';
// import { exposeRpc } from '../rpc/expose-rpc';
// import { DTSManager } from './DTSManager';
// import { MANIFEST_EXT, parseEntry } from '@module-federation/sdk';
// import {
// 	type Remote,
// 	type UpdateCallbackOptions,
// 	UpdateKind,
// 	UpdateMode,
// 	ModuleFederationDevServer,
// 	createKoaServer,
// 	fileLog,
// 	getIPV4,
// } from '@module-federation/dev-server';
// import type { DtsWorkerOptions } from './DtsWorker';
// import { RpcGMCallTypes, type RpcMessage } from '../rpc/types';
// import { retrieveHostConfig } from '../configurations/hostPlugin';
// import { HostOptions } from '../interfaces/HostOptions';

// interface Options extends DtsWorkerOptions {
//   name:string;
// }

// function getIpFromEntry(entry: string): string | undefined {
// 	let ip;
// 	entry.replace(/https?:\/\/([0-9|\.]+|localhost):/, (str, matched) => {
// 		ip = matched;
// 		return str;
// 	});
// 	if (ip) {
// 		return DEFAULT_LOCAL_IPS.includes(ip) ? getIPV4() : ip;
// 	}
// }

// let typesManager: DTSManager,
// 	serverAddress: string,
// 	moduleServer: ModuleFederationDevServer,
// 	cacheOptions: Options;

// function getLocalRemoteNames(options: HostOptions): Remote[] {
//   const {  mapRemotesToDownload } = retrieveHostConfig(options);

// 	return Object.keys(mapRemotesToDownload).reduce((sum, remoteModuleName) => {
// 		const remoteInfo = mapRemotesToDownload[remoteModuleName];
// 		if (remoteInfo.url.endsWith(MANIFEST_EXT)) {
// 			const parsedInfo = parseEntry(remoteInfo.url);
// 			if ('entry' in parsedInfo) {
// 				const ip = getIpFromEntry(parsedInfo.entry);
// 				if (!ip) {
// 					return sum;
// 				}
// 				sum.push({
// 					name: parsedInfo.name,
// 					entry: parsedInfo.entry,
// 					ip,
// 				});
// 			}
// 		}
// 		return sum;
// 	}, [] as Remote[]);
// }

// async function updateCallback(options: UpdateCallbackOptions): Promise<void> {
// 	const { updateMode, name, remoteTypeTarPath } = options;
// 	const { disableGenerateTypes, disableLiveReload } = cacheOptions || {};
// 	fileLog(
// 		`sync remote module ${name}, types to vmok ${cacheOptions?.name},typesManager.updateTypes run`,
// 		'forkDevWorker',
// 		'info',
// 	);
// 	if (!disableLiveReload && moduleServer) {
// 		moduleServer.update({
// 			updateKind: UpdateKind.RELOAD_PAGE,
// 			updateMode: UpdateMode.PASSIVE,
// 		});
// 	}

// 	if (!disableGenerateTypes && typesManager) {
// 		await typesManager.updateTypes({
// 			updateMode,
// 			remoteName: name,
// 			remoteTarPath: remoteTypeTarPath,
// 		});
// 	}
// }

// export async function forkDtsWorker(
// 	options: Options,
// 	action?: string,
// ): Promise<void> {
// 	if (!typesManager) {
// 		const { name, remotes, vmokModuleInfos, exposes, region } = options;
// 		typesManager = new DTSManager({
// 			name,
// 			exposes,
// 			remotes,
// 			vmokModuleInfos,
// 			region,
// 		});
// 		if (!options.disableGenerateTypes) {
// 			await Promise.all([
// 				createKoaServer({
// 					typeTarPath: `${typesManager.exposeDir}/${defaultTarName}`,
// 				}).then((res) => {
// 					serverAddress = res.serverAddress;
// 				}),
// 				typesManager.generateAllTypes(),
// 			]).catch((err) => {
// 				fileLog(
// 					`${name} module generateAllTypes done, localServerAddress:  ${JSON.stringify(
// 						err,
// 					)}`,
// 					'forkDevWorker',
// 					'error',
// 				);
// 			});
// 			fileLog(
// 				`${name} module generateAllTypes done, localServerAddress:  ${serverAddress}`,
// 				'forkDevWorker',
// 				'info',
// 			);
// 		}

// 		moduleServer = new ModuleFederationDevServer({
// 			name: options.name,
// 			remotes: getLocalRemoteNames(options.remotes),
// 			updateCallback,
// 			remoteTypeTarPath: `${serverAddress}/types.tar.gz`,
// 		});
// 		cacheOptions = options;
// 	}

// 	if (action === 'update' && cacheOptions) {
// 		fileLog(
// 			`remoteModule ${cacheOptions.name} receive devWorker update, start typesManager.updateTypes `,
// 			'forkDevWorker',
// 			'info',
// 		);
// 		if (!cacheOptions.disableLiveReload) {
// 			moduleServer &&
// 				moduleServer.update({
// 					updateKind: UpdateKind.RELOAD_PAGE,
// 					updateMode: UpdateMode.POSITIVE,
// 				});
// 		}

// 		if (!cacheOptions.disableGenerateTypes) {
// 			// TODO: 连续快速更新
// 			typesManager &&
// 				typesManager
// 					.updateTypes({
// 						updateMode: UpdateMode.POSITIVE,
// 						remoteName: cacheOptions.name,
// 					})
// 					.then(() => {
// 						moduleServer &&
// 							moduleServer.update({
// 								updateKind: UpdateKind.UPDATE_TYPE,
// 								updateMode: UpdateMode.POSITIVE,
// 							});
// 					});
// 		}
// 	}
// }

// process.on('message', (message: RpcMessage) => {
// 	fileLog(
// 		`ChildProcess(${process.pid}), message: ${JSON.stringify(message)} `,
// 		'forkDevWorker',
// 		'info',
// 	);
// 	if (message.type === RpcGMCallTypes.EXIT) {
// 		fileLog(
// 			`ChildProcess(${process.pid}) SIGTERM, Vmok DevServer will exit...`,
// 			'forkDevWorker',
// 			'error',
// 		);
// 		moduleServer.exit();
// 		process.exit(0);
// 	}
// });

// exposeRpc(forkDevWorker);
