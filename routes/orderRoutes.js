import express from "express";
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import ServiceOrder from "../models/ServiceOrder.js";
import Vehicle from "../models/Vehicle.js";
import Client from "../models/Client.js";

const router = express.Router();
router.use(ensureAuth);

// Listar
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  const where = q ? { description: { [ServiceOrder.sequelize.Op.iLike]: `%${q}%` } } : undefined;
  const page = Math.max(parseInt(req.query.page || "1"), 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const { rows: orders, count } = await ServiceOrder.findAndCountAll({
    where, include: { model: Vehicle, include: Client }, order: [["id","ASC"]], limit, offset
  });
  res.render("orders/list", { orders, pagination: { page, totalPages: Math.max(Math.ceil(count/limit),1) } });
});

router.get("/new", ensureAdmin, async (req, res) => {
  const vehicles = await Vehicle.findAll({ include: Client });
  res.render("orders/form", { order: {}, vehicles, action: "/orders" });
});

router.post("/", ensureAdmin, async (req, res) => {
  const { description, status, cost, vehicleId } = req.body;
  await ServiceOrder.create({ description, status, cost, VehicleId: vehicleId });
  res.redirect("/orders");
});

router.get("/:id/edit", ensureAdmin, async (req, res) => {
  const order = await ServiceOrder.findByPk(req.params.id);
  const vehicles = await Vehicle.findAll({ include: Client });
  res.render("orders/form", { order, vehicles, action: `/orders/${order.id}?_method=PUT` });
});

router.put("/:id", ensureAdmin, async (req, res) => {
  const { description, status, cost, vehicleId } = req.body;
  const order = await ServiceOrder.findByPk(req.params.id);
  order.description = description; order.status = status; order.cost = cost; order.VehicleId = vehicleId;
  await order.save();
  res.redirect("/orders");
});

router.get("/:id", async (req, res) => {
  const order = await ServiceOrder.findByPk(req.params.id, { include: { model: Vehicle, include: Client } });
  res.render("orders/show", { order });
});

router.delete("/:id", ensureAdmin, async (req, res) => {
  await ServiceOrder.destroy({ where: { id: req.params.id } });
  res.redirect("/orders");
});

export default router;
