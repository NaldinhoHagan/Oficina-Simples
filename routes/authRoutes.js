import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

router.get("/login", (req, res) => res.render("login", { error: null }));

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ where: { email } });
  if (!u) return res.render("login", { error: "Credenciais inválidas" });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.render("login", { error: "Credenciais inválidas" });
  req.session.user = { id: u.id, name: u.name, role: u.role, email: u.email };
  res.redirect("/");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

export default router;
