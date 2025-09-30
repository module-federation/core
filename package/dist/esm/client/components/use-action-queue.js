import React, { use } from 'react';
import { isThenable } from '../../shared/lib/is-thenable';
// The app router state lives outside of React, so we can import the dispatch
// method directly wherever we need it, rather than passing it around via props
// or context.
let dispatch = null;
export function dispatchAppRouterAction(action) {
    if (dispatch === null) {
        throw Object.defineProperty(new Error('Internal Next.js error: Router action dispatched before initialization.'), "__NEXT_ERROR_CODE", {
            value: "E668",
            enumerable: false,
            configurable: true
        });
    }
    dispatch(action);
}
export function useActionQueue(actionQueue) {
    const [state, setState] = React.useState(actionQueue.state);
    // Because of a known issue that requires to decode Flight streams inside the
    // render phase, we have to be a bit clever and assign the dispatch method to
    // a module-level variable upon initialization. The useState hook in this
    // module only exists to synchronize state that lives outside of React.
    // Ideally, what we'd do instead is pass the state as a prop to root.render;
    // this is conceptually how we're modeling the app router state, despite the
    // weird implementation details.
    if (process.env.NODE_ENV !== 'production') {
        const useSyncDevRenderIndicator = require('./react-dev-overlay/utils/dev-indicator/use-sync-dev-render-indicator').useSyncDevRenderIndicator;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const syncDevRenderIndicator = useSyncDevRenderIndicator();
        dispatch = (action)=>{
            syncDevRenderIndicator(()=>{
                actionQueue.dispatch(action, setState);
            });
        };
    } else {
        dispatch = (action)=>actionQueue.dispatch(action, setState);
    }
    return isThenable(state) ? use(state) : state;
}

//# sourceMappingURL=use-action-queue.js.map