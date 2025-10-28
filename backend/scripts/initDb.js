const bcrypt = require('bcryptjs');
const db = require('../db/database');

async function initializeDatabase() {
  try {
    console.log('Initializing database with sample data...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');
    if (!adminExists) {
      const result = db.prepare(`
        INSERT INTO users (email, password, name, role)
        VALUES (?, ?, ?, ?)
      `).run('admin@example.com', hashedPassword, 'Admin User', 'admin');
      console.log('✓ Admin user created (email: admin@example.com, password: admin123)');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create sample regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const userExists = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
    if (!userExists) {
      db.prepare(`
        INSERT INTO users (email, password, name, role)
        VALUES (?, ?, ?, ?)
      `).run('user@example.com', userPassword, 'Regular User', 'user');
      console.log('✓ Sample user created (email: user@example.com, password: user123)');
    } else {
      console.log('✓ Sample user already exists');
    }

    console.log('\nDatabase initialization complete!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  User:  user@example.com / user123');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();

