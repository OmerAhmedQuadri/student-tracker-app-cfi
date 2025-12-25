import type { AuthUser } from '../modules/auth/auth.types';

/**
 * Runtime-imported type augmentation.
 * This avoids TS config edge-cases with `.d.ts` discovery.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
