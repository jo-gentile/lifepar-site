window.verZona = function(numero) {
    // 1. Buscamos el DESTINO (El cuadro de cristal que el usuario VE)
    // Usamos el ID 'panel-cristal' para que sea exacto
    const contenedorCentro = document.getElementById('panel-cristal');
    
    // 2. Buscamos el ORIGEN (La info que está guardada en el 'deposito-detalles')
    const infoABuscar = document.getElementById('detalle-zona' + numero);
    
    if (contenedorCentro && infoABuscar) {
        // 3. Vaciamos el centro (borramos el mensaje de "Seleccioná una opción")
        contenedorCentro.innerHTML = ''; 

        // 4. Clonamos la info del depósito
        const clon = infoABuscar.cloneNode(true);
        
        // 5. Nos aseguramos que sea visible al llegar al centro
        clon.style.display = 'flex'; 
        clon.classList.remove('oculto'); // Por si tiene la clase que lo esconde
        
        // 6. ¡Metemos la info en el cristal!
        contenedorCentro.appendChild(clon);
        
        console.log("Éxito: Se cargó la info de la Zona " + numero);
    } else {
        // Esto te avisa en la consola si te olvidaste de poner un ID
        if(!contenedorCentro) console.error("Error: No encontré el ID 'panel-cristal'");
        if(!infoABuscar) console.error("Error: No encontré el ID 'detalle-zona" + numero + "'");
    }
}
// --- LOGIN POR EMAIL DESDE GOOGLE SHEETS ---
const API_URL = "https://script.google.com/macros/s/AKfycbxCT2fQW1h7vE02ai2BpGqfQ_PTAhCP8H4StFjL-zne5tlKovf1vdWo7EWguwjodmJkqA/exec";

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
      sessionStorage.setItem("emailAutenticado", email);
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
function abrirVistaFiltrada(baseUrl) {
  const email = sessionStorage.getItem("emailAutenticado");
  if (!email) {
    alert("No se encontró el email del usuario");
    return;
  }
  const finalUrl = `${baseUrl}?email=${encodeURIComponent(email)}`;
  window.open(finalUrl, "_blank");
}
function abrirSeccion(seccion) {
  // Escondemos todo lo que haya en el centro
  document.querySelectorAll('.detalle-zona').forEach(det => {
    det.classList.remove('visible');
  });
  
  // Aquí después crearemos los divs para 'fechas', 'fotos', etc.
  console.log("Abriendo sección: " + seccion);
  document.getElementById('mensaje-guia').innerHTML = "<h3>Cargando " + seccion.toUpperCase() + "...</h3>";
}
const btn = document.getElementById('toggle-bg');
btn.addEventListener('click', () => {
    document.body.classList.toggle('no-background');
    // Guardamos la preferencia para que si recarga la página, se mantenga
    const estado = document.body.classList.contains('no-background');
    localStorage.setItem('fondo-desactivado', estado);
});