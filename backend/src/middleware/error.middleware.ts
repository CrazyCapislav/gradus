import type { Request, Response, NextFunction } from "express";

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
}


export default errorHandler;