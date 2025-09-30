import React from 'react';
import * as Bus from './bus';
import { useErrorOverlayReducer } from '../shared';
import { Router } from '../../../router';
export const usePagesDevOverlay = ()=>{
    const [state, dispatch] = useErrorOverlayReducer('pages');
    React.useEffect(()=>{
        Bus.on(dispatch);
        const { handleStaticIndicator } = require('./hot-reloader-client');
        Router.events.on('routeChangeComplete', handleStaticIndicator);
        return function() {
            Router.events.off('routeChangeComplete', handleStaticIndicator);
            Bus.off(dispatch);
        };
    }, [
        dispatch
    ]);
    const onComponentError = React.useCallback((_error, _componentStack)=>{
    // TODO: special handling
    }, []);
    return {
        state,
        onComponentError
    };
};

//# sourceMappingURL=hooks.js.map