const pool = require('../db');
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      id: user.id,
      first_name: user.first_name,
      role: user.role || 'owner' 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
const registerUser = async (req, res) => {
  const { first_name, last_name, email, password, phone, role } = req.body;

  // ✅ Récupération de l'URL de la photo uploadée
  const photo_url =
    req.file?.secure_url || req.file?.path || req.file?.url || null;

  try {
    // 🔹 Vérifier si l'email existe déjà
    const existing = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // 🔹 Créer le nouvel utilisateur
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, email, photo_url, role`,
      [first_name, last_name, email, password, phone, role, photo_url]
    );

    const newUser = result.rows[0];

    // 🔹 Copier automatiquement les infos et la photo dans profil_users
    await pool.query(
      `INSERT INTO profil_users (user_id, first_name, last_name, email, photo_url)
       SELECT u.id, u.first_name, u.last_name, u.email, u.photo_url
       FROM users u
       LEFT JOIN profil_users p ON p.user_id = u.id
       WHERE u.id = $1 AND p.user_id IS NULL`,
      [newUser.id]
    );

    // ✅ Réponse envoyée
    res.status(201).json({
      id: newUser.id,
      first_name: newUser.first_name,
      role: newUser.role,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};
module.exports = {
  loginUser,
  registerUser
};


