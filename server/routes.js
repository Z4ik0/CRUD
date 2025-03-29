const express = require("express");
const { mysqlConn, getMongoDB } = require("./database");
const { ObjectId } = require("mongodb");
const router = express.Router();

// 🔹 POST: Crear un usuario en la base seleccionada
router.post("/data", async (req, res) => {
  const { base, texto, password, image, date, largotext } = req.body;

  if (base === "mysql") {
    mysqlConn.query(
      "INSERT INTO data (mensaje, password, image, date, largotext) VALUES (?, ?, ?, ?, ?)",
      [texto, password, image, date, largotext],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usuario guardado en MySQL", id: result.insertId });
      }
    );
  } else if (base === "mongodb") {
    try {
      const collection = getMongoDB().collection("datos");
      const result = await collection.insertOne({
        texto,
        password,
        image,
        date,
        largotext,
      });
      res.json({ message: "Usuario guardado en MongoDB", id: result.insertedId });
    } catch (err) {
      console.error("Error al guardar datos en MongoDB:", err);
      res.status(500).json({ error: "Error al guardar datos en MongoDB" });
    }
  } else {
    res.status(400).json({ error: "Base de datos inválida" });
  }
});

// 🔹 GET: Obtener todos los usuarios
router.get("/data/:base", async (req, res) => {
  const { base } = req.params;

  if (base === "mysql") {
    mysqlConn.query("SELECT * FROM data", (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  } else if (base === "mongodb") {
    try {
      const collection = getMongoDB().collection("datos");
      const users = await collection.find().toArray();
      res.json(users);
    } catch (err) {
      console.error("Error al obtener datos de MongoDB:", err);
      res.status(500).json({ error: "Error al obtener datos de MongoDB" });
    }
  } else {
    res.status(400).json({ error: "Base de datos inválida" });
  }
});

// 🔹 PUT: Actualizar un usuario por ID
router.put("/data/:id", async (req, res) => {
  const { id } = req.params;
  const { texto, password, image, date, largotext, base } = req.body;

  if (base === "mysql") {
    mysqlConn.query(
      "UPDATE data SET mensaje=?, password=?, image=?, date=?, largotext=? WHERE id=?",
      [texto, password, image, date, largotext, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usuario actualizado en MySQL" });
      }
    );
  } else if (base === "mongodb") {
    try {
      const collection = getMongoDB().collection("datos");
      await collection.updateOne(
        { _id: new ObjectId(id) }, // Usar "new" para instanciar ObjectId
        { $set: { texto, password, image, date, largotext } }
      );
      res.json({ message: "Usuario actualizado en MongoDB" });
    } catch (err) {
      console.error("Error al actualizar datos en MongoDB:", err);
      res.status(500).json({ error: "Error al actualizar datos en MongoDB" });
    }
  } else {
    res.status(400).json({ error: "Base de datos inválida" });
  }
});

// 🔹 DELETE: Eliminar un usuario por ID
router.delete("/data/:id/:base", async (req, res) => {
  const { id, base } = req.params;

  if (base === "mysql") {
    mysqlConn.query("DELETE FROM data WHERE id=?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Usuario eliminado en MySQL" });
    });
  } else if (base === "mongodb") {
    try {
      const collection = getMongoDB().collection("datos");
      await collection.deleteOne({ _id: new ObjectId(id) }); // Usar "new" para instanciar ObjectId
      res.json({ message: "Usuario eliminado en MongoDB" });
    } catch (err) {
      console.error("Error al eliminar datos en MongoDB:", err);
      res.status(500).json({ error: "Error al eliminar datos en MongoDB" });
    }
  } else {
    res.status(400).json({ error: "Base de datos inválida" });
  }
});

module.exports = router;
