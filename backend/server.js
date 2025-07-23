const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

const userRoutes = require('./routes/users');
const propertiesRoutes = require('./routes/properties');
const profilRoutes = require('./routes/profilRoutes');
// IMPORTATION DE TA ROUTE
const potentialRoomatesRoutes = require('./routes/potentialRoomatesRoutes');

// UTILISATION
app.use('/api/potential-roommates', potentialRoomatesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/profil_users', profilRoutes);



const PORT = process.env.PORT || 5050;
const os = require("os");
console.log("✅ Hostname:", os.hostname());
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));