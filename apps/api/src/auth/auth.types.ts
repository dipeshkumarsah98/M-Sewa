import type { Request } from 'express';

/** The authenticated user that the passport strategies attach to `req.user`. */
export interface AuthUser {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  status: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  full_name: string;
  phone_number: string;
  status: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
