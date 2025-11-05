import express from "express";
import session from "express-session";
import pg from "pg";
import connectPg from "connect-pg-simple";
import dotenv from "dotenv";
import methodOverride from "method-override";
import sequelize from "./config/database.js";
import User from "./models/User.js";
import Client from "./models/Client.js";
import Vehicle from "./models/Vehicle.js";
import ServiceOrder from "./models/ServiceOrder.js";
import Log from "./models/Log.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { audit } from "./middleware/audit.js";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(audit);

const PgStore = connectPg(session);
app.use(session({
  store: new PgStore({
    pool: new pg.Pool({ connectionString: process.env.DATABASE_URL || undefined }),
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "devsecret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(authRoutes);
app.get("/", (req, res) => req.session.user ? res.render("home") : res.redirect("/login"));
app.use("/users", userRoutes);
app.use("/clients", clientRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/orders", orderRoutes);
app.use(adminRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  await sequelize.sync();
  const adminEmail = process.env.ADMIN_EMAIL || "admin@local";
  const admin = await User.findOne({ where: { email: adminEmail } });
  if (!admin) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      role: "admin",
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASS || "admin123", 10)
    });
    console.log("Admin criado:", adminEmail, "(senha:", process.env.ADMIN_PASS || "admin123", ")");
  }
  app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
})();
