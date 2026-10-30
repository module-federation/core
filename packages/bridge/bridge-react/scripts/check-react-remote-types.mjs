import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  rmSync,
  realpathSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(packageRoot, 'package.json'));
const compiler = join(
  dirname(require.resolve('typescript/package.json')),
  'bin/tsc',
);
// The package compiler no longer supports legacy Node resolution. Keep a
// regression using the workspace compiler for frameworks that still use it.
const workspaceRequire = createRequire(
  join(packageRoot, '../../../package.json'),
);
const classicCompiler = join(
  dirname(workspaceRequire.resolve('typescript/package.json')),
  'bin/tsc',
);
const fixture = mkdtempSync(join(tmpdir(), 'mf-react-remote-types-'));
const packageDir = (name) => {
  for (
    let current = packageRoot;
    current !== dirname(current);
    current = dirname(current)
  ) {
    const candidate = join(current, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json')))
      return realpathSync(candidate);
  }
  throw new Error(`Cannot locate ${name}`);
};
const link = (name, directory = packageDir(name)) => {
  const target = join(fixture, 'node_modules', name);
  mkdirSync(dirname(target), { recursive: true });
  symlinkSync(directory, target, 'dir');
};
try {
  link('@module-federation/bridge-react', packageRoot);
  link('@module-federation/enhanced');
  link('react');
  link('@types/react');
  link('@types/react-dom');
  link('@types/node');
  const source = `
import * as React from 'react';
import { createReactRemote, ReactRemote, type CreateReactRemoteOptions } from '@module-federation/bridge-react';
import { createReactRemote as createBaseRemote, ReactRemote as BaseRemote } from '@module-federation/bridge-react/base';
import { createBridgeComponent as create18 } from '@module-federation/bridge-react/v18';
import { createBridgeComponent as create19 } from '@module-federation/bridge-react/v19';
import { createBridgeComponent as create17 } from '@module-federation/bridge-react';
import { createBridgeRouterConnector as connectDefault } from '@module-federation/bridge-react';
import { createBridgeRouterConnector, type BridgeRouterAdapter, type BridgeRouterLocation } from '@module-federation/bridge-react/base';
import { createBridgeRouterConnector as connect18 } from '@module-federation/bridge-react/v18';
import { createBridgeRouterConnector as connect19 } from '@module-federation/bridge-react/v19';
import Shop, * as namespace from './remote.js';
declare const routerAdapter: BridgeRouterAdapter;
for (const connect of [connectDefault, createBridgeRouterConnector, connect18, connect19]) {
  const connection = connect({onError: () => {}});
  connection.attach(routerAdapter);
  connection.setNavigation(undefined);
  connection.dispose();
}
const entry: BridgeRouterLocation = {url: '/inventory', key: 'one'};
// @ts-expect-error history entry identity is required even for same-URL navigation
const noEntryIdentity: BridgeRouterLocation = {url: '/inventory'};


declare global { namespace ModuleFederation { interface RemoteModuleMap {
  'shop/App': typeof namespace;
} } }
const Sync = createReactRemote({ remote: () => Shop });
const Async = createReactRemote({ remote: async () => Shop });
const Namespace = createReactRemote({ remote: () => namespace });
const Loader = createReactRemote({ remote: () => import('./remote.js') });
const Literal = createReactRemote({ remote: 'shop/App' });
const BaseLiteral = createBaseRemote({ remote: 'shop/App' });
const Named = createReactRemote({ remote: () => import('./remote.js'), exportName: 'Named' });
<Sync value={1} />; <Async value={1} />; <Namespace value={1} />;
<Loader value={1} />; <Literal value={1} />; <BaseLiteral value={1} />; <Named label="x" />;
// @ts-expect-error required inferred props
<Sync />;
// @ts-expect-error incorrect inferred prop
<Async value="bad" />;
// @ts-expect-error namespace default keeps props
<Namespace value="bad" />;
// @ts-expect-error import loader keeps props
<Loader value="bad" />;
// @ts-expect-error literal registry keeps props
<Literal value="bad" />;
// @ts-expect-error base uses same registry
<BaseLiteral value="bad" />;
// @ts-expect-error named export keeps props
<Named value={1} />;
// @ts-expect-error reject missing export rather than widen
createReactRemote({ remote: () => namespace, exportName: 'Missing' });
// @ts-expect-error known literal missing export
createReactRemote({ remote: 'shop/App', exportName: 'Missing' });
<ReactRemote remote={() => Shop} props={{value:1}} />;
<ReactRemote remote={async () => Shop} props={{value:1}} />;
<ReactRemote remote={() => import('./remote.js')} props={{value:1}} />;
<ReactRemote remote="shop/App" props={{value:1}} />;
<BaseRemote remote="shop/App" props={{value:1}} />;
<ReactRemote remote={() => namespace} exportName="Named" props={{label:'x'}} />;
// @ts-expect-error required declaration props
<ReactRemote remote={() => Shop} />;
// @ts-expect-error declared literal keeps exact props
<ReactRemote remote="shop/App" props={{value:'bad'}} />;
// @ts-expect-error declared thunk keeps exact props
<ReactRemote remote={() => Shop} props={{value:'bad'}} />;
// @ts-expect-error declared named export rejects wrong props
<ReactRemote remote={() => namespace} exportName="Named" props={{value:1}} />;
// @ts-expect-error declared missing export cannot fall back
<ReactRemote remote={() => namespace} exportName="Missing" props={{anything:1}} />;
const Memo = React.memo(Shop);
const Forward = React.forwardRef<HTMLDivElement, {name:string}>((p, ref) => <div ref={ref}>{p.name}</div>);
const MemoRemote = createReactRemote({remote:()=>Memo});
const ForwardRemote = createReactRemote({remote:()=>Forward});
const Lazy = React.lazy(async () => ({default:Shop}));
const LazyRemote = createReactRemote({remote:()=>Lazy});
<LazyRemote value={1}/>;
<ReactRemote remote={()=>Lazy} props={{value:1}}/>;
// @ts-expect-error lazy component keeps required props
<LazyRemote />;
// @ts-expect-error lazy component keeps props types
<ReactRemote remote={()=>Lazy} props={{value:'bad'}}/>;
<MemoRemote value={1}/>; <ForwardRemote name="x" ref={React.createRef<HTMLDivElement>()}/>;
// @ts-expect-error memo props
<MemoRemote value="bad"/>;
// @ts-expect-error forwardRef props
<ForwardRemote name={1}/>;
const p17 = create17({rootComponent:Shop});
const p18 = create18({rootComponent:Shop});
const p19 = create19({rootComponent:Shop});
// Preserve the existing asynchronous render result for built-in providers.
p17().render({dom:document.createElement('div')}).then(() => {});
p18().render({dom:document.createElement('div')}).then(() => {});
p19().render({dom:document.createElement('div')}).then(() => {});
const App17 = createReactRemote({remote:()=>p17});
const App18 = createReactRemote({remote:()=>p18});
const App19 = createReactRemote({remote:()=>({default:p19})});
<App17 value={1}/>; <App18 value={1}/>; <App19 value={1}/>;
// @ts-expect-error legacy provider must retain props
<App17 value="bad"/>;
// @ts-expect-error v18 provider must retain props
<App18 />;
// @ts-expect-error v19 provider must retain props
<App19 value="bad"/>;
// @ts-expect-error named Bridge providers are not supported by the runtime
createReactRemote({remote:()=>({provider:p18}), exportName:'provider'});
const NoProps = () => <p>empty</p>;
const Empty = createReactRemote({remote:()=>NoProps});
<Empty />; <ReactRemote remote={()=>NoProps} />;
const Optional = (props: {value?:number}) => <p>{props.value}</p>;
<ReactRemote remote={()=>Optional} />;
type LabOptions = Omit<CreateReactRemoteOptions, 'remote' | 'fallback'>;
function genericOptionsFactory<P extends object>(options: LabOptions, remote: string): React.ComponentType<P & {labFailure?:string;labRun?:string}> {
  return React.useMemo(() => createReactRemote<P & {labFailure?:string;labRun?:string}>({
    ...options,
    remote,
    dataFetchParams: {isDowngrade:false, ...options.dataFetchParams, labFailure:'data'},
    fallback: ({error}) => <p>{error.message}</p>,
  }), [options, remote]);
}
function GenericOptionsDeclaration<P extends object>(props: P, options: CreateReactRemoteOptions) {
  return <ReactRemote<P & {labFailure?:string;labRun?:string}> {...options} props={props}/>;
}
function genericWholeOptions<P extends object>(options: CreateReactRemoteOptions): React.ComponentType<P> {
  return createReactRemote<P>({...options});
}
const dynamicExport: string | undefined = Math.random() > 0.5 ? 'Named' : undefined;
const OptionsGeneric = genericOptionsFactory<{required:string}>({exportName:dynamicExport}, 'dynamic/Options');
const WholeOptionsGeneric = genericWholeOptions<{required:string}>({remote:()=>Shop, exportName:dynamicExport});
<OptionsGeneric required="ok"/>; <WholeOptionsGeneric required="ok"/>;
GenericOptionsDeclaration({required:'ok'}, {remote:'dynamic/Options', exportName:dynamicExport});
// @ts-expect-error spreading broad options must not erase explicit business props
<OptionsGeneric required={1}/>;
// @ts-expect-error a whole options object must retain required explicit props
<WholeOptionsGeneric />;
function genericPublicFactory<P extends object>(remote: string): React.ComponentType<P> {
  return createReactRemote<P>({remote});
}
function genericFactory<P extends object>(id: string): React.ComponentType<P & {labFailure?:string;labRun?:string}> {
  return createReactRemote<P & {labFailure?:string;labRun?:string}>({remote:id});
}
function genericCallbackFactory<P extends object>(source: () => unknown) {
  return createReactRemote<P & {labFailure?:string;labRun?:string}>({remote:source});
}
function GenericDeclaration<P extends object>(props: P) {
  return <ReactRemote<P & {labFailure?:string;labRun?:string}> remote="dynamic/Generic" props={props}/>;
}
const PublicGeneric = genericPublicFactory<{required:string}>('dynamic/Generic');
<PublicGeneric required="ok"/>;
// @ts-expect-error annotated wrapper retains exact business prop errors
<PublicGeneric required={1}/>;
const Generic = genericFactory<{required:string}>('dynamic/Generic');
const GenericCallback = genericCallbackFactory<{required:string}>(()=>Shop);
<Generic required="ok" labFailure="test"/>;
<GenericCallback required="ok" labRun="test"/>;
<GenericDeclaration required="ok"/>;
// @ts-expect-error generic wrapper retains business prop errors
<Generic required={1}/>;
// @ts-expect-error generic callback wrapper retains required props
<GenericCallback />;
const dynamic: string = String(Math.random());
const Dynamic = createReactRemote({remote:dynamic});
<Dynamic anything={1}/>;
<ReactRemote remote={dynamic} props={{anything:1}}/>;
const Explicit = createReactRemote<{required:string}>({remote:dynamic});
<Explicit required="ok"/>;
// @ts-expect-error explicit generics remain checked
<Explicit required={1}/>;
<ReactRemote<{required:string}> remote={dynamic} props={{required:'ok'}}/>;
// @ts-expect-error explicit declaration generics remain checked
<ReactRemote<{required:string}> remote={dynamic} props={{required:1}}/>;
`;
  for (const mode of ['module', 'commonjs', 'classic-node']) {
    const directory = join(fixture, mode);
    mkdirSync(directory);
    writeFileSync(
      join(directory, 'package.json'),
      JSON.stringify({ type: mode === 'module' ? 'module' : 'commonjs' }),
    );
    writeFileSync(
      join(directory, 'remote.tsx'),
      `import * as React from 'react';
export default function Shop(props:{value:number}) { return <p>{props.value}</p> }
export function Named(props:{label:string}) { return <p>{props.label}</p> }`,
    );
    writeFileSync(join(directory, 'index.tsx'), source);
    writeFileSync(
      join(directory, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          jsx: 'react-jsx',
          target: 'ES2020',
          module: mode === 'classic-node' ? 'CommonJS' : 'NodeNext',
          moduleResolution: mode === 'classic-node' ? 'Node' : 'NodeNext',
          ...(mode === 'classic-node' ? { ignoreDeprecations: '6.0' } : {}),
          esModuleInterop: true,
          types: ['node', 'react'],
        },
        include: ['./*.tsx'],
      }),
    );
    const result = spawnSync(
      process.execPath,
      [
        mode === 'classic-node' ? classicCompiler : compiler,
        '-p',
        join(directory, 'tsconfig.json'),
      ],
      { encoding: 'utf8' },
    );
    if (result.status !== 0)
      throw new Error(
        `${mode} inference checks failed\n${result.stdout}\n${result.stderr}`,
      );
    console.log(`${mode}: remote props inference and expected errors passed`);
  }
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
