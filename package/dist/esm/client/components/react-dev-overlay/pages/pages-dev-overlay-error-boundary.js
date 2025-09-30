import React from 'react';
export class PagesDevOverlayErrorBoundary extends React.PureComponent {
    static getDerivedStateFromError(error) {
        return {
            error
        };
    }
    componentDidCatch(error, // Loosely typed because it depends on the React version and was
    // accidentally excluded in some versions.
    errorInfo) {
        this.props.onError(error, (errorInfo == null ? void 0 : errorInfo.componentStack) || null);
        this.setState({
            error
        });
    }
    // Explicit type is needed to avoid the generated `.d.ts` having a wide return type that could be specific to the `@types/react` version.
    render() {
        // The component has to be unmounted or else it would continue to error
        return this.state.error ? null : this.props.children;
    }
    constructor(...args){
        super(...args), this.state = {
            error: null
        };
    }
}

//# sourceMappingURL=pages-dev-overlay-error-boundary.js.map