let clinicaActiva = "";

window.initClinica = async function (idClinica) {
  clinicaActiva = idClinica;

  document.getElementById("titulo-clinica").innerText =
    "Inscripción: " + idClinica.replace(/-/g, " ");

  await cargarClubes();
  construirTabla();

  document
    .getElementById("btn-enviar-clinica")
    .addEventListener("click", enviarClinica);
};
async function cargarClubes() {
  const select = document.getElementById("select-club-clinica");
  select.innerHTML = '<option value="">Seleccioná un club...</option>';

  const mail = sessionStorage.getItem("userEmail");
  if (!mail) return;

  const clubes = await window.obtenerClubesFirebase(
    mail.replace(/\./g, "_")
  );

  if (!clubes) return;

  Object.keys(clubes).forEach(id => {
    const op = document.createElement("option");
    op.value = id;
    op.textContent = clubes[id].nombre;
    select.appendChild(op);
  });
}

function construirTabla() {
  const tbody = document.getElementById("body-tabla-clinica");
  tbody.innerHTML = "";

  for (let i = 1; i <= 20; i++) {
    tbody.innerHTML += `
      <tr>
        <td>${i}</td>
        <td><input class="nombre"></td>
        <td><input class="categoria"></td>
        <td><input type="number" class="edad"></td>
      </tr>
    `;
  }
}

async function enviarClinica() {
  const club = document.getElementById("select-club-clinica").value;
  if (!club) return alert("Seleccioná un club");

  const filas = document.querySelectorAll("#body-tabla-clinica tr");
  const lista = [];

  filas.forEach(f => {
    const nombre = f.querySelector(".nombre").value.trim();
    if (nombre) {
      lista.push({
        nombre,
        categoria: f.querySelector(".categoria").value,
        edad: f.querySelector(".edad").value
      });
    }
  });

  if (!lista.length) return alert("Sin patinadores");

  await window.guardarInscripcionClinicaFirebase(
    clinicaActiva,
    club,
    lista
  );

  alert("Inscripción enviada");
  construirTabla();
}
