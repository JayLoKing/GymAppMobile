const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_BASE = '/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'gymapp_dev_secret';

// In-memory storage (simple)
let users = [];
let machines = [];
let ejercicios = [];
let usos = [];
let historial = [];

let nextUserId = 1;
let nextMachineId = 1;
let nextEjercicioId = 1;
let nextUsoId = 1;

// Helper: auth middleware
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Token requerido' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Token inválido' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// --- AUTH ---
app.post(`${API_BASE}/auth/register`, async (req, res) => {
  const { nombre, email, password, rol = 'usuario' } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email y password requeridos' });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email ya existe' });

  const hash = await bcrypt.hash(password, 8);
  const user = { id: nextUserId++, nombre: nombre || '', email, passwordHash: hash, rol };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});

app.post(`${API_BASE}/auth/login`, async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
  const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});

app.post(`${API_BASE}/auth/logout`, (req, res) => {
  // Stateless JWT: client simply discards token
  res.json({ ok: true });
});

app.get(`${API_BASE}/auth/profile`, authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol });
});

app.post(`${API_BASE}/auth/refresh-token`, (req, res) => {
  const { refreshToken } = req.body;
  // For simplicity, ignore refresh tokens and return error or new token if present
  res.status(501).json({ message: 'Refresh token no implementado en servidor de prueba' });
});

app.post(`${API_BASE}/auth/change-password`, authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Contraseña actual incorrecta' });
  user.passwordHash = await bcrypt.hash(newPassword, 8);
  res.json({ ok: true });
});

// --- USERS ---
app.post(`${API_BASE}/users/create`, async (req, res) => {
  const { nombre, email, password, rol = 'usuario' } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email y password requeridos' });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email ya existe' });
  const hash = await bcrypt.hash(password, 8);
  const user = { id: nextUserId++, nombre: nombre || '', email, passwordHash: hash, rol };
  users.push(user);
  res.json({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol });
});

app.get(`${API_BASE}/users/getAll`, (req, res) => {
  res.json(users.map(u => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol })));
});

app.get(`${API_BASE}/users/get/:id`, (req, res) => {
  const u = users.find(x => x.id === Number(req.params.id));
  if (!u) return res.status(404).json({ message: 'No encontrado' });
  res.json({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });
});

app.put(`${API_BASE}/users/update/:id`, (req, res) => {
  const u = users.find(x => x.id === Number(req.params.id));
  if (!u) return res.status(404).json({ message: 'No encontrado' });
  Object.assign(u, req.body);
  res.json({ ok: true });
});

app.delete(`${API_BASE}/users/delete/:id`, (req, res) => {
  users = users.filter(x => x.id !== Number(req.params.id));
  res.json({ ok: true });
});

app.get(`${API_BASE}/users/mis-usos`, authenticate, (req, res) => {
  const mis = usos.filter(u => u.usuario_id === req.user.id && !u.fecha_fin);
  res.json(mis);
});

app.get(`${API_BASE}/users/historial`, authenticate, (req, res) => {
  const his = historial.filter(h => h.usuario_id === req.user.id);
  res.json(his);
});

// --- MACHINES ---
app.post(`${API_BASE}/machines/create`, (req, res) => {
  const { nombre, descripcion = '', estado = 'disponible', ubicacion = '' } = req.body;
  const m = { id: nextMachineId++, nombre, descripcion, estado, ubicacion };
  machines.push(m);
  res.json(m);
});

app.get(`${API_BASE}/machines/getAll`, (req, res) => {
  res.json(machines);
});

app.get(`${API_BASE}/machines/get/:id`, (req, res) => {
  const m = machines.find(x => x.id === Number(req.params.id));
  if (!m) return res.status(404).json({ message: 'Máquina no encontrada' });
  res.json(m);
});

app.put(`${API_BASE}/machines/update/:id`, (req, res) => {
  const m = machines.find(x => x.id === Number(req.params.id));
  if (!m) return res.status(404).json({ message: 'Máquina no encontrada' });
  Object.assign(m, req.body);
  res.json(m);
});

app.delete(`${API_BASE}/machines/delete/:id`, (req, res) => {
  machines = machines.filter(x => x.id !== Number(req.params.id));
  res.json({ ok: true });
});

app.get(`${API_BASE}/machines/disponibles`, (req, res) => res.json(machines.filter(m => m.estado === 'disponible')));
app.get(`${API_BASE}/machines/en-uso`, (req, res) => res.json(machines.filter(m => m.estado === 'en_uso')));
app.get(`${API_BASE}/machines/mantenimiento`, (req, res) => res.json(machines.filter(m => m.estado === 'mantenimiento')));

app.put(`${API_BASE}/machines/cambiar-estado/:id`, (req, res) => {
  const m = machines.find(x => x.id === Number(req.params.id));
  if (!m) return res.status(404).json({ message: 'Máquina no encontrada' });
  const { estado } = req.body;
  m.estado = estado;
  res.json(m);
});

// --- EXERCISES ---
app.post(`${API_BASE}/exercises/create`, (req, res) => {
  const { nombre, descripcion = '', grupo_muscular = '', maquina_id } = req.body;
  const e = { id: nextEjercicioId++, nombre, descripcion, grupo_muscular, maquina_id };
  ejercicios.push(e);
  res.json(e);
});

app.get(`${API_BASE}/exercises/getAll`, (req, res) => res.json(ejercicios));
app.get(`${API_BASE}/exercises/get/:id`, (req, res) => {
  const e = ejercicios.find(x => x.id === Number(req.params.id));
  if (!e) return res.status(404).json({ message: 'No encontrado' });
  res.json(e);
});
app.put(`${API_BASE}/exercises/update/:id`, (req, res) => {
  const e = ejercicios.find(x => x.id === Number(req.params.id));
  if (!e) return res.status(404).json({ message: 'No encontrado' });
  Object.assign(e, req.body);
  res.json(e);
});
app.delete(`${API_BASE}/exercises/delete/:id`, (req, res) => {
  ejercicios = ejercicios.filter(x => x.id !== Number(req.params.id));
  res.json({ ok: true });
});
app.get(`${API_BASE}/exercises/por-maquina/:maquinaId`, (req, res) => {
  res.json(ejercicios.filter(e => e.maquina_id === Number(req.params.maquinaId)));
});

// --- STATISTICS ---
app.get(`${API_BASE}/statistics/summary`, (req, res) => {
  const total_maquinas = machines.length;
  const disponibles = machines.filter(m => m.estado === 'disponible').length;
  const en_uso = machines.filter(m => m.estado === 'en_uso').length;
  const mantenimiento = machines.filter(m => m.estado === 'mantenimiento').length;
  const usuarios_activos = new Set(usos.filter(u => !u.fecha_fin).map(u => u.usuario_id)).size;
  res.json({ total_maquinas, disponibles, en_uso, mantenimiento, usuarios_activos });
});

app.get(`${API_BASE}/statistics/machines-by-status`, (req, res) => {
  const grouped = machines.reduce((acc, m) => {
    acc[m.estado] = acc[m.estado] || [];
    acc[m.estado].push(m);
    return acc;
  }, {});
  res.json(grouped);
});

app.get(`${API_BASE}/statistics/report`, (req, res) => res.json({ machines, usos, usuarios: users.length }));
app.get(`${API_BASE}/statistics/usage-today`, (req, res) => res.json([]));
app.get(`${API_BASE}/statistics/most-used`, (req, res) => res.json([]));

// --- USOS ---
app.post(`${API_BASE}/usos/iniciar`, authenticate, (req, res) => {
  const { maquina_id } = req.body;
  const m = machines.find(x => x.id === Number(maquina_id));
  if (!m) return res.status(404).json({ message: 'Máquina no encontrada' });
  if (m.estado === 'en_uso') return res.status(400).json({ message: 'Máquina ya en uso' });
  m.estado = 'en_uso';
  const uso = { id: nextUsoId++, usuario_id: req.user.id, maquina_id: m.id, fecha_inicio: new Date().toISOString() };
  usos.push(uso);
  res.json(uso);
});

app.put(`${API_BASE}/usos/finalizar/:id`, authenticate, (req, res) => {
  const uso = usos.find(u => u.id === Number(req.params.id));
  if (!uso) return res.status(404).json({ message: 'Uso no encontrado' });
  if (uso.usuario_id !== req.user.id) return res.status(403).json({ message: 'No autorizado' });
  uso.fecha_fin = new Date().toISOString();
  // mover a historial
  historial.push(Object.assign({}, uso));
  // set machine disponible
  const m = machines.find(x => x.id === uso.maquina_id);
  if (m) m.estado = 'disponible';
  // remove from usos active
  usos = usos.filter(u => u.id !== uso.id);
  res.json({ ok: true });
});

app.get(`${API_BASE}/usos/activos`, (req, res) => res.json(usos));
app.get(`${API_BASE}/usos/mis-activos`, authenticate, (req, res) => res.json(usos.filter(u => u.usuario_id === req.user.id)));
app.get(`${API_BASE}/usos/historial`, authenticate, (req, res) => res.json(historial.filter(h => h.usuario_id === req.user.id)));
app.get(`${API_BASE}/usos/historial/:userId`, (req, res) => res.json(historial.filter(h => h.usuario_id === Number(req.params.userId))));
app.get(`${API_BASE}/usos/maquina/:maquinaId`, (req, res) => res.json(historial.filter(h => h.maquina_id === Number(req.params.maquinaId))));

// Seed some machines and a test user
async function seed() {
  machines.push({ id: nextMachineId++, nombre: 'Press banca', descripcion: '', estado: 'disponible', ubicacion: 'Sala 1' });
  machines.push({ id: nextMachineId++, nombre: 'Máquina cardio 1', descripcion: '', estado: 'disponible', ubicacion: 'Cardio' });
  const hash = await bcrypt.hash('123456', 8);
  users.push({ id: nextUserId++, nombre: 'Admin', email: 'admin@mail.com', passwordHash: hash, rol: 'admin' });
}

seed().then(() => {
  app.listen(PORT, () => console.log(`Backend listo en http://localhost:${PORT}${API_BASE}`));
});

module.exports = app;
