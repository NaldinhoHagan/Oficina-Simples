import ejs from "ejs";
import path from "path";
import express from "express";
import { Op } from "sequelize";
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import Client from "../models/Client.js";

function renderViewToString(req, viewPath, locals = {}) {
  const filePath = path.join(req.app.get("views"), viewPath); // respeita app.set('views')
  return new Promise((resolve, reject) => {
    ejs.renderFile(filePath, locals, (err, str) => {
      if (err) return reject(err);
      resolve(str);
    });
  });
}

const router = express.Router();
router.use(ensureAuth);

// LISTAR
router.get("/", async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    const where = q ? { name: { [Op.iLike]: `%${q}%` } } : undefined;
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
      q,
      pagination: { page, totalPages: Math.max(Math.ceil(count / limit), 1) },
    });
  } catch (err) {
    next(err);
  }
});

// /clients/new
router.get("/new", ensureAdmin, async (req, res, next) => {
  try {
    const html = await renderViewToString("clients/form.ejs", {
      client: {},
      action: "/clients",
    });
    res.render("layout", { body: html }); // seu layout tem <%- body %>
  } catch (err) { next(err); }
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

// EDITAR (corrigido)
// /clients/:id/edit
router.get("/:id/edit", ensureAdmin, async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).send("Cliente não encontrado");

    const html = await renderViewToString("clients/form.ejs", {
      client,
      action: /clients/${client.id}?_method=PUT, // <-- crase aqui
    });
    res.render("layout", { body: html });
  } catch (err) { next(err); }
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
