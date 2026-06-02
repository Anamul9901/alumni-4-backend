import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import config from '../config';
import sendResponse from '../utils/sendResponse';
import { TUserRole } from '../types';


let userInfo: JwtPayload | null = null;

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization;

    if (!token) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'You have no access to this route',
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
      userInfo = decoded;
      req.user = decoded;

      const role = decoded.role as TUserRole;
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        return sendResponse(res, {
          statusCode: httpStatus.FORBIDDEN,
          success: false,
          message: 'You do not have permission to access this route',
        });
      }

      next();
    } catch {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'Invalid token',
      });
    }
  });
};

export const getUserInfo = () => userInfo;
export default auth;
