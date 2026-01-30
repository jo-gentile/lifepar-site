
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
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    auth.useEmulator("http://127.0.0.1:9099");
    console.log("Conectado al emulador local de Lifepar");
}
let chequeoInicial = true;
// 3. GESTIÓN DE SESIÓN
// 1. Variable para evitar el rebote inmediato
let cargandoSesion = true;

auth.onAuthStateChanged((user) => {
    const mailLocal = sessionStorage.getItem('userEmail');

    if (user) {
        // ✅ Caso 1: Firebase confirmó al usuario
        cargandoSesion = false;
        console.log("✅ Sesión confirmada:", user.email);
        
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userName', user.displayName || "Entrenador");

        const txtNombre = document.getElementById('display-name');
        const txtEmail = document.getElementById('display-email');
        if (txtNombre) txtNombre.innerText = user.displayName || "Entrenador";
        if (txtEmail) txtEmail.innerText = user.email;

        activarHuella(); 
        
    } else {
        // ⏳ Caso 2: No hay usuario en Firebase todavía
        // Si existe un mail en sessionStorage, es porque venís de poner la huella
        if (mailLocal && cargandoSesion) {
            console.log("⏳ Esperando validación de Firebase...");
            
            // Damos 3 segundos de cortesía antes de patear al usuario
            setTimeout(() => {
                if (!auth.currentUser) {
                    console.log("🚫 Tiempo de espera agotado, al inicio.");
                    window.location.href = "index.html";
                }
            }, 3000);

            cargandoSesion = false; // Evitamos que el timeout se cree mil veces
        } else {
            // Caso 3: No hay usuario ni rastro de sesión local, afuera.
            window.location.href = "index.html";
        }
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

    setTimeout(() => {
        const iframe = document.getElementById("iframe-clinica");
        if (iframe) {
            iframe.onload = () => {
                try {
                    // 1. Ajuste de altura (Usá el nombre de función que tengas, con o sin S)
                    if (iframe.contentWindow && iframe.contentWindow.document.body) {
                        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
                    }

                    // 2. ORDEN DE ARRANQUE (Esto es lo que te faltaba)
                    if (iframe.contentWindow && iframe.contentWindow.initClinica) {
                        iframe.contentWindow.initClinica(idClinica);
                    }
                } catch(e) {
                    console.error("Error en comunicación con iframe:", e);
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
// 1. La función de ajuste (se queda igual pero con una protección extra)
function ajustarAlturaIframes(iframe) {
    try {
        if (iframe && iframe.contentWindow && iframe.contentWindow.document.body) {
            iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
        }
    } catch (e) {
        iframe.style.height = "1500px"; // Fallback si hay error de carga
    }
}

// 2. Función segura para usar desde cualquier lado
function autoAjustarIframes() {
    const iframes = document.querySelectorAll('#vista-dinamica iframe');
    if (iframes.length > 0) {
        iframes.forEach(iframe => {
            iframe.onload = () => ajustarAlturaIframe(iframe);
        });
    }
}

// IMPORTANTE: No dejes líneas sueltas con querySelector al inicio del archivo.
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
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');

    // Solo aplicamos el clic de expansión si la pantalla es chica
    sidebar.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-expanded');
        }
    });

    // Opcional: Cerrar el sidebar si tocás fuera de él (en la zona derecha)
    document.querySelector('.zona-derecha').addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-expanded');
        }
    });
});
// Manejo de clics en móviles
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            // Si tiene submenú, prevenimos que se cierre el sidebar y toggleamos el submenú
            const submenu = item.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu-lista')) {
                e.stopPropagation(); // Evita que el clic llegue al sidebar y lo cierre
                item.classList.toggle('active');
            }
        }
    });
});
/* ... todo tu código actual de admin.js ... */
async function activarHuella() {
    if (!window.PublicKeyCredential) return;
    
    const email = sessionStorage.getItem('userEmail');
    if (!email) return;

    // Si ya está registrada en este navegador, no molestar al usuario
    if (localStorage.getItem('credencial_biometrica')) return;

    if (confirm("¿Desea activar el acceso mediante datos biométricos (Huella/PIN) en este dispositivo?")) {
        try {
            const options = {
                publicKey: {
                    challenge: crypto.getRandomValues(new Uint8Array(32)),
                    rp: { name: "Lifepar" },
                    user: { 
                        id: Uint8Array.from(email, c => c.charCodeAt(0)), 
                        name: email, 
                        displayName: "Entrenador" 
                    },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    authenticatorSelection: { authenticatorAttachment: "platform" },
                    timeout: 60000
                }
            };

            const credential = await navigator.credentials.create(options);
            
            if (credential) {
                const emailKey = email.replace(/\./g, '_');
                
                // Usamos la variable 'db' que ya tenés inicializada
                db.ref(`listaBlanca/${emailKey}`).update({ huellaID: credential.id })
                    .then(() => console.log("Huella sincronizada con base de datos."))
                    .catch(() => console.log("Guardado solo localmente."));

                localStorage.setItem('mailVinculado', email);
                localStorage.setItem('credencial_biometrica', credential.id); 
                
                alert("✅ Acceso biométrico configurado correctamente.");
            }
        } catch (err) { 
            console.error("Error o registro cancelado:", err); 
        }
    }
}

// Llamamos cada vez que agregamos un iframe
window.ajustarAlturaIframes = ajustarAlturaIframes;
window.toggleSidebar = toggleSidebar;
window.toggleArbol = toggleArbol;
window.mostrarCopa = mostrarCopa;
window.mostrarAccionesZona = mostrarAccionesZona;