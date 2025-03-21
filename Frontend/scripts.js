document.addEventListener("DOMContentLoaded", obtenerUsuarios);

document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const base = document.getElementById("dbtype").value;
  const texto = document.getElementById("texto").value;
  const password = document.getElementById("password").value;
  const date = document.getElementById("date").value;
  const largotext = document.getElementById("long-text").value;

  const imagenInput = document.getElementById("image");
  const archivoImagen = imagenInput.files[0];

  if (!archivoImagen) {
    alert("Por favor selecciona una imagen.");
    return;
  }

  const lector = new FileReader();
  lector.readAsDataURL(archivoImagen);

  lector.onloadend = async function () {
    const info_imagen = lector.result;

    try {
      const response = await fetch("http://localhost:3000/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, texto, password, image: info_imagen, date, largotext }),
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert("Error al enviar los datos");
      console.error(error);
    }
  };
});


async function obtenerUsuarios() {
  try {
    const response = await fetch("http://localhost:3000/data"+${base});
    const datos = await response.json();

    const tabla = document.getElementById("tablaUsuarios");
    tabla.innerHTML = ""; // Limpiar la tabla antes de insertar nuevos datos

    datos.forEach((dato) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
          <td>${dato.text}</td>
          <td>${dato.password}</td>
          <td>${dato.image}</td>
          <td>${dato.date}</td>
          <td>${dato.longtext}</td>
          <td><button type="button" class="btn btn-succes"><i class="bi bi-pencil-square"></i></button></td>
          <td><button type="button" class="btn btn-danger"><i class="bi bi-trash-fill"></i></button></td>
        `;
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
  }
}
