import express from "express";
import ejs from "ejs";
import path from "path";
import { Op } from "sequelize";
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import Client from "../models/Client.js";

const router = express.Router();
router.use(ensureAuth);

// Função auxiliar para renderizar views EJS em string (HTML)
function renderViewToString(viewRelPath, locals = {}) {
  const filePath = path.resolve(process.cwd(), "views", viewRelPath);
  return new Promise((resolve, reject) => {
    ejs.renderFile(filePath, locals, (err, str) => {
      if (err) return reject(err);
      resolve(str);
    });
  });
}

// LISTAR CLIENTES
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

// NOVO CLIENTE
router.get("/new", ensureAdmin, async (req, res, next) => {
  try {
    const html = await renderViewToString("clients/form.ejs", {
      client: {},
      action: "/clients",
    });
    res.render("layout", { body: html });
  } catch (err) {
    next(err);
  }
});

// CRIAR CLIENTE
router.post("/", ensureAdmin, async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    console.log("POST /clients ->", { name, phone, email }); // DEBUG: veja no Render

    await Client.create({ name, phone, email });
    return res.redirect("/clients");
  } catch (err) {
    console.error("Erro ao criar cliente:", err?.name, err?.message); // DEBUG

    // Re-renderiza o form com os dados preenchidos e a mensagem de erro
    try {
      const html = await renderViewToString("clients/form.ejs", {
        client: {
          id: null,
          name: req.body?.name || "",
          phone: req.body?.phone || "",
          email: req.body?.email || "",
        },
        action: "/clients",
        error: err?.errors?.[0]?.message || err?.message || "Falha ao salvar",
      });
      return res.status(400).render("layout", { body: html });
    } catch (renderErr) {
      return res.status(400).send(err?.message || "Falha ao salvar");
    }
  }
});

// EDITAR CLIENTE
router.get("/:id/edit", ensureAdmin, async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).send("Cliente não encontrado");

    const html = await renderViewToString("clients/form.ejs", {
      client,
      action: `/clients/${client.id}?_method=PUT`,
    });

    res.render("layout", { body: html });
  } catch (err) {
    next(err);
  }
});

// ATUALIZAR CLIENTE
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

// EXIBIR CLIENTE
router.get("/:id", async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).send("Cliente não encontrado");
    res.render("clients/show", { client });
  } catch (err) {
    next(err);
  }
});

// EXCLUIR CLIENTE
router.delete("/:id", ensureAdmin, async (req, res, next) => {
  try {
    await Client.destroy({ where: { id: req.params.id } });
    res.redirect("/clients");
  } catch (err) {
    next(err);
  }
});

export default router;
