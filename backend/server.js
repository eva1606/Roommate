const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors()); 
app.use(express.json());

const userRoutes = require('./routes/users');
const propertiesRoutes = require('./routes/properties');
const profileRoutes = require('./routes/profilRoutes');
const potentialRoommatesRoutes = require('./routes/potentialRoomatesRoutes');

app.use('/api/potential-roommates', potentialRoommatesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/profil_users', profileRoutes);
// 🔓 Pour permettre l'accès aux photos uploadées
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5050;
const os = require("os");
console.log("✅ Hostname:", os.hostname());
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));