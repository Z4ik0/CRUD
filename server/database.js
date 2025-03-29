require("dotenv").config();
const mysql = require("mysql");

// Configurar conexión a MySQL
const mysqlConn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

mysqlConn.connect((err) => {
  if (err) {
    console.error("Error conectando a MySQL:", err);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  } else {
    console.log("🔥 Conectado a MySQL");
  }
});

mysqlConn.on("error", (err) => {
  console.error("Error en la conexión MySQL:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    // Reconectar automáticamente si la conexión se pierde
    mysqlConn.connect((err) => {
      if (err) {
        console.error("Error reconectando a MySQL:", err);
      } else {
        console.log("🔥 Reconectado a MySQL");
      }
    });
  } else {
    throw err;
  }
});

const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGO_URI);

let mongoDB;

async function connectMongoDB() {
  try {
    const client = await mongoClient.connect();
    mongoDB = client.db(process.env.MONGO_DATABASE);
    console.log("🚀 Conectado a MongoDB");
  } catch (err) {
    console.error("Error conectando a MongoDB:", err);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  }
}

function getMongoDB() {
  if (!mongoDB) {
    throw new Error("MongoDB no está conectado. Llama a connectMongoDB primero.");
  }
  return mongoDB;
}

module.exports = { mysqlConn, connectMongoDB, getMongoDB };
