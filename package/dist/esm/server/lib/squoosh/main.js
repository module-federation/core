import { Worker } from "next/dist/compiled/jest-worker";
import * as path from "path";
import { execOnce } from "../../../shared/lib/utils";
import { cpus } from "os";
const getWorker = execOnce(()=>new Worker(path.resolve(__dirname, "impl"), {
        enableWorkerThreads: true,
        // There will be at most 6 workers needed since each worker will take
        // at least 1 operation type.
        numWorkers: Math.max(1, Math.min(cpus().length - 1, 6)),
        computeWorkerKey: (method)=>method
    }));
export async function getMetadata(buffer) {
    const worker = getWorker();
    const { width, height } = await worker.decodeBuffer(buffer);
    return {
        width,
        height
    };
}
export async function processBuffer(buffer, operations, encoding, quality) {
    const worker = getWorker();
    let imageData = await worker.decodeBuffer(buffer);
    for (const operation of operations){
        if (operation.type === "rotate") {
            imageData = await worker.rotate(imageData, operation.numRotations);
        } else if (operation.type === "resize") {
            const opt = {
                image: imageData,
                width: 0,
                height: 0
            };
            if (operation.width && imageData.width && imageData.width > operation.width) {
                opt.width = operation.width;
            }
            if (operation.height && imageData.height && imageData.height > operation.height) {
                opt.height = operation.height;
            }
            if (opt.width > 0 || opt.height > 0) {
                imageData = await worker.resize(opt);
            }
        }
    }
    switch(encoding){
        case "jpeg":
            return Buffer.from(await worker.encodeJpeg(imageData, {
                quality
            }));
        case "webp":
            return Buffer.from(await worker.encodeWebp(imageData, {
                quality
            }));
        case "avif":
            const avifQuality = quality - 20;
            return Buffer.from(await worker.encodeAvif(imageData, {
                quality: Math.max(avifQuality, 0)
            }));
        case "png":
            return Buffer.from(await worker.encodePng(imageData));
        default:
            throw Error(`Unsupported encoding format`);
    }
}
export async function decodeBuffer(buffer) {
    const worker = getWorker();
    const imageData = await worker.decodeBuffer(buffer);
    return imageData;
}

//# sourceMappingURL=main.js.map