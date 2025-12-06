import jwt from "jsonwebtoken"

export const authMiddleware = (roles) => {
  return (req, res, next) => {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: "No token" })
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" })
      }
      req.user = decoded
      next()
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" })
    }
  }
}
