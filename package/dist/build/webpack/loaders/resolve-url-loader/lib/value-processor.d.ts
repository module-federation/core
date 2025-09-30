declare function valueProcessor(filename: any, options: any): (
/** A declaration value that may or may not contain a url() statement */
value: string, 
/** An absolute path that may be the correct base or an Iterator thereof */
candidate: any) => string;
export default valueProcessor;
