const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Koneksi database
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// 🔹 Model User
const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
});

// 🔹 Model Absensi
const Attendance = sequelize.define("Attendance", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM("masuk", "keluar"), allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

// Relasi
User.hasMany(Attendance, { foreignKey: "userId" });
Attendance.belongsTo(User, { foreignKey: "userId" });

// =======================================================
// ✅ ROUTES
// =======================================================

// Tes API
app.get("/", (req, res) => {
  res.send("✅ API Absensi berjalan di Vercel");
});

// Tes koneksi database
app.get("/test-db", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send("✅ Database terkoneksi dengan baik");
  } catch (error) {
    res.status(500).send("❌ Database error: " + error.message);
  }
});

// Registrasi user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = await User.create({ name, email, password });
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, password } });
    if (!user) return res.status(401).json({ error: "Email atau password salah" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Absensi masuk
app.post("/absensi/masuk", async (req, res) => {
  try {
    const { userId } = req.body;
    const record = await Attendance.create({ userId, type: "masuk" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Absensi keluar
app.post("/absensi/keluar", async (req, res) => {
  try {
    const { userId } = req.body;
    const record = await Attendance.create({ userId, type: "keluar" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lihat semua absensi user
app.get("/absensi/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Attendance.findAll({ where: { userId } });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =======================================================
// Export untuk Vercel
// =======================================================
module.exports = app;
module.exports.handler = serverless(app);


