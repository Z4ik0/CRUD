document.addEventListener("DOMContentLoaded", () => {
  // Obtener usuarios al cargar la página
  const base = document.getElementById("dbtype").value;
  obtenerUsuarios(base);
});

// Seleccionar los botones
const btnMysql = document.getElementById("btn-mysql");
const btnMongodb = document.getElementById("btn-mongodb");

// Función para alternar estilos
function activarBoton(base) {
  if (base === "mysql") {
    btnMysql.classList.add("btn-primary");
    btnMysql.classList.remove("btn-secondary");
    btnMongodb.classList.add("btn-secondary");
    btnMongodb.classList.remove("btn-primary");
  } else if (base === "mongodb") {
    btnMongodb.classList.add("btn-primary");
    btnMongodb.classList.remove("btn-secondary");
    btnMysql.classList.add("btn-secondary");
    btnMysql.classList.remove("btn-primary");
  }
}

// Agregar eventos a los botones
btnMysql.addEventListener("click", () => {
  activarBoton("mysql");
  obtenerUsuarios("mysql"); // Llamar a la función para obtener registros de MySQL
});

btnMongodb.addEventListener("click", () => {
  activarBoton("mongodb");
  obtenerUsuarios("mongodb"); // Llamar a la función para obtener registros de MongoDB
});

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
    Swal.fire({
      icon: "warning",
      title: "Imagen requerida",
      text: "Por favor selecciona una imagen.",
    });
    return;
  }

  // Validar el tipo de archivo
  const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];
  if (!tiposPermitidos.includes(archivoImagen.type)) {
    Swal.fire({
      icon: "error",
      title: "Formato no válido",
      text: "El formato de la imagen no es válido. Solo se permiten JPG, PNG y GIF.",
    });
    return;
  }

  const lector = new FileReader();
  lector.readAsDataURL(archivoImagen);

  lector.onloadend = async function () {
    const info_imagen = lector.result;

    try {
      const response = await fetch("http://localhost:3000/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, texto, password, image: info_imagen, date, largotext }),
      });

      const result = await response.json();

      Swal.fire({
        icon: "success",
        title: "Registro guardado",
        text: result.message,
        timer: 3000,
        timerProgressBar: true,
      });

      // Actualizar la tabla después de guardar
      obtenerUsuarios(base);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar los datos.",
      });
      console.error(error);
    }
  };
});

function formatearFecha(fecha) {
  if (!fecha) return ""; // Manejar fechas nulas o indefinidas

  const date = new Date(fecha); // Convertir la fecha a un objeto Date
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
  const anio = date.getFullYear();

  return `${anio}-${mes}-${dia}`; // Formato DD-MM-YYYY
}

async function obtenerUsuarios(base) {
  try {
    const response = await fetch(`http://localhost:3000/api/data/${base}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const datos = await response.json();

    const tabla = document.getElementById("tabla-datos");
    tabla.innerHTML = ""; // Limpiar la tabla antes de insertar nuevos datos

    datos.forEach((dato, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
          <td>${index + 1}</td>
          <td>${base === "mongodb" ? dato.texto : dato.mensaje}</td>
          <td>${dato.password}</td>
          <td><img src="${dato.image}" alt="Imagen" width="50"></td>
          <td>${formatearFecha(dato.date)}</td>
          <td class="Comentario">${dato.largotext}</td>
          <td><button type="button" class="btn btn-success btn-edit" data-id="${dato._id}" data-base="${base}"><i class="bi bi-pencil-square"></i></button></td>
          <td><button type="button" class="btn btn-danger btn-delete" data-id="${base === "mongodb" ? dato._id : dato.id}" data-base="${base}"><i class="bi bi-trash-fill"></i></button></td>
        `;
      tabla.appendChild(fila);

      fila.querySelector(".btn-edit").addEventListener("click", () => abrirModalEditar({ ...dato, base }));
    });

    document.querySelectorAll(".btn-delete").forEach((button) => {
      button.addEventListener("click", (e) => eliminarRegistro(e.target.closest("button").dataset));
    });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
  }
}

function abrirModalEditar(dato) {
  // Cargar los datos en el modal
  document.getElementById("edit-texto").value = dato.texto || dato.mensaje; // MongoDB usa "texto", MySQL usa "mensaje"
  document.getElementById("edit-password").value = dato.password;
  document.getElementById("edit-date").value = formatearFecha(dato.date); // Formatear la fecha para el input
  document.getElementById("edit-long-text").value = dato.largotext;
  document.getElementById("edit-id").value = dato._id || dato.id; // MongoDB usa "_id", MySQL usa "id"
  document.getElementById("edit-base").value = dato.base;

  // Mostrar la base de datos actual en el selector
  document.getElementById("edit-dbtype").value = dato.base;

  // Mostrar la imagen existente
  const imagePreview = document.getElementById("edit-image-preview");
  imagePreview.src = dato.image || ""; // Mostrar la imagen existente o dejar vacío si no hay

  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

document.getElementById("save-edit").addEventListener("click", async () => {
  const id = document.getElementById("edit-id").value;
  const base = document.getElementById("edit-base").value; // Base de datos actual
  const newBase = document.getElementById("edit-dbtype").value; // Nueva base de datos seleccionada
  const texto = document.getElementById("edit-texto").value;
  const password = document.getElementById("edit-password").value;
  const date = document.getElementById("edit-date").value;
  const largotext = document.getElementById("edit-long-text").value;

  const imageInput = document.getElementById("edit-image");
  const imagePreview = document.getElementById("edit-image-preview");
  let image = imagePreview.src; // Usar la imagen existente por defecto

  // Si se seleccionó una nueva imagen, leerla
  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.onloadend = async function () {
      image = reader.result;

      // Verificar si la base de datos cambió
      if (base === newBase) {
        // Si no cambió, ejecutar PUT
        await actualizarRegistro({ id, base, texto, password, date, largotext, image });
      } else {
        // Si cambió, ejecutar DELETE y luego POST
        await cambiarBaseDeDatos({ id, base, newBase, texto, password, date, largotext, image });
      }
    };
    reader.readAsDataURL(file);
  } else {
    // Verificar si la base de datos cambió
    if (base === newBase) {
      // Si no cambió, ejecutar PUT
      await actualizarRegistro({ id, base, texto, password, date, largotext, image });
    } else {
      // Si cambió, ejecutar DELETE y luego POST
      await cambiarBaseDeDatos({ id, base, newBase, texto, password, date, largotext, image });
    }
  }
});

async function actualizarRegistro(data) {
  try {
    const response = await fetch(`http://localhost:3000/api/data/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    alert(result.message);

    // Actualizar la tabla después de editar
    obtenerUsuarios(data.base);

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
    modal.hide();
  } catch (error) {
    console.error("Error al actualizar el registro:", error);
  }
}

async function cambiarBaseDeDatos(data) {
  try {
    // Eliminar el registro de la base de datos actual
    await fetch(`http://localhost:3000/api/data/${data.id}/${data.base}`, {
      method: "DELETE",
    });

    // Crear un nuevo registro en la nueva base de datos
    const response = await fetch("http://localhost:3000/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base: data.newBase,
        texto: data.texto,
        password: data.password,
        image: data.image,
        date: data.date,
        largotext: data.largotext,
      }),
    });

    const result = await response.json();
    Swal.fire({
      icon: "success",
      title: "Base de datos cambiada",
      text: result.message,
    });

    // Actualizar la tabla después de cambiar la base de datos
    obtenerUsuarios(data.newBase);

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
    modal.hide();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cambiar la base de datos.",
    });
    console.error("Error al cambiar la base de datos:", error);
  }
}

async function guardarCambios(data) {
  try {
    const response = await fetch(`http://localhost:3000/api/data/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    Swal.fire({
      icon: "success",
      title: "Guardado",
      text: result.message,
    });

    // Actualizar la tabla después de editar
    obtenerUsuarios(data.base);

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
    modal.hide();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo guardar el registro.",
    });
    console.error("Error al guardar los cambios:", error);
  }
}

async function eliminarRegistro({ id, base }) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esta acción.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:3000/api/data/${id}/${base}`, {
        method: "DELETE",
      });

      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: result.message,
      });

      // Actualizar la tabla después de eliminar
      obtenerUsuarios(base);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el registro.",
      });
      console.error("Error al eliminar el registro:", error);
    }
  }
}

function validarArchivo(input) {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];
  const archivo = input.files[0]; // Obtener el archivo seleccionado

  if (archivo && !tiposPermitidos.includes(archivo.type)) {
    Swal.fire({
      icon: "error",
      title: "Archivo no válido",
      text: "Solo se permiten imágenes en formato JPG, PNG o GIF.",
    });
    input.value = ""; // Limpiar el campo si el archivo no es válido
  }
}

// Agregar el evento onchange al campo de archivo
document.getElementById("image").addEventListener("change", function () {
  validarArchivo(this);
});

document.getElementById("edit-image").addEventListener("change", function () {
  validarArchivo(this);
});
