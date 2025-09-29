import jwt from "jsonwebtoken";

export const accessValidation = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server misconfigured: JWT_SECRET missing" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "string") {
      req.user = decoded;
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
