require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { connectMongoDB } = require("./database");

const app = express();

// Aumentar el límite de tamaño del cuerpo
app.use(express.json({ limit: "20mb" })); // Aumentar el límite a 20 MB
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Configurar CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"], // Permitir múltiples orígenes
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    allowedHeaders: ["Content-Type"], // Encabezados permitidos
  })
);

// Integrar las rutas
app.use("/api", routes);

const PORT = process.env.PORT || 3000;

// Conectar a MongoDB y luego iniciar el servidor
connectMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  });

// Middleware para manejar errores globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});
