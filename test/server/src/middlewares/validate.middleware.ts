import type { NextFunction, Request, Response } from 'express';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Minimal validation helper.
 * Keeps the backend simple while preventing common "undefined" bugs.
 */
export const requireFields = (
	target: ValidationTarget,
	fields: string[]
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const container =
			target === 'body' ? req.body : target === 'query' ? req.query : req.params;

		const missing = fields.filter((field) => {
			const value = (container as any)?.[field];
			return value === undefined || value === null || value === '';
		});

		if (missing.length > 0) {
			return res.status(400).json({
				message: 'Validation error',
				missing,
			});
		}

		return next();
	};
};

