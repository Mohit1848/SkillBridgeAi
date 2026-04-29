import type { Response } from "express";

export const badRequest = (response: Response, message: string): void => {
  response.status(400).json({ error: message });
};

export const unauthorized = (response: Response, message = "Authentication required."): void => {
  response.status(401).json({ error: message });
};
