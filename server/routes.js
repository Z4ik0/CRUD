const express = require("express");
const { mysqlConn, mongoDB } = require("./database");
const router = express.Router();

// 🔹 POST: Crear un usuario en la base seleccionada
router.post("/data", async (req, res) => {
  const { base, texto, password, image, date, largotext } = req.body;

  if (base == "mysql") {
    mysqlConn.query(
      "INSERT INTO data (text, password, image, date, largotext) VALUES (?, ?, ?, ?, ?)",
      [texto, password, image, date, largotext],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usuario guardado en MySQL", id: result.insertId });
      }
    );
  } else if (base == "mongodb") {
    const collection = mongoDB.collection("data");
    const result = await collection.insertOne({
      texto,
      password,
      image,
      date,
      largotext,
    });
    res.json({ message: "Usuario guardado en MongoDB", id: result.insertedId });
  } else {
    res.status(400).json({ error: "Base de datos inválida" });
  }
});

// 🔹 GET: Obtener todos los usuarios
router.get("/data/:base", async (req, res) => {
  const { base } = req.params;

  if (base == "mysql") {
    mysqlConn.query("SELECT * FROM usuarios", (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  } else if (base == "mongodb") {
    const collection = mongoDB.collection("data");
    const users = await collection.find().toArray();
    res.json(users);
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
      "UPDATE data SET text=?, password=?, image=?, date=?, largotext=? WHERE id=?",
      [texto, password, image, date, largotext, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usuario actualizado en MySQL" });
      }
    );
  } else if (base === "mongodb") {
    const collection = mongoDB.collection("data");
    await collection.updateOne(
      { _id: id },
      { $set: { texto, password, image, date, largotext } }
    );
    res.json({ message: "Usuario actualizado en MongoDB" });
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
    const collection = mongoDB.collection("data");
    await collection.deleteOne({ _id: id });
    res.json({ message: "Usuario eliminado en MongoDB" });
  } else {
    res.status(400).json({ error: "Base de datos inválida" });
  }
});

module.exports = router;
