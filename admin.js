
// Buscamos en Session y en Local por las dudas
let userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail') || "Email no detectado";
let userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || "Usuario";

// Los imprimimos
if(document.getElementById('display-email')) {
    document.getElementById('display-email').innerText = userEmail;
}

if(document.getElementById('display-name')) {
    document.getElementById('display-name').innerText = userName;
}
// 1. Salir de la oficina
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// 2. Barra lateral elástica
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');

    document.body.classList.toggle('layout-collapsed'); // ← ESTA ES LA CLAVE
}


// 3. Abrir/Cerrar el árbol de Zonas
function toggleArbol(id) {
    const lista = document.getElementById(id);
    const flecha = document.getElementById('flecha-zonas');
    
    // Si está cerrado, lo ponemos en flex, si está abierto lo ocultamos
    if (lista.style.display === "flex") {
        lista.style.display = "none";
        if(flecha) flecha.style.transform = "rotate(0deg)";
    } else {
        lista.style.display = "flex";
        if(flecha) flecha.style.transform = "rotate(180deg)";
    }
}

function mostrarAccionesZona(numeroZona) {
    const contenedor = document.getElementById('contenedor-acciones-zonas');
    if (contenedor) {
        // 1. Limpiamos cualquier cosa previa y mostramos
        contenedor.innerHTML = ''; 
        contenedor.style.display = 'block';

        // 2. Cargamos el nuevo sistema de iframe
         contenedor.innerHTML = `
         <iframe src="acciones_zonas.html?zona=${numeroZona}" 
            scrolling="no" 
            style="width: 100%; min-height: 2000px; border: none; background: transparent; overflow: hidden;">
          </iframe>
       `;

        // 3. Ocultamos Seguros y Copa para que no se pisen
        if (document.getElementById('seguros')) document.getElementById('seguros').style.display = 'none';
        if (document.getElementById('copa-federal')) document.getElementById('copa-federal').style.display = 'none';

        contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

function mostrarSeguros() {
    // 1. Vaciamos y ocultamos el contenedor de zonas
    const contenedorZonas = document.getElementById('contenedor-acciones-zonas');
    if (contenedorZonas) {
        contenedorZonas.innerHTML = ''; // Limpiamos el iframe
        contenedorZonas.style.display = 'none';
    }
    
    // 2. Ocultamos Copa Federal
    if (document.getElementById('copa-federal')) document.getElementById('copa-federal').style.display = 'none';

    // 3. Mostramos Seguros
    const boxSeguros = document.getElementById('seguros');
    if (boxSeguros) {
        boxSeguros.style.display = 'block';
    }
}

function mostrarCopa() {
    // 1. Vaciamos y ocultamos el contenedor de zonas
    const contenedorZonas = document.getElementById('contenedor-acciones-zonas');
    if (contenedorZonas) {
        contenedorZonas.innerHTML = ''; // Limpiamos el iframe
        contenedorZonas.style.display = 'none';
    }

    // 2. Ocultamos Seguros
    if (document.getElementById('seguros')) document.getElementById('seguros').style.display = 'none';

    // 3. Mostramos la Copa Federal
    const boxCopa = document.getElementById('copa-federal');
    if (boxCopa) {
        boxCopa.style.display = 'block';
    }
}
// --- FUNCIONES PARA EL MODAL DE CLUBES (Deben estar en el Rey) ---
function abrirModalClub() {
    const modal = document.getElementById("ModalClub");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function cerrarModalClub() {
    const modal = document.getElementById("ModalClub");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}
window.mostrarClinica = function(idClinica) {
  const vista = document.getElementById("vista-dinamica");

  vista.innerHTML = "Cargando clínica...";

  fetch("clinicas.html")
    .then(res => res.text())
    .then(html => {
      vista.innerHTML = html;

      // ahora sí inicializamos la lógica
      initClinica(idClinica);
    })
    .catch(err => {
      vista.innerHTML = "Error al cargar la clínica";
      console.error(err);
    });
};
