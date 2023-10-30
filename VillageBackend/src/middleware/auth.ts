import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user: UserData;
}

export interface UserData {
  role: string;
  phone: string;
  id: number;
}

function isUserData(obj: any): obj is UserData {
  return (
    obj &&
    typeof obj.role === "string" &&
    typeof obj.phone === "string" &&
    typeof obj.id === "number"
  );
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If there's no token, return an error
  if (!token) return res.status(401).send("Access Denied: No Token Provided!");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    if (isUserData(payload)) {
      // Add user data to the request
      (req as any).user = payload;
      next();
    } else {
      res.status(403).send("Access Denied: Invalid Token Structure!");
    }
  } catch (error) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof NotBeforeError ||
      error instanceof TokenExpiredError
    ) {
      res.status(403).send("Access Denied: Invalid Token!");
    } else {
      res.status(500).send("Internal Server Error.");
    }
  }
};

export default authenticateToken;
