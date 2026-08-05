import "express";

declare module "http" {
    interface IncomingMessage {
        rawBody?: Buffer;
    }
}

// declare module "express-serve-static-core" {
//     interface Request {
//         rawBody?: Buffer;
//     }
// }