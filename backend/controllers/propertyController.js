const pool = require('../db');

const addProperty = async (req, res) => {
  try {
    const {
      address, rooms, price, status,
      owner_id, floor, has_elevator,
      has_balcony, furnished, description
    } = req.body;

    const photo = req.files?.photo?.[0]?.path || null;
    const photos = req.files?.photos?.map(file => file.path) || [];

    // ✅ 1. Insertion dans la table properties
    const result = await pool.query(
      `INSERT INTO properties (
        address, rooms, price, status, owner_id,
        floor, has_elevator, has_balcony, furnished,
        description, photo, photos
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        address,
        rooms,
        price,
        status,
        owner_id,
        floor,
        has_elevator === 'on',
        has_balcony === 'on',
        furnished === 'on',
        description,
        photo,
        photos
      ]
    );

    const newPropertyId = result.rows[0].id;

    // ✅ 2. Ajouter tous les colocataires à cette propriété
    const roommatesResult = await pool.query(
      `SELECT id FROM users WHERE role = 'roommate'`
    );

    for (const roommate of roommatesResult.rows) {
      await pool.query(
        `INSERT INTO roommates_properties (user_id, property_id) VALUES ($1, $2)`,
        [roommate.id, newPropertyId]
      );
    }

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
  const {
    address,
    rooms,
    price,
    status,
    floor,
    has_elevator,
    has_balcony,
    furnished,
    description
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE properties 
       SET address = $1,
           rooms = $2,
           price = $3,
           status = $4,
           floor = $5,
           has_elevator = $6,
           has_balcony = $7,
           furnished = $8,
           description = $9
       WHERE id = $10
       RETURNING *`,
      [
        address,
        rooms,
        price,
        status,
        floor,
        has_elevator,
        has_balcony,
        furnished,
        description,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error in updateProperty:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

const getPropertiesForRoommate = async (req, res) => {
  const userId = req.body.user_id;

  if (!userId) {
    return res.status(400).json({ error: "Missing user_id in request body" });
  }

  try {
    const result = await pool.query(
      `SELECT 
        p.id AS property_id,
        p.address,
        (
          SELECT COUNT(*) 
          FROM roommates_properties 
          WHERE property_id = p.id
        ) AS roommate_count,
        COALESCE((
          SELECT status 
          FROM payments 
          WHERE user_id = $1 
            AND property_id = p.id 
            AND LOWER(month) = 'june'
          LIMIT 1
        ), 'unpaid') AS payment_status
      FROM properties p
      JOIN roommates_properties rp ON rp.property_id = p.id
      WHERE rp.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error in getPropertiesForRoommate:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addProperty,
  getProperties,
  deleteProperty,
  getPropertyById,
  updateProperty,
  getPropertiesForRoommate
};
