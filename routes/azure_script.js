const sql = require('mssql');

const config = {
    user: 'sakthi', // better stored in an app setting such as process.env.DB_USER
    password: 'Lachu@123', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'sakthi-azure.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'sakthi-azure', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

console.log("Starting...");
connectAndQuery();

async function connectAndQuery() {
    try {
        var poolConnection = await sql.connect(config);

        console.log("Reading rows from the Table...");
        // var resultSet = await poolConnection.request().query(`SELECT TOP 20 pc.Name as CategoryName,
        //     p.name as ProductName 
        //     FROM [SalesLT].[ProductCategory] pc
        //     JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid`);

        // console.log(`${resultSet.recordset.length} rows returned.`);

        // // output column headers
        // var columns = "";
        // for (var column in resultSet.recordset.columns) {
        //     columns += column + ", ";
        // }
        // console.log("%s\t", columns.substring(0, columns.length - 2));

        // // output row contents from default record set
        // resultSet.recordset.forEach(row => {
        //     console.log("%s\t%s", row.CategoryName, row.ProductName);
        // });

        // close connection only when we're certain application is finished
        poolConnection.close();
        console.log('connection closed')
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = connectAndQuery;