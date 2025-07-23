const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

const userRoutes = require('./routes/users');
const propertiesRoutes = require('./routes/properties');
const profileRoutes = require('./routes/profilRoutes');
const { getCompatibleRoommates } = require('../controllers/potentialRoomatesController');

router.get('/:id', getCompatibleRoommates); 
app.use('/api/users', userRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/profil_users', profileRoutes);



const PORT = process.env.PORT || 5050;
const os = require("os");
console.log("✅ Hostname:", os.hostname());
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));