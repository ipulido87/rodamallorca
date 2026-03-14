import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware para validar el cuerpo de la solicitud (req.body)
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    req.body = result.data;
    next();
  };
};

/**
 * Middleware para validar los parámetros de ruta (req.params)
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    req.params = result.data as typeof req.params;
    next();
  };
};

/**
 * Middleware para validar los query parameters (req.query)
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    // En Express 5.x req.query es de solo lectura, usamos Object.assign
    // para modificar las propiedades sin reasignar el objeto
    Object.keys(req.query).forEach(key => delete (req.query as Record<string, unknown>)[key]);
    Object.assign(req.query, result.data);
    next();
  };
};
