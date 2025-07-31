const { initDatabase } = require('./database');
async function initializeDatabase() {
  try {
    console.log('Initializing Mythos database...');
    
    await initDatabase();
    
    console.log('Database initialization completed successfully!');
    console.log('Database file: mythos.db');
    console.log('You can now start the server with: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}
initializeDatabase(); 