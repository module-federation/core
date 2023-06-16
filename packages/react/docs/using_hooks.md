# Using hooks

Using a dynamically loaded remote:

```javascript
import React, { Suspense } from "react";
import { useDynamicRemote } from "@module-federation/react";

const remoteProps = {
    url: 'http://localhost:3001/',
    scope: 'remote_home',
    module: 'Application'
};

 const HomeRemote = React.lazy(() => useDynamicRemote(remoteProps));

export default () => {
    return (
        <Suspense fallback={<div>Loading remote...</div>}>
            <HomeRemote />
        </Suspense>
    )
};
```

Note: There are several optional props:
- remoteEntryFileName: The name of the remote entry file. Usually RemoteEntry.js or Remote.js.
- bustRemoteEntryCache: Disables browser caching by appending a timestamp to the url.
- verbose: Enable verbose console logging of activity.
- useEvents: Enable eventing of activity.

Using a eagerly loaded remote:

```javascript
import React, { Suspense } from "react";
import { useRemote } from "@module-federation/react";

const remoteProps = {
    scope: 'remote_home',
    module: 'Application'
};

const HomeRemote = React.lazy(() => useRemote(remoteProps));

export default () => {
    return (
        <Suspense fallback={<div>Loading remote...</div>}>
            <HomeRemote />
        </Suspense>
    )
};
```

Note: There are several optional props:
- verbose: Enable verbose console logging of activity.
- useEvents: Enable eventing of activity.