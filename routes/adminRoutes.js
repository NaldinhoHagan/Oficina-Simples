import express from "express";
import { ensureAuth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import Client from "../models/Client.js";
import Vehicle from "../models/Vehicle.js";
import ServiceOrder from "../models/ServiceOrder.js";
import User from "../models/User.js";
import Log from "../models/Log.js";
import bcrypt from "bcrypt";

const router = express.Router();
router.use(ensureAuth, ensureAdmin);

// Seed demo
router.post("/admin/seed", async (req, res) => {
  const c1 = await Client.create({ name: "Maria Silva", phone: "85999990000", email: "maria@exemplo.com" });
  const c2 = await Client.create({ name: "João Costa", phone: "85988887777", email: "joao@exemplo.com" });
  const v1 = await Vehicle.create({ plate: "ABC-1234", model: "Onix", year: 2019, ClientId: c1.id });
  const v2 = await Vehicle.create({ plate: "XYZ-9876", model: "HB20", year: 2021, ClientId: c2.id });
  await ServiceOrder.create({ description: "Troca de óleo", status: "concluida", cost: 120.00, VehicleId: v1.id });
  await ServiceOrder.create({ description: "Alinhamento e balanceamento", status: "em_andamento", cost: 200.00, VehicleId: v2.id });
  await User.create({ name: "Usuário Demo", email: "demo@local", role: "user", passwordHash: await bcrypt.hash("demo123", 10) });
  res.send("Seed criada com sucesso. Demo: demo@local / demo123");
});

router.get("/admin/logs", async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1"), 1);
  const limit = 20;
  const offset = (page - 1) * limit;
  const { rows, count } = await Log.findAndCountAll({ order: [["id","DESC"]], limit, offset });
  const totalPages = Math.max(Math.ceil(count/limit), 1);
  const nav = `<nav><ul class="pagination">${Array.from({length: totalPages}, (_,i)=>{
    const p=i+1; return `<li class="page-item ${p===page?"active":""}"><a class="page-link" href="/admin/logs?page=${p}">${p}</a></li>`
  }).join("")}</ul></nav>`;
  res.send(`
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <div class="container py-4">
      <h3>Logs (${count})</h3>
      ${nav}
      <table class="table table-sm"><thead><tr><th>ID</th><th>User</th><th>Método</th><th>Rota</th><th>Ação</th></tr></thead><tbody>
        ${rows.map(l=>`<tr><td>${l.id}</td><td>${l.userId??"-"}</td><td>${l.method}</td><td>${l.route}</td><td>${l.action||"-"}</td></tr>`).join("")}
      </tbody></table>
      ${nav}
    </div>
  `);
});

export default router;
