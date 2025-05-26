const zonas = document.querySelectorAll('.zona-card');
const detalles = document.querySelectorAll('.detalle-zona');

zonas.forEach((zona, index) => {
  zona.addEventListener('click', () => {
    const id = `#detalle-zona${index + 1}`;
    const detalleActual = document.querySelector(id);

    // Si ya está visible, la ocultamos
    if (!detalleActual.classList.contains('oculto')) {
      detalleActual.classList.add('oculto');
      detalleActual.classList.remove('efecto-zona');
      return;
    }

    // Ocultamos todas primero
    detalles.forEach(det => {
      det.classList.add('oculto');
      det.classList.remove('efecto-zona');
    });

    // Mostramos solo la seleccionada y le agregamos la animación
    detalleActual.classList.remove('oculto');
    detalleActual.classList.add('efecto-zona');
  });
});

// --- LOGIN POR EMAIL DESDE GOOGLE SHEETS ---
const API_URL = "https://script.google.com/macros/s/AKfycbypTVFkumXv_Opv9E6SL3lXdDS2nn-bqNW3qp8ho86LJ07vLzMIw5ITUPu1aylXPStgw/exec";

function mostrarLogin() {
  const form = document.getElementById("loginForm");
  form.style.display = form.style.display === "block" ? "none" : "block";
}

async function verificarEmail() {
  const email = document.getElementById("emailInput").value.trim().toLowerCase();

  try {
    const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (data.autorizado) {
      window.location.href = "admin.html";
    } else {
      alert("Email no autorizado");
    }
  } catch (error) {
    console.error("Error consultando la API", error);
    alert("Error al verificar. Intentalo más tarde.");
  }
}

// Habilita ENTER para enviar
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("emailInput");
  if (emailInput) {
    emailInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        verificarEmail();
      }
    });
  }
});

