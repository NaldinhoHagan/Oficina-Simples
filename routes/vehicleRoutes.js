import express from "express";
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import Vehicle from "../models/Vehicle.js";
import Client from "../models/Client.js";

const router = express.Router();
router.use(ensureAuth);

// Listar
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  const where = q ? { model: { [Vehicle.sequelize.Op.iLike]: `%${q}%` } } : undefined;
  const page = Math.max(parseInt(req.query.page || "1"), 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const { rows: vehicles, count } = await Vehicle.findAndCountAll({ where, include: Client, order: [["id","ASC"]], limit, offset });
  res.render("vehicles/list", { vehicles, pagination: { page, totalPages: Math.max(Math.ceil(count/limit),1) } });
});

router.get("/new", ensureAdmin, async (req, res) => {
  const clients = await Client.findAll();
  res.render("vehicles/form", { vehicle: {}, clients, action: "/vehicles" });
});

router.post("/", ensureAdmin, async (req, res) => {
  const { plate, model, year, clientId } = req.body;
  await Vehicle.create({ plate, model, year, ClientId: clientId });
  res.redirect("/vehicles");
});

router.get("/:id/edit", ensureAdmin, async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  const clients = await Client.findAll();
  res.render("vehicles/form", { vehicle, clients, action: `/vehicles/${vehicle.id}?_method=PUT` });
});

router.put("/:id", ensureAdmin, async (req, res) => {
  const { plate, model, year, clientId } = req.body;
  const vehicle = await Vehicle.findByPk(req.params.id);
  vehicle.plate = plate; vehicle.model = model; vehicle.year = year; vehicle.ClientId = clientId;
  await vehicle.save();
  res.redirect("/vehicles");
});

router.get("/:id", async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id, { include: Client });
  res.render("vehicles/show", { vehicle });
});

router.delete("/:id", ensureAdmin, async (req, res) => {
  await Vehicle.destroy({ where: { id: req.params.id } });
  res.redirect("/vehicles");
});

export default router;
