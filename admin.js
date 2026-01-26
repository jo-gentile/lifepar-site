
// 1. CONFIGURACIÓN GLOBAL
const firebaseConfig = {
    apiKey: "AIzaSyDOwn0QlyqdU3fDBEsPFuvPMzs4ylqMuQ8",
    authDomain: "web-lifepar.firebaseapp.com",
    databaseURL: "https://web-lifepar-default-rtdb.firebaseio.com",
    projectId: "web-lifepar",
    storageBucket: "web-lifepar.firebasestorage.app",
    messagingSenderId: "140850288146",
    appId: "1:140850288146:web:fe1d35bac4c30c39b3aacb"
};

// 2. INICIALIZACIÓN (Esto es lo que te faltaba)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// 3. GESTIÓN DE SESIÓN
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("✅ Sesión activa de:", user.email);
        
        // 1. Guardamos la llave para los hijos
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userName', user.displayName || "Entrenador");

        // 2. Actualizamos la interfaz
        const txtNombre = document.getElementById('display-name');
        const txtEmail = document.getElementById('display-email');
        
        if (txtNombre) txtNombre.innerText = user.displayName || "Entrenador";
        if (txtEmail) txtEmail.innerText = user.email;

    } else {
        window.location.href = "index.html";
    }
});

// Función de salida manual
function logout() {
    auth.signOut().then(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "index.html";
    });
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
    // Ocultar secciones que no son la vista dinámica
    const secciones = ['seguros', 'copa-federal'];
    secciones.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Mantener el contenedor de la vista dinámica visible
    const vista = document.getElementById('vista-dinamica');
    if (vista) {
        vista.style.display = 'flex'; // Siempre visible y con flex para centrar
        // NO borramos innerHTML aquí, lo hacemos en la función que carga el iframe
    }
}

function mostrarAccionesZona(numeroZona) {
    limpiarPantalla();
    const contenedor = document.getElementById('vista-dinamica');
    contenedor.innerHTML = `
        <iframe id="iframe-zona" src="acciones_zonas.html?zona=${numeroZona}" 
            style="width:100%; border:none;" scrolling="no"></iframe>
    `;
    
    const iframe = document.getElementById('iframe-zona');
    iframe.onload = () => {
        try {
            // Ajusta altura según contenido real
            iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
        } catch (e) {
            // Si es cross-origin no puede leer scrollHeight
            iframe.style.height = "2000px"; // fallback
        }
    };
}


// Mostrar clínica
window.mostrarClinica = function (idClinica) {
    limpiarPantalla();
    const vista = document.getElementById("vista-dinamica");
    if (!vista) return;

    vista.innerHTML = `
        <iframe id="iframe-clinica" src="clinicas.html?id=${idClinica}" 
            allowtransparency="true"
            style="width:100%; border:none; background:transparent;" scrolling="no">
        </iframe>
    `;

    // Esperamos 100ms para asegurar que el DOM procesó el innerHTML
    setTimeout(() => {
        const iframe = document.getElementById("iframe-clinica");
        if (iframe) {
            iframe.onload = () => {
                try {
                    if (iframe.contentWindow && iframe.contentWindow.document.body) {
                        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
                    }
                } catch(e) {
                    iframe.style.height = "1500px";
                }
            };
        }
    }, 100);

    vista.scrollIntoView({ behavior: 'smooth' });
};


// Mostrar seguros (oculta la vista dinámica)
function mostrarSeguros() {
    limpiarPantalla();
    const vista = document.getElementById('vista-dinamica');
    if (vista) vista.style.display = 'none';

    const box = document.getElementById('seguros');
    if (box) box.style.display = 'block';
}

// Mostrar copa federal (oculta la vista dinámica)
function mostrarCopa() {
    limpiarPantalla();
    const vista = document.getElementById('vista-dinamica');
    if (vista) vista.style.display = 'none';

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
function ajustarAlturaIframe(iframe) {
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
}

// Cada vez que cargues el iframe:
const iframe = document.querySelector('#vista-dinamica iframe');
iframe.onload = () => ajustarAlturaIframe(iframe);
function autoAjustarIframes() {
    document.querySelectorAll('#vista-dinamica iframe').forEach(iframe => {
        iframe.onload = () => iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
    });
}
window.guardarNuevoClub = async function() {
    const nombreClub = document.getElementById('nuevo-nombre-club').value.trim().toUpperCase();
    const userEmail = sessionStorage.getItem('userEmail');

    if (!nombreClub) return alert("⚠️ Ingresá el nombre del club.");
    if (!userEmail) return alert("⚠️ Sesión no detectada.");

    try {
        // Convertimos el mail a una llave válida para Firebase (sin puntos)
        const emailKey = userEmail.replace(/\./g, '_');
        
        // Estructura: CLUBES -> mail_usuario -> NOMBRE DEL CLUB: true
        // Usamos 'update' para no borrar los clubes que ya tenías guardados
        await window.parent.puenteFirebase('update', `CLUBES/${emailKey}`, {
            [nombreClub]: true
        });

        alert("✅ Club registrado correctamente.");
        
        // Limpiamos y cerramos
        document.getElementById('nuevo-nombre-club').value = "";
        window.cerrarModalClubes();
        
        // Opcional: Recargar el formulario para que el nuevo club aparezca en la lista
        if (typeof window.abrirFormularioCarga === 'function') {
            window.abrirFormularioCarga(window.zonaActivaNum);
        }
    } catch (error) {
        console.error("Error al guardar club:", error);
        alert("❌ No se pudo guardar el club. Revisá la conexión.");
    }
};


// Llamamos cada vez que agregamos un iframe
window.ajustarAlturaIframes = ajustarAlturaIframes;
window.toggleSidebar = toggleSidebar;
window.toggleArbol = toggleArbol;
window.mostrarCopa = mostrarCopa;
window.mostrarAccionesZona = mostrarAccionesZona;