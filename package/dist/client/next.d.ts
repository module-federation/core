import './webpack';
import '../lib/require-instrumentation-client';
declare global {
    interface Window {
        next: any;
    }
}
