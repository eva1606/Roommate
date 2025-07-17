const pool = require('../db');

exports.getAvailableProperties = async (req, res) => {
  console.log("🎯 Controller getAvailableProperties atteint");

  try {
    const result = await pool.query(`
      SELECT 
        id,
        address,
        price,
        rooms,
        photos[1] AS main_photo
      FROM properties
      WHERE status = 'available'
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Erreur SQL :', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
