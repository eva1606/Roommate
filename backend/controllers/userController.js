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

module.exports = { loginUser };
