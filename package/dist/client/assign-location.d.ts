/**
 * Function to correctly assign location to URL
 *
 * The method will add basePath, and will also correctly add location (including if it is a relative path)
 * @param location Location that should be added to the url
 * @param url Base URL to which the location should be assigned
 */
export declare function assignLocation(location: string, url: URL): URL;
