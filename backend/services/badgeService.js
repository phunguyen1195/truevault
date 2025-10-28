const db = require('../db/database');

const checkAndAwardBadges = (userId) => {
  try {
    // Get user stats
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT v.id) as total_votes,
        COUNT(DISTINCT CASE WHEN m.resolution = v.vote THEN v.id END) as correct_votes,
        u.points
      FROM users u
      LEFT JOIN votes v ON u.id = v.user_id
      LEFT JOIN markets m ON v.market_id = m.id AND m.status = 'resolved'
      WHERE u.id = ?
      GROUP BY u.id
    `).get(userId);

    if (!stats) return;

    // Get all badges
    const badges = db.prepare('SELECT * FROM badges').all();

    // Check each badge
    badges.forEach(badge => {
      // Check if user already has this badge
      const hasBadge = db.prepare(
        'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?'
      ).get(userId, badge.id);

      if (hasBadge) return;

      let shouldAward = false;

      switch (badge.requirement_type) {
        case 'votes':
          shouldAward = stats.total_votes >= badge.requirement_value;
          break;
        case 'correct':
          shouldAward = stats.correct_votes >= badge.requirement_value;
          break;
        case 'points':
          shouldAward = stats.points >= badge.requirement_value;
          break;
        case 'streak':
          // Check for winning streak
          const recentVotes = db.prepare(`
            SELECT 
              CASE WHEN m.resolution = v.vote THEN 1 ELSE 0 END as is_correct
            FROM votes v
            JOIN markets m ON v.market_id = m.id
            WHERE v.user_id = ? AND m.status = 'resolved'
            ORDER BY m.resolved_at DESC
            LIMIT ?
          `).all(userId, badge.requirement_value);

          if (recentVotes.length >= badge.requirement_value) {
            shouldAward = recentVotes.every(v => v.is_correct === 1);
          }
          break;
      }

      if (shouldAward) {
        db.prepare(
          'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)'
        ).run(userId, badge.id);
        console.log(`Awarded badge "${badge.name}" to user ${userId}`);
      }
    });
  } catch (error) {
    console.error('Error checking badges:', error);
  }
};

module.exports = {
  checkAndAwardBadges
};

