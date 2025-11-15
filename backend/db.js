require('dotenv').config();
const { Sequelize } = require('sequelize');

// Build connection options with safer fallbacks & clearer diagnostics
const useInstance = !!process.env.DB_INSTANCE;
const effectivePort = useInstance ? undefined : (process.env.DB_PORT || 1433);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: effectivePort,
    dialect: 'mssql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
    dialectOptions: {
      options: {
        // If you hit TLS issues on older SQL Server versions, set encrypt to false
        encrypt: process.env.DB_ENCRYPT === 'false' ? false : true,
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE || undefined,
      },
    },
  }
);

console.log('🔎 DB connection config summary:', {
  db: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: effectivePort || '(instance dynamic)',
  instance: process.env.DB_INSTANCE || null,
  encrypt: process.env.DB_ENCRYPT === 'false' ? false : true,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connected to SQL Server successfully.');
  })
  .catch((err) => {
    console.error('❌ SQL Server connection error:', err.code || err.name, err.message);
    if (err?.original?.message) {
      console.error('Original:', err.original.message);
    }
    console.error('Troubleshooting tips: 1) Verify SQL Server service running. 2) If using SQLEXPRESS set DB_INSTANCE=SQLEXPRESS and remove DB_PORT. 3) Confirm TCP/IP enabled and port 1433 (or dynamic port) open. 4) Check firewall rules. 5) If older SQL Server, try setting DB_ENCRYPT=false.');
  });

module.exports = sequelize;
