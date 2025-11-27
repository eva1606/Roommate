const pool = require('../db');
const argon2 = require('argon2');

// =======================
// LOGIN USER
// =======================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    let isValid = false;
    const storedPassword = user.password || '';

    // Vérifie si le password ressemble à un hash Argon2
    const isArgonHash = storedPassword.startsWith('$argon2');

    if (isArgonHash) {
      // Utilisateur déjà migré (hashé Argon2)
      isValid = await argon2.verify(storedPassword, password);
    } else {
      // Ancien utilisateur : password en clair
      if (storedPassword === password) {
        isValid = true;

        // On le migre vers Argon2
        const newHash = await argon2.hash(password, {
          type: argon2.argon2id,
          timeCost: 3,
          memoryCost: 4096,
          parallelism: 1,
        });

        await pool.query(
          'UPDATE users SET password = $1 WHERE id = $2',
          [newHash, user.id]
        );
      } else {
        isValid = false;
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      id: user.id,
      first_name: user.first_name,
      role: user.role || 'owner',
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// =======================
// REGISTER USER
// =======================
const registerUser = async (req, res) => {
  const { first_name, last_name, email, password, phone, role } = req.body;

  const photo_url =
    req.file?.secure_url || req.file?.path || req.file?.url || null;

  try {
    const existing = await pool.query(
      'SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Hash Argon2 pour les nouveaux users
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 4096,
      parallelism: 1,
    });

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, email, photo_url, role`,
      [first_name, last_name, email, hashedPassword, phone, role, photo_url]
    );

    const newUser = result.rows[0];

    await pool.query(
      `INSERT INTO profil_users (user_id, first_name, last_name, email, photo_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET 
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          photo_url = EXCLUDED.photo_url`,
      [newUser.id, newUser.first_name, newUser.last_name, newUser.email, newUser.photo_url]
    );

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

// =======================
// EXPORTS
// =======================
module.exports = {
  loginUser,
  registerUser,
};
