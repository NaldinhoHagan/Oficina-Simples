import express from "express";
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import Client from "../models/Client.js";

const router = express.Router();
router.use(ensureAuth);

// Listar
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  const where = q ? { name: { [Client.sequelize.Op.iLike]: `%${q}%` } } : undefined;
  const page = Math.max(parseInt(req.query.page || "1"), 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const { rows: clients, count } = await Client.findAndCountAll({ where, order: [["id","ASC"]], limit, offset });
  res.render("clients/list", { clients, pagination: { page, totalPages: Math.max(Math.ceil(count/limit),1) } });
});

router.get("/new", ensureAdmin, (req, res) => res.render("clients/form", { client: {}, action: "/clients" }));

router.post("/", ensureAdmin, async (req, res) => {
  const { name, phone, email } = req.body;
  await Client.create({ name, phone, email });
  res.redirect("/clients");
});

router.get("/:id/edit", ensureAdmin, async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  res.render("clients/form", { client, action: `/clients/${client.id}?_method=PUT` });
});

router.put("/:id", ensureAdmin, async (req, res) => {
  const { name, phone, email } = req.body;
  const client = await Client.findByPk(req.params.id);
  client.name = name; client.phone = phone; client.email = email;
  await client.save();
  res.redirect("/clients");
});

router.get("/:id", async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  res.render("clients/show", { client });
});

router.delete("/:id", ensureAdmin, async (req, res) => {
  await Client.destroy({ where: { id: req.params.id } });
  res.redirect("/clients");
});

export default router;

