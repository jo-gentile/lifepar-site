// --- 1. GESTIÓN DE SESIÓN Y USUARIO ---
const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail') || "Email no detectado";
const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || "Usuario";

if(document.getElementById('display-email')) document.getElementById('display-email').innerText = userEmail;
if(document.getElementById('display-name')) document.getElementById('display-name').innerText = userName;

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "index.html";
}

// --- 2. INTERFAZ Y NAVEGACIÓN ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    document.body.classList.toggle('layout-collapsed');
}

function toggleArbol(id) {
    const lista = document.getElementById(id);
    const flecha = document.getElementById('flecha-zonas'); // Solo si es el de zonas
    
    if (lista.style.display === "flex" || lista.style.display === "block") {
        lista.style.display = "none";
        if(flecha) flecha.style.transform = "rotate(0deg)";
    } else {
        lista.style.display = "flex";
        if(flecha) flecha.style.transform = "rotate(180deg)";
    }
}

// --- 3. CONTROLADORES DE CONTENIDO (VISTAS) ---

// Función Maestra para limpiar secciones fijas antes de mostrar un Iframe
function limpiarPantalla() {
    if (document.getElementById('seguros')) document.getElementById('seguros').style.display = 'none';
    if (document.getElementById('copa-federal')) document.getElementById('copa-federal').style.display = 'none';
    const vista = document.getElementById('vista-dinamica');
    if (vista) {
        vista.innerHTML = '';
        vista.style.display = 'block';
    }
}

function mostrarAccionesZona(numeroZona) {
    limpiarPantalla();
    const contenedor = document.getElementById('vista-dinamica');
    contenedor.innerHTML = `
        <iframe src="acciones_zonas.html?zona=${numeroZona}" 
            allowtransparency="true"
            style="width: 100%; min-height: 2000px; border: none; background: transparent; overflow: hidden;">
        </iframe>
    `;
    contenedor.scrollIntoView({ behavior: 'smooth' });
}

window.mostrarClinica = async function (idClinica) {
    limpiarPantalla();
    const vista = document.getElementById("vista-dinamica");
    vista.innerHTML = `
        <iframe src="clinicas.html?id=${idClinica}" 
            allowtransparency="true" 
            style="width: 100%; min-height: 1200px; border: none; background: transparent;">
        </iframe>
    `;
};

function mostrarSeguros() {
    limpiarPantalla();
    document.getElementById('vista-dinamica').style.display = 'none';
    const box = document.getElementById('seguros');
    if (box) box.style.display = 'block';
}

function mostrarCopa() {
    limpiarPantalla();
    document.getElementById('vista-dinamica').style.display = 'none';
    const box = document.getElementById('copa-federal');
    if (box) box.style.display = 'block';
}

// --- 4. EL PUENTE MAESTRO DE FIREBASE (El Corazón del Sistema) ---
// Esta función la llaman los HIJOS con: window.parent.puenteFirebase(...)
window.puenteFirebase = async (operacion, ruta, datos) => {
    const { getDatabase, ref, set, push, update, get } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
    const db = getDatabase();
    const dbRef = ref(db, ruta);

    switch(operacion) {
        case 'set': return await set(dbRef, datos);
        case 'push': return await push(dbRef, datos);
        case 'update': return await update(dbRef, datos);
        case 'get': return await get(dbRef);
        default: throw new Error("Operación no válida");
    }
};