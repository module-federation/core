/** Monitor when the consumer finishes reading the response body.
that's as close as we can get to `res.on('close')` using web APIs.
*/
export declare function trackBodyConsumed(body: string | ReadableStream, onEnd: () => void): BodyInit;
export declare function trackStreamConsumed<TChunk>(stream: ReadableStream<TChunk>, onEnd: () => void): ReadableStream<TChunk>;
export declare class CloseController {
    private target;
    listeners: number;
    isClosed: boolean;
    onClose(callback: () => void): void;
    dispatchClose(): void;
}
