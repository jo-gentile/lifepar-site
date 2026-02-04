
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
    db.useEmulator("127.0.0.1", 9000);
    console.log("Conectado al emulador local de Lifepar (Auth y DB)");
}

// === PUENTE PARA IFRAMES (VITAL PARA COMUNICACIÓN HIJO->PADRE) ===
window.puenteFirebase = function(accion, ruta, datos) {
    // console.log(`[PUENTE] ${accion.toUpperCase()} -> ${ruta}`, datos); // Logger opcional
    const referencia = db.ref(ruta);

    if (accion === 'get') {
        return referencia.once('value');
    } else if (accion === 'update') {
        return referencia.update(datos);
    } else if (accion === 'set') {
        return referencia.set(datos);
    } else if (accion === 'push') {
        return referencia.push(datos);
    } else if (accion === 'remove') {
        return referencia.remove();
    } else {
        return Promise.reject("Acción no válida en puenteFirebase");
    }
};

let chequeoInicial = true;
// Admin configuration
const ADMIN_EMAIL = 'jose.gen86@gmail.com';
let isAdmin = false;
// When admin edits another profile, guardamos la clave del email objetivo
let currentEditEmailKey = null;
// 3. GESTIÓN DE SESIÓN
// 1. Variable para evitar el rebote inmediato
let cargandoSesion = true;

let validandoBiometria = true;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById('display-name').innerText =
        user.displayName || "Entrenador";
    document.getElementById('display-email').innerText =
        user.email;

    // Detect admin
    isAdmin = (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    window.isAdmin = isAdmin;

    if (isAdmin) {
        // Añadir botón rápido de Admin al header si no existe
        try {
            const navList = document.querySelector('.header-admin nav ul');
            if (navList && !document.getElementById('btn-admin-panel')) {
                const li = document.createElement('li');
                const btn = document.createElement('button');
                btn.id = 'btn-admin-panel';
                btn.className = 'btn-pildora-nav';
                btn.textContent = 'ADMIN';
                btn.onclick = () => {
                    if (typeof window.mostrarProfesores === 'function') window.mostrarProfesores();
                };
                li.appendChild(btn);
                navList.insertBefore(li, navList.firstChild);
            }
        } catch (e) {
            console.warn('No se pudo renderizar botón admin:', e);
        }
    }
});


// Función de salida: cierra la sesión de Firebase
function logout() {
    firebase.auth().signOut().then(() => {
        sessionStorage.clear(); // opcional, no molesta
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

    // 1. Limpiamos el contenedor
    vista.innerHTML = '';

    // 2. Creamos el iframe con DOM API para controlar el evento load
    const iframe = document.createElement('iframe');
    iframe.id = "iframe-clinica";
    iframe.src = `clinicas.html?id=${idClinica}`;
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.background = "transparent";
    iframe.scrolling = "no";
    iframe.setAttribute("allowtransparency", "true");

    // 3. Asignamos el onload ANTES de agregarlo al DOM
    iframe.onload = () => {
        try {
            console.log("✅ Iframe Clínica Cargado");
            
            // Ajuste de altura
            if (iframe.contentWindow && iframe.contentWindow.document.body) {
                iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
            }

            // Iniciamos la lógica interna
            if (iframe.contentWindow && iframe.contentWindow.initClinica) {
                iframe.contentWindow.initClinica(idClinica);
            } else {
                console.error("❌ No se encontró la función initClinica en el iframe");
            }
        } catch(e) {
            console.error("Error en comunicación con iframe:", e);
            iframe.style.height = "1500px";
        }
    };

    // 4. Lo agregamos al DOM
    vista.appendChild(iframe);

    // Scroll suave
    vista.scrollIntoView({ behavior: 'smooth' });
};


// Mostrar copa federal (oculta la vista dinámica)
function mostrarCopa() {
    limpiarPantalla();
    const vista = document.getElementById('vista-dinamica');
    if (vista) vista.style.display = 'none';

    const box = document.getElementById('copa-federal');
    if (box) box.style.display = 'block';
}

/* Duplicate puenteFirebase removed */
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

// ADMIN: Mostrar lista de profesores y permitir edición (solo admin)
window.mostrarProfesores = async function() {
    if (!isAdmin) return alert('Acceso denegado: rol administrador requerido.');
    try {
        const snap = await window.puenteFirebase('get', 'PROFESORES');
        const data = (snap && snap.val) ? snap.val() : (snap && snap.val && snap.val()) || (snap && snap.exists && snap.exists() ? snap.val() : null);
        // Manejo compatible con DataSnapshot devuelto por .once('value')
        let profesores = data;
        if (!profesores && snap && typeof snap.val === 'function') profesores = snap.val();

        const cont = document.getElementById('vista-dinamica');
        cont.style.display = 'block';
        cont.innerHTML = '<h3 style="color:#ffd700;">Listado de Profesores</h3>';

        if (!profesores) {
            cont.innerHTML += '<p>No hay profesores registrados.</p>';
            return;
        }

        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '8px';

        Object.keys(profesores).forEach(key => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.padding = '8px';
            item.style.border = '1px solid rgba(255,255,255,0.05)';
            item.style.borderRadius = '8px';
            const left = document.createElement('div');
            left.innerHTML = `<strong>${profesores[key].nombre || key}</strong><br><small>${profesores[key].email || ''}</small>`;
            const btns = document.createElement('div');
            const editar = document.createElement('button');
            editar.textContent = 'Editar';
            editar.className = 'btn-pildora-nav';
            editar.onclick = () => abrirPerfilUsuario(key);
            btns.appendChild(editar);
            item.appendChild(left);
            item.appendChild(btns);
            list.appendChild(item);
        });

        cont.appendChild(list);

    } catch (e) {
        console.error('Error cargando profesores:', e);
        alert('No se pudo cargar la lista de profesores. Revisá la consola.');
    }
};

// ADMIN: Abrir modal de perfil para cualquier usuario por emailKey
window.abrirPerfilUsuario = async function(emailKey) {
    if (!isAdmin) return alert('Acceso denegado');
    try {
        // Intentamos leer en USUARIOS primero, luego PROFESORES como fallback
        const snapU = await window.puenteFirebase('get', `USUARIOS/${emailKey}/perfil`);
        let datos = snapU && snapU.val ? snapU.val() : (snapU && snapU.exists && snapU.exists() ? snapU.val() : null);
        if (!datos) {
            const snapP = await window.puenteFirebase('get', `PROFESORES/${emailKey}`);
            datos = snapP && snapP.val ? snapP.val() : (snapP && snapP.exists && snapP.exists() ? snapP.val() : null);
        }

        // Abrir modal y rellenar
        document.getElementById('modal-perfil').style.display = 'flex';
        document.getElementById('perf-nombre').value = datos && datos.nombre ? datos.nombre : '';
        document.getElementById('perf-email').value = datos && datos.email ? datos.email : emailKey.replace(/_/g, '.');
        document.getElementById('perf-email-sec').value = datos && datos.emailSec ? datos.emailSec : '';
        document.getElementById('perf-whatsapp').value = datos && datos.whatsapp ? datos.whatsapp : '';
        document.getElementById('perf-cumple').value = datos && datos.cumple ? datos.cumple : '';

        // Marcar zonas si vienen
        if (datos && datos.zonas) {
            document.querySelectorAll('input[name="z-perfil"]').forEach(ch => ch.checked = !!datos.zonas[ch.value]);
        }

        // Cargar CLUBES del usuario objetivo
        try {
            const snapC = await window.puenteFirebase('get', `CLUBES/${emailKey}`);
            const clubesData = snapC && snapC.val ? snapC.val() : (snapC && snapC.exists && snapC.exists() ? snapC.val() : null);
            window.renderizarClubesPerfil(clubesData || {});
        } catch (ec) {
            console.error('Error cargando clubes de usuario:', ec);
            window.renderizarClubesPerfil({});
        }

        currentEditEmailKey = emailKey; // Guardamos para que guardarDatosPerfil actualice al usuario objetivo

    } catch (e) {
        console.error('Error al abrir perfil de usuario:', e);
        alert('No se pudo abrir el perfil. Revisá la consola.');
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

// --- GESTIÓN DE CLUBES EN PERFIL (CRUD TIEMPO REAL) ---
window.renderizarClubesPerfil = function(clubesObj) {
    const cont = document.getElementById('lista-clubes-perfil');
    cont.innerHTML = '';
    
    if(!clubesObj) return; 

    Object.keys(clubesObj).forEach(nombreClub => {
        const div = document.createElement('div');
        div.className = 'chip-club';
        div.style.background = '#333';
        div.style.padding = '5px 10px';
        div.style.borderRadius = '15px';
        div.style.border = '1px solid gold';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '8px';
        div.innerHTML = `
            <span style="color:white; font-size:0.9rem;">${nombreClub}</span>
            <span onclick="editarClubPerfil('${nombreClub}')" 
                style="cursor:pointer; font-size:1rem;">✏️</span>
            <span onclick="eliminarClubPerfil('${nombreClub}')" 
                style="cursor:pointer; color:red; font-weight:bold; font-size:1.1rem;">&times;</span>
        `;
        cont.appendChild(div);
    });
};

// Función para editar el nombre del club
window.editarClubPerfil = async function(nombreActual) {
    const nuevoNombre = prompt("Editar nombre del club:", nombreActual);
    if (!nuevoNombre || nuevoNombre === nombreActual) return;
    
    const nombreFinal = nuevoNombre.trim().toUpperCase();
    if (!nombreFinal) return;

    try {
        const user = auth.currentUser;
        const emailKey = (isAdmin && currentEditEmailKey) ? currentEditEmailKey : user.email.replace(/\./g, '_');
        
        // Obtenemos el valor actual del club (puede ser true o un objeto)
        const snap = await window.puenteFirebase('get', `CLUBES/${emailKey}/${nombreActual}`);
        const valorActual = snap.val();

        if (valorActual) {
            // 1. Escribimos en la nueva ubicación
            await window.puenteFirebase('update', `CLUBES/${emailKey}`, { [nombreFinal]: valorActual });
            
            // 2. Borramos la vieja
            await window.puenteFirebase('remove', `CLUBES/${emailKey}/${nombreActual}`);

            // 3. Refrescar
            const snapNew = await window.puenteFirebase('get', `CLUBES/${emailKey}`);
            window.renderizarClubesPerfil(snapNew.val());
        }
    } catch (e) {
        console.error("Error editando club:", e);
        alert("No se pudo editar el club.");
    }
};

window.eliminarClubPerfil = async function(nombreClub) {
    if(!confirm(`¿Seguro que querés eliminar el club ${nombreClub}?`)) return;

    try {
        const user = auth.currentUser;
        const emailKey = (isAdmin && currentEditEmailKey) ? currentEditEmailKey : user.email.replace(/\./g, '_');
        
        // Eliminar path específico
        await window.puenteFirebase('remove', `CLUBES/${emailKey}/${nombreClub}`);
        
        // Refrescar
        const snap = await window.puenteFirebase('get', `CLUBES/${emailKey}`);
        window.renderizarClubesPerfil(snap.val());
    } catch (e) {
        console.error("Error eliminando club:", e);
    }
};

function abrirPerfil() {
    document.getElementById('modal-perfil').style.display = 'flex';

    // Sincroniza los datos del panel con el modal automáticamente
    const nombreActual = document.getElementById('display-name').innerText;
    const emailActual = document.getElementById('display-email').innerText;

    document.getElementById('perf-nombre').value = nombreActual;
    document.getElementById('perf-email').value = emailActual;

    // Cargar datos guardados en Firebase para este usuario (si existen)
    (async () => {
        try {
            const user = auth.currentUser;
            const rawEmail = (user && user.email) ? user.email : emailActual;
            const emailKey = rawEmail.replace(/\./g, '_');
            
            // 1. CARGA DE PERFIL GENERAL
            const snap = await window.puenteFirebase('get', `USUARIOS/${emailKey}/perfil`);
            if (snap && snap.exists && snap.exists()) {
                const datos = snap.val();
                if (datos.emailSec) document.getElementById('perf-email-sec').value = datos.emailSec;
                if (datos.whatsapp) document.getElementById('perf-whatsapp').value = datos.whatsapp;
                if (datos.cumple) document.getElementById('perf-cumple').value = datos.cumple;
                // Zonas (array o objeto)
                if (datos.zonas) {
                    const seleccionadas = Array.isArray(datos.zonas) ? datos.zonas : Object.keys(datos.zonas).map(k => k);
                    document.querySelectorAll('input[name="z-perfil"]').forEach(ch => {
                        ch.checked = (datos.zonas[ch.value] === true) || (seleccionadas.indexOf(ch.value) > -1);
                    });
                }
            }

            // 2. CARGA DE CLUBES (DESDE LA FUENTE DE VERDAD)
            const snapClubes = await window.puenteFirebase('get', `CLUBES/${emailKey}`);
            window.renderizarClubesPerfil(snapClubes.val());

        } catch (e) {
            console.warn('No se pudieron cargar datos del perfil:', e);
        }
    })();
}

function cerrarPerfil() {
    document.getElementById('modal-perfil').style.display = 'none';
}

function guardarDatosPerfil() {
    (async () => {
        const whatsapp = document.getElementById('perf-whatsapp').value.trim();
        if (whatsapp !== "" && whatsapp.length < 10) {
            alert("El número de WhatsApp debe incluir código de país y área (ej: 54911...)");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user || !user.email) return alert('Sesión no detectada.');
            const emailKey = user.email.replace(/\./g, '_');

            // Recolectar zonas seleccionadas
            const zonas = {};
            document.querySelectorAll('input[name="z-perfil"]:checked').forEach(ch => {
                zonas[ch.value] = true;
            });

            // Clubes (YA SE GESTIONAN EN TIEMPO REAL, NO NECESITAMOS GUARDARLOS AQUÍ)
           /*  const clubes = {};
            document.querySelectorAll('#lista-clubes-perfil > div').forEach((d, i) => {
                clubes[d.textContent.trim() || `club_${i}`] = true;
            }); */

            const payload = {
                emailSec: document.getElementById('perf-email-sec').value.trim(),
                whatsapp: whatsapp,
                cumple: document.getElementById('perf-cumple').value || null,
                zonas: zonas,
                // clubes: clubes // REMOVIDO
            };
            // Determinar a qué emailKey escribimos: si admin editando otro, usamos currentEditEmailKey
            const targetEmailKey = (isAdmin && currentEditEmailKey) ? currentEditEmailKey : emailKey;
            const targetEmail = (isAdmin && currentEditEmailKey) ? targetEmailKey.replace(/_/g, '.') : user.email;

            await window.puenteFirebase('update', `USUARIOS/${targetEmailKey}/perfil`, payload);

            // Siempre intentamos también mantener un duplicado en PROFESORES para búsquedas/administración
            try {
                const perfilParaProfesores = Object.assign({}, payload, {
                    nombre: document.getElementById('perf-nombre').value || user.displayName || '',
                    email: targetEmail
                });
                await window.puenteFirebase('update', `PROFESORES/${targetEmailKey}`, perfilParaProfesores);
            } catch (e) {
                // Si no se puede escribir en PROFESORES por reglas, creamos una solicitud administrable
                try {
                    await window.puenteFirebase('push', `SOLICITUDES_PROFESORES`, {
                        target: targetEmailKey,
                        perfilPath: `USUARIOS/${targetEmailKey}/perfil`,
                        ts: Date.now()
                    });
                } catch (ee) {
                    console.error('No se pudo crear solicitud para PROFESORES:', ee);
                }
            }

            // Intentar actualizar la lista blanca (WHITELIST)
            try {
                const nombrePerfil = document.getElementById('perf-nombre').value || user.displayName || '';
                await window.puenteFirebase('update', `WHITELIST/${targetEmailKey}`, {
                    email: targetEmail,
                    nombre: nombrePerfil,
                    addedAt: Date.now(),
                    autoAdded: true
                });
                alert('Perfil guardado correctamente y actualizado en el sistema.');
            } catch (e) {
                // Si no se pudo escribir (reglas de seguridad), creamos una solicitud para que el admin la apruebe
                try {
                    await window.puenteFirebase('push', `SOLICITUDES_WHITELIST`, {
                        email: targetEmail,
                        nombre: document.getElementById('perf-nombre').value || user.displayName || '',
                        perfilPath: `USUARIOS/${targetEmailKey}/perfil`,
                        ts: Date.now()
                    });
                    alert('Perfil guardado. Se envió una solicitud para actualización a la lista blanca.');
                } catch (ee) {
                    console.error('Error creando solicitud de whitelist:', ee);
                    alert('Perfil guardado, pero no se pudo notificar al administrador. Contactá soporte.');
                }
            }

            // Limpiar edición específica si había
            currentEditEmailKey = null;
            cerrarPerfil();
        } catch (e) {
            console.error('Error guardando perfil:', e);
            alert('No se pudo guardar el perfil. Revisá la conexión.');
        }
    })();
}

// --- REPRODUCTOR DE VIDEOS TUTORIALES ---
window.abrirVideoTutorial = function(videoId) {
    const modal = document.getElementById('modal-video');
    const iframe = document.getElementById('iframe-video');
    // Usamos la URL de embed + autoplay=1 para que arranque solo
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    modal.style.display = 'flex';
};

window.cerrarVideoTutorial = function() {
    const modal = document.getElementById('modal-video');
    const iframe = document.getElementById('iframe-video');
    iframe.src = ""; // Detener video
    modal.style.display = 'none';
};

// Llamamos cada vez que agregamos un iframe
window.ajustarAlturaIframes = ajustarAlturaIframes;
window.toggleSidebar = toggleSidebar;
window.toggleArbol = toggleArbol;
window.mostrarCopa = mostrarCopa;
window.mostrarAccionesZona = mostrarAccionesZona;