import express from "express";
import { Op } from "sequelize"; // ✅ usar Op correto
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import Client from "../models/Client.js";

const router = express.Router();
router.use(ensureAuth);

// LISTAR
router.get("/", async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    const where = q ? { name: { [Op.iLike]: `%${q}%` } } : undefined; // ✅ Op.iLike
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const { rows: clients, count } = await Client.findAndCountAll({
      where,
      order: [["id", "ASC"]],
      limit,
      offset,
    });

    res.render("clients/list", {
      clients,
      q, // ✅ para o input de busca no list.ejs
      pagination: { page, totalPages: Math.max(Math.ceil(count / limit), 1) },
    });
  } catch (err) {
    next(err);
  }
});

// NOVO
router.get("/new", ensureAdmin, (req, res) => {
  res.render("clients/form", { client: {}, action: "/clients" });
});

// CRIAR
router.post("/", ensureAdmin, async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    await Client.create({ name, phone, email });
    res.redirect("/clients");
  } catch (err) {
    next(err);
  }
});

// EDITAR (form)
router.get("/:id/edit", ensureAdmin, async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).send("Cliente não encontrado");
    res.render("clients/form", {
      client,
      action: `/clients/${client.id}?_method=PUT`,
    });
  } catch (err) {
    next(err);
  }
});

// ATUALIZAR
router.put("/:id", ensureAdmin, async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).send("Cliente não encontrado");
    client.name = name;
    client.phone = phone;
    client.email = email;
    await client.save();
    res.redirect("/clients");
  } catch (err) {
    next(err);
  }
});

// EXIBIR
router.get("/:id", async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).send("Cliente não encontrado");
    res.render("clients/show", { client });
  } catch (err) {
    next(err);
  }
});

// EXCLUIR
router.delete("/:id", ensureAdmin, async (req, res, next) => {
  try {
    await Client.destroy({ where: { id: req.params.id } });
    res.redirect("/clients");
  } catch (err) {
    next(err);
  }
});

export default router;
