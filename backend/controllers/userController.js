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
  const photo_url = req.file?.path || null; // récupère le lien Cloudinary

  try {
    const existing = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, role`,
      [first_name, last_name, email, password, phone, role, photo_url]
    );

    const user = result.rows[0];
    res.status(201).json(user);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};


module.exports = {
  loginUser,
  registerUser
};


