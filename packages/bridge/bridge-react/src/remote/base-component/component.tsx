/**
 * Base version of RemoteAppWrapper without react-router-dom dependencies
 * This file is used by the /base entry point to avoid bundling router code
 * when it's not needed.
 */
import { RemoteAppWrapper } from '../RemoteAppWrapper';

/**
 * Base version without router data injection
 * Users must manually provide basename prop if needed
 */
export default RemoteAppWrapper;
