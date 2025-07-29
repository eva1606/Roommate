// controllers/myRoommateController.js
const db = require("../db");


exports.getMyRoommateProperty = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Trouver la propriété liée à l'utilisateur
    const propResult = await db.query(`
      SELECT p.*
      FROM properties p
      JOIN roommates_properties rp ON p.id = rp.property_id
      WHERE rp.user_id = $1
      LIMIT 1
    `, [userId]);

    const property = propResult.rows[0];

    if (!property) {
      return res.json({ property: null, roommates: [], documents: [] });
    }

    // Récupérer les colocataires liés à cette propriété
    const roomies = await db.query(`
    SELECT 
    u.id, 
    u.first_name, 
    u.last_name, 
    u.email, 
    p.photo_url
  FROM roommates_properties rp
  JOIN users u ON u.id = rp.user_id
  JOIN profil_users p ON p.user_id = u.id
  WHERE rp.property_id = $1  
    `, [property.id]);

    // Récupérer les documents liés à cette propriété
    const docs = await db.query(`
      SELECT file_name, file_url
      FROM documents
      WHERE receiver_property_id = $1
    `, [property.id]);

    res.json({
      property,
      roommates: roomies.rows,
      documents: docs.rows,
    });
  } catch (err) {
    console.error("❌ getMyRoommateProperty error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.uploadDocument = async (req, res) => {
  const { user_id } = req.body;
  const file = req.file;

  if (!file || !file.path) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  try {
    // Récupérer la propriété liée à cet utilisateur
    const result = await db.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune propriété trouvée." });
    }

    const receiverPropertyId = result.rows[0].property_id;

  await db.query(
      `INSERT INTO documents (file_name, file_url, receiver_property_id, sender_id)
       VALUES ($1, $2, $3, $4)`,
      [file.originalname, file.path, receiverPropertyId, user_id]
    );
    


    res.status(201).json({ message: "📄 Document enregistré avec succès." });
  } catch (err) {
    console.error("❌ Upload document error:", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du document." });
  }
};
