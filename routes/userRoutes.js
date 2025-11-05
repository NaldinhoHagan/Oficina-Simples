import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";

const router = express.Router();
router.use(ensureAuth, ensureAdmin);

// LISTAR (com busca + paginação)
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  const where = q ? { name: { [User.sequelize.Op.iLike]: `%${q}%` } } : undefined;
  const page = Math.max(parseInt(req.query.page || "1"), 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const { rows: users, count } = await User.findAndCountAll({ where, order: [["id","ASC"]], limit, offset });
  res.render("users/list", { users, pagination: { page, totalPages: Math.max(Math.ceil(count/limit),1) } });
});

router.get("/new", (req, res) => res.render("users/form", { user: {}, action: "/users" }));

router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: role || "user" });
  res.redirect("/users");
});

router.get("/:id/edit", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.render("users/form", { user, action: `/users/${user.id}?_method=PUT` });
});

router.put("/:id", async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.findByPk(req.params.id);
  user.name = name; user.email = email; user.role = role || user.role;
  if (password) user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();
  res.redirect("/users");
});

router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.render("users/show", { user });
});

router.delete("/:id", async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.redirect("/users");
});

export default router;
