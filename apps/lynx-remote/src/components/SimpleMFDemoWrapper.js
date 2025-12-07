/**
 * Plain JS wrapper for the Lynx SimpleMFDemo component
 * This avoids JSX transformation issues in Module Federation container
 */
import { SimpleMFDemo } from './SimpleMFDemo';

// Export the component without JSX syntax
export default SimpleMFDemo;
export { SimpleMFDemo };
