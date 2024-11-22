
const { createPool }= require('mysql');

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "dreamwedsdb1",
    connectionLimit: 10
});

pool.query(`select * from registeration`, function(err, result, fields) {
    if (err) {
        return console.log(err);
    }
    return console.log(result);
})