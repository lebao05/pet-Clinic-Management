const { getConnection, sql } = require("../config/database");

async function query(text, params = {}) {
  const pool = await getConnection();
  const req = pool.request();
  for (const [k, v] of Object.entries(params)) {
    req.input(k, v);
  }
  const result = await req.query(text);
  return result.recordset;
}

async function transaction(work) {
  const pool = await getConnection();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const out = await work(tx);
    await tx.commit();
    return out;
  } catch (e) {
    try {
      await tx.rollback();
    } catch (_) {}
    throw e;
  }
}

function requestInTx(tx, params = {}) {
  const req = new sql.Request(tx);
  for (const [k, v] of Object.entries(params)) {
    req.input(k, v);
  }
  return req;
}

module.exports = { query, transaction, requestInTx };
