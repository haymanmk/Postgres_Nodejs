let express = require('express');
let app = express();

app.use(express.static(__dirname + '/public'));

const { Pool, Client } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
    // user: 'postgres',
    // host: 'localhost',
    // database: 'mydb',
    // password: 's125060526',
    // port: 5432,
})

SQLQuery(pool, 'SELECT NOW()')
    .then((result) => console.log(result.rows[0].now))
    .catch((err) => console.log(err));

const createTable = 'CREATE TABLE IF NOT EXISTS public.Products (\
    PartNumber varchar(255) NOT NULL UNIQUE,\
    StorageLocation varchar(255),\
    Stock Int\
)';

const createOrder = 'CREATE TABLE IF NOT EXISTS public.Orders (\
    PartNumber varchar(255),\
    StorageLocation varchar(255),\
    Amount Int,\
    FOREIGN KEY (PartNumber)\
        REFERENCES Products (PartNumber)\
    )\
';

const insertProduct = "INSERT INTO Products\
    VALUES ('a1235', 'b1', 102);\
";

SQLQuery(pool, createTable)
    .then((result) => console.log(result.rows))
    .catch((err) => console.log(err));

SQLQuery(pool, createOrder)
    .then((result) => console.log(result.rows))
    .catch((err) => console.log(err));

SQLQuery(pool, insertProduct)
    .then((result) => console.log(result.rows))
    .catch((err) => console.log(err));

ReadTable(pool, 'Products')
    .then(result => {
        let buf = [];
        result.fields.forEach(element => {
            buf.push(element.name);
        });
        console.log(buf);

        if (result.rowCount > 0) {
            console.log(result.rows);
        }
    })
    .catch(err => console.log(err));

ReadTable(pool, 'Orders')
    .then(result => {
        let buf = [];
        result.fields.forEach(element => {
            buf.push(element.name);
        });
        console.log(buf);

        if (result.rowCount > 0) {
            console.log(result.rows);
        }
    })
    .catch(err => console.log(err));

function SQLQuery(pool, query) {
    return new Promise((resolve, reject) => {
        pool.connect((err, client, release) => {
            if (err) {
                console.error('Error acquiring client', err.stack);
                reject(err);
            }
            client.query(query, (err, result) => {
                release()
                if (err) {
                    console.error('Error executing query', err.stack);
                    reject(err);
                }
                resolve(result);
            })
        }
        )
    });
}

function ReadTable(pool, tableName) {
    const query = `\
        SELECT * FROM ${tableName}\
    `
    return SQLQuery(pool, query);
}

app.get(__dirname + '/', (req, res) => {
    res.send(__dirname + '/index.html');
});

let port = process.env.port || 5000;

app.listen(port, () => {
    console.log('listen at ' + port);
})