// 连接mysql数据库
import mysql from 'mysql';
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   port: '3306',
//   database: 'hot'
// });
// connection.connect();

const pool = mysql.createPool({
  // host: 'localhost',
  host: '47.104.194.187',
  user: 'root',
  // password: 'root',
  password: 'Achenjinbang_15915155079',
  port: '3306',
  database: 'hot'
});

// 在数据池中进行会话操作
const myMysql = sql => {
  return new Promise(resolve => {
    pool.getConnection((err, connection) => {
      connection.query(sql, (err, result) => {
        if (err) throw err;

        resolve(result);

        // 结束会话
        connection.release();
      });
    });
  });
}

export default myMysql;