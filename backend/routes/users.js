const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/leaderboard', authenticateToken, (req, res) => {
  try {
    const leaderboard = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.points,
        COUNT(DISTINCT v.id) as total_votes,
        COUNT(DISTINCT CASE WHEN m.resolution = v.vote THEN v.id END) as correct_votes,
        COUNT(DISTINCT ub.badge_id) as badge_count
      FROM users u
      LEFT JOIN votes v ON u.id = v.user_id
      LEFT JOIN markets m ON v.market_id = m.id
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      GROUP BY u.id
      ORDER BY u.points DESC, correct_votes DESC
      LIMIT 100
    `).all();

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user badges
router.get('/badges', authenticateToken, (req, res) => {
  try {
    const badges = db.prepare(`
      SELECT 
        b.*,
        ub.earned_at
      FROM badges b
      LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
      ORDER BY b.requirement_value ASC
    `).all(req.user.id);

    res.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

module.exports = router;

