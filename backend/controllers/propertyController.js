const pool = require('../db');

const addProperty = async (req, res) => {
  try {
    const { address, rooms, price, status, owner_id } = req.body;

    // Cloudinary renvoie l'URL dans req.file.path
    const photo = req.file?.path || null;

    const result = await pool.query(
      `INSERT INTO properties (address, rooms, price, status, owner_id, photo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [address, rooms, price, status, owner_id, photo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error in addProperty:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProperties = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error in getProperties:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};
const deleteProperty = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("❌ Error in deleteProperty:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getPropertyById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error in getPropertyById:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProperty = async (req, res) => {
  const { id } = req.params;
  const { address, rooms, price, status } = req.body;

  try {
    const result = await pool.query(`
      UPDATE properties 
      SET address = $1, rooms = $2, price = $3, status = $4
      WHERE id = $5 RETURNING *
    `, [address, rooms, price, status, id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error in updateProperty:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

module.exports = {
  addProperty,
  getProperties,
  deleteProperty,
  getPropertyById,
  updateProperty
};
