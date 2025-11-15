require('dotenv').config();
const sequelize = require('./db');

(async () => {
  try {
    const [rows] = await sequelize.query('SELECT @@VERSION AS version');
    console.log('🗄️ SQL Server version:', rows[0]?.version);
  } catch (e) {
    console.error('Query failed:', e.message);
  } finally {
    await sequelize.close();
  }
})();
