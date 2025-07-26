const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sha1.clusters.zeabur.com',
  port: 32694,
  user: 'root',
  password: 'D8k70AMrtb65G93gQVXfCu2aq4p1sozN',
  database: 'zeabur',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; 