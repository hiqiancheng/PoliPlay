const db = require('../utils/db');

// 创建表（如未存在）
async function initTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS policy (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      background TEXT,
      createdAt DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS report (
      id VARCHAR(64) PRIMARY KEY,
      policyId VARCHAR(64) NOT NULL,
      title VARCHAR(255),
      summary TEXT,
      supportRate INT,
      opposeRate INT,
      tags TEXT,
      wordCloud TEXT,
      analysisHtml TEXT,
      comments TEXT,
      feishuDocUrl VARCHAR(500),
      feishuDocId VARCHAR(64),
      generatedAt DATETIME NOT NULL,
      FOREIGN KEY (policyId) REFERENCES policy(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// 保存政策
async function savePolicy(policy) {
  await db.query(
    'INSERT INTO policy (id, title, content, background, createdAt) VALUES (?, ?, ?, ?, ?)',
    [policy.id, policy.title, policy.content, policy.background ? JSON.stringify(policy.background) : null, policy.createdAt]
  );
}

// 保存报告
async function saveReport(report) {
  await db.query(
    'INSERT INTO report (id, policyId, title, summary, supportRate, opposeRate, tags, wordCloud, analysisHtml, comments, feishuDocUrl, feishuDocId, generatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      report.id,
      report.policyId,
      report.title,
      report.summary,
      report.supportRate,
      report.opposeRate,
      JSON.stringify(report.tags),
      JSON.stringify(report.wordCloud),
      report.analysisHtml,
      JSON.stringify(report.comments),
      report.feishuDocUrl || null,
      report.feishuDocId || null,
      report.generatedAt
    ]
  );
}

// 查询所有政策
async function getAllPolicies() {
  const [rows] = await db.query('SELECT * FROM policy ORDER BY createdAt DESC');
  return rows;
}

// 查询单个政策
async function getPolicyById(id) {
  const [rows] = await db.query('SELECT * FROM policy WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const policy = rows[0];
  return {
    ...policy,
    background: policy.background ? JSON.parse(policy.background) : []
  };
}

// 查询报告
async function getReportById(id) {
  const [rows] = await db.query('SELECT * FROM report WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    tags: JSON.parse(r.tags || '[]'),
    wordCloud: JSON.parse(r.wordCloud || '[]'),
    comments: JSON.parse(r.comments || '[]')
  };
}

// 查询某政策的报告
async function getReportByPolicyId(policyId) {
  const [rows] = await db.query('SELECT * FROM report WHERE policyId = ?', [policyId]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    tags: JSON.parse(r.tags || '[]'),
    wordCloud: JSON.parse(r.wordCloud || '[]'),
    comments: JSON.parse(r.comments || '[]')
  };
}

// 更新报告的飞书文档信息
async function updateReportFeishu(reportId, feishuDocUrl, feishuDocId) {
  await db.query(
    'UPDATE report SET feishuDocUrl = ?, feishuDocId = ? WHERE id = ?',
    [feishuDocUrl, feishuDocId, reportId]
  );
}

module.exports = {
  initTables,
  savePolicy,
  saveReport,
  getAllPolicies,
  getPolicyById,
  getReportById,
  getReportByPolicyId,
  updateReportFeishu
}; 