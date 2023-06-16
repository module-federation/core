# Using hooks with Typescript

**Note: This library does not dictate how or where you get your types, so we will simply create a local type in these examples**

Using a dynamically loaded remote:

```javascript
import React, { Suspense } from "react";
import { useDynamicRemote, RemotComponent, UseDynamicRemoteProps } from "@module-federation/react";

type HomeRemoteProps = RemotComponent & {
    id: number;
};

const remoteProps = {
    url: 'http://localhost:3001/',
    scope: 'remote_home',
    module: 'Application'
} as UseDynamicRemoteProps;

 const HomeRemote = React.lazy(() => useDynamicRemote<{ default: HomeRemoteProps }>(remoteProps));

export default () => {
    return (
        <Suspense fallback={<div>Loading remote...</div>}>
            <HomeRemote id={12345} />
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
import { useRemote, RemotComponent } from "@module-federation/react";

type HomeRemoteProps = RemotComponent & {
    id: number;
};

const remoteProps = {
    scope: 'remote_home',
    module: 'Application'
};

const HomeRemote = React.lazy(() => useRemote<{ default: HomeRemoteProps }>(remoteProps));

export default () => {
    return (
        <Suspense fallback={<div>Loading remote...</div>}>
            <HomeRemote id={12345} />
        </Suspense>
    )
};
```

Note: There are several optional props:
- verbose: Enable verbose console logging of activity.
- useEvents: Enable eventing of activity.