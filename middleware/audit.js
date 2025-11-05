import Log from "../models/Log.js";

export async function audit(req, res, next) {
  res.on("finish", async () => {
    try {
      const userId = req.session?.user?.id || null;
      const action = `${req.method} ${req.originalUrl}`;
      await Log.create({
        userId,
        method: req.method,
        route: req.path,
        action,
        payload: (["POST","PUT","DELETE"].includes(req.method)) ? req.body : null
      });
    } catch (e) {
      console.error("Audit error:", e.message);
    }
  });
  next();
}
