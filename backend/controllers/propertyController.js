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

    const { roommates } = req.body;

if (status === 'rented' && Array.isArray(roommates)) {
  for (const phone of roommates) {
    const userRes = await pool.query(
      `SELECT id FROM users WHERE phone = $1 LIMIT 1`,
      [phone]
    );

    if (userRes.rows.length > 0) {
      const roommateId = userRes.rows[0].id;

      await pool.query(
        `INSERT INTO roommates_properties (user_id, property_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`, // évite les doublons
         [roommateId, newPropertyId] 
      );
    }
  }
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
    // Supprimer les documents liés
    await pool.query('DELETE FROM documents WHERE receiver_property_id = $1', [id]);

    // Supprimer les colocataires liés
    await pool.query('DELETE FROM roommates_properties WHERE property_id = $1', [id]);

    // Supprimer de available_apartment
    await pool.query('DELETE FROM available_apartment WHERE property_id = $1', [id]);

    // Maintenant tu peux supprimer de properties
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
  const { roommates } = req.body;

if (status === 'rented' && Array.isArray(roommates)) {
  for (const phone of roommates) {
    const userRes = await pool.query(
      `SELECT id FROM users WHERE phone = $1 LIMIT 1`,
      [phone]
    );

    if (userRes.rows.length > 0) {
      const roommateId = userRes.rows[0].id;

      await pool.query(
        `INSERT INTO roommates_properties (user_id, property_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`, // évite les doublons
        [roommateId, id]
      );
    }
  }
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

const getAvailableProperties = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || user_id === "null" || isNaN(Number(user_id))) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM properties WHERE owner_id = $1 AND status = 'available'",
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ SQL ERROR in getAvailableProperties:", err);
    res.status(500).json({ error: "Error fetching available properties" });
  }
};

const getRentedProperties = async (req, res) => {
  const userId = req.params.ownerId; // ✅ corriger ici
  const month = req.query.month;

  try {
    let result;

    if (month) {
      result = await pool.query(
        `SELECT p.*, COUNT(DISTINCT rp.user_id) AS roommate_count,
                COALESCE(SUM(CASE WHEN pay.status = 'paid' AND pay.month = $2 THEN 1 ELSE 0 END), 0) AS paid_count
         FROM properties p
         JOIN roommates_properties rp ON p.id = rp.property_id
         LEFT JOIN payments pay ON pay.property_id = p.id AND pay.user_id = rp.user_id
         WHERE p.owner_id = $1 AND p.status = 'rented'
         GROUP BY p.id`,
        [userId, month]
      );
    } else {
      result = await pool.query(
        `SELECT p.*, COUNT(DISTINCT rp.user_id) AS roommate_count,
                COALESCE(SUM(CASE WHEN pay.status = 'paid' THEN 1 ELSE 0 END), 0) AS paid_count
         FROM properties p
         JOIN roommates_properties rp ON p.id = rp.property_id
         LEFT JOIN payments pay ON pay.property_id = p.id AND pay.user_id = rp.user_id
         WHERE p.owner_id = $1 AND p.status = 'rented'
         GROUP BY p.id`,
        [userId]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error in getRentedProperties:", err);
    res.status(500).json({ error: "Server error" });
  }
};




const uploadDocument = async (req, res) => {
  try {
    console.log("📥 Upload reçu :", req.file);
    console.log("🆔 Sender:", req.body.sender_id, "🏠 Property:", req.body.property_id);

    const { sender_id, property_id } = req.body;
    const file = req.file;

    if (!file || !sender_id || !property_id) {
      return res.status(400).json({ error: "Missing required fields or file" });
    }

    const result = await pool.query(
      `INSERT INTO documents (file_name, file_url, sender_id, receiver_property_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [file.originalname, file.path, sender_id, property_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error in uploadDocument:", err);
    res.status(500).json({ error: "Upload failed on server" });
  }
};


const getDocumentsForProperty = async (req, res) => {
  const { propertyId } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.id, d.file_name, d.file_url, d.sent_at, d.sender_id, u.first_name AS sender_name
       FROM documents d
       JOIN users u ON d.sender_id = u.id
       WHERE d.receiver_property_id = $1
       ORDER BY d.sent_at DESC`,
      [propertyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error in getDocumentsForProperty:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

const getRoommatesForProperty = async (req, res) => {
  const { propertyId } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.phone
      FROM roommates_properties rp
      JOIN users u ON u.id = rp.user_id
      WHERE rp.property_id = $1
    `, [propertyId]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching roommates:", error);
    res.status(500).json({ error: "Error fetching roommates" });
  }
};
const getOwnerPhoneByPropertyId = async (req, res) => {
  const { propertyId } = req.params;

  if (!propertyId || isNaN(Number(propertyId))) {
    return res.status(400).json({ error: "Invalid property ID" });
  }

  try {
    const result = await pool.query(`
      SELECT u.phone
      FROM properties p
      JOIN users u ON u.id = p.owner_id
      WHERE p.id = $1
      LIMIT 1
    `, [propertyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Owner not found for this property" });
    }

    res.json({ phone: result.rows[0].phone });
  } catch (err) {
    console.error("❌ Error in getOwnerPhoneByPropertyId:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getPaymentsForProperty = async (req, res) => {
  const { propertyId } = req.params;
  const month = req.query.month || 'July';

  try {
    const result = await pool.query(
      `SELECT 
         u.first_name || ' ' || u.last_name AS roommate_name,
         p.status,
         TO_CHAR(p.updated_at, 'Month DD, YYYY') AS date_paid
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.property_id = $1 AND p.month = $2`,
      [propertyId, month]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const addManualPayment = async (req, res) => {
  const { phone, month, property_id, date_paid } = req.body;

  if (!phone || !month || !property_id || !date_paid) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const userResult = await pool.query(
      `SELECT id, first_name, last_name FROM users WHERE phone = $1 LIMIT 1`,
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];
    // 🔁 S'assurer que le user est bien lié à la propriété
    await pool.query(
    `INSERT INTO roommates_properties (user_id, property_id)
    VALUES ($1, $2)
   ON CONFLICT DO NOTHING`,
    [user.id, property_id]
    );


    await pool.query(
      `INSERT INTO payments (user_id, property_id, month, status, updated_at)
       VALUES ($1, $2, $3, 'paid', $4)`,
      [user.id, property_id, month, date_paid]
    );

    res.status(201).json({
      roommate_name: `${user.first_name} ${user.last_name}`,
      status: "paid",
      date_paid: new Date(date_paid).toLocaleDateString()
    });
  } catch (err) {
    console.error("❌ Error in addManualPayment:", err);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports = {
  addProperty,
  getProperties,
  deleteProperty,
  getPropertyById,
  updateProperty,
  getPropertiesForRoommate,
  getAvailableProperties,
  getRentedProperties,
  uploadDocument,
  getDocumentsForProperty,
  getRoommatesForProperty,
  getOwnerPhoneByPropertyId,
  getPaymentsForProperty,
  addManualPayment
};
