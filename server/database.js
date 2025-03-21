require("dotenv").config();
const mysql = require("mysql");
const { MongoClient } = require("mongodb");

// Configurar conexión a MySQL
const mysqlConn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

mysqlConn.connect(err => {
  if (err) console.error("Error conectando a MySQL:", err);
  else console.log("🔥 Conectado a MySQL");
});

// Configurar conexión a MongoDB
const mongoClient = new MongoClient(process.env.MONGO_URI);
let mongoDB;

mongoClient.connect().then(client => {
  mongoDB = client.db(process.env.MONGO_DATABASE);
  console.log("🚀 Conectado a MongoDB");
});

module.exports = { mysqlConn, mongoDB };
