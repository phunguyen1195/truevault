const db = require('../db/database');

const closeExpiredMarkets = () => {
  try {
    const result = db.prepare(`
      UPDATE markets 
      SET status = 'closed' 
      WHERE status = 'open' 
      AND datetime(close_time) <= datetime('now')
    `).run();

    if (result.changes > 0) {
      console.log(`Closed ${result.changes} expired market(s)`);
    }
  } catch (error) {
    console.error('Error closing expired markets:', error);
  }
};

module.exports = {
  closeExpiredMarkets
};

