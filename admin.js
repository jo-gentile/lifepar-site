  // CONFIGURACIÓN GLOBAL
const firebaseConfig = {
    apiKey: "AIzaSyDOwn0QlyqdU3fDBEsPFuvPMzs4ylqMuQ8",
    authDomain: "web-lifepar.firebaseapp.com",
    databaseURL: "https://web-lifepar-default-rtdb.firebaseio.com",
    projectId: "web-lifepar",
    storageBucket: "web-lifepar.firebasestorage.app",
    messagingSenderId: "140850288146",
    appId: "1:140850288146:web:fe1d35bac4c30c39b3aacb"
};

// Inicialización versión Compat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// GESTIÓN DE SESIÓN RE REAL
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("✅ Sesión confirmada:", user.email);
        if(document.getElementById('display-email')) document.getElementById('display-email').innerText = user.email;
        if(document.getElementById('display-name')) document.getElementById('display-name').innerText = user.displayName || "Entrenador";
    } else {
        window.location.href = "index.html";
    }
});
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

window.puenteFirebase = async (operacion, ruta, datos) => {
    const dbRef = firebase.database().ref(ruta);
    try {
        console.log(`Ejecutando ${operacion} en: ${ruta}`);
        switch(operacion) {
            case 'set': return await dbRef.set(datos);
            case 'push': return await dbRef.push(datos);
            case 'update': return await dbRef.update(datos);
            case 'get': return await dbRef.once('value');
            default: throw new Error("Operación no válida");
        }
    } catch (error) {
        console.error("Error en el Puente:", error);
        throw error;
    }
};

window.toggleSidebar = toggleSidebar;
window.toggleArbol = toggleArbol;
window.mostrarCopa = mostrarCopa;
window.mostrarAccionesZona = mostrarAccionesZona;