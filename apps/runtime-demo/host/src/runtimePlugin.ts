import { FederationRuntimePlugin } from '@module-federation/runtime/type';

export default function ():FederationRuntimePlugin {
  return {
    name: 'custom-plugin',
    beforeInit(args) {
      console.log('beforeInit: ',args)
      return args;
    },
    beforeLoadShare(args){
      console.log('beforeLoadShare: ',args)

      return args
    }
  };
};
