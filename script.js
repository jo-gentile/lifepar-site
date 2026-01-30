// 1. IMPORTACIÓN DE MÓDULOS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, setPersistence, browserSessionPersistence, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, child, update, } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 2. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDOwn0QlyqdU3fDBEsPFuvPMzs4ylqMuQ8",
    authDomain: "web-lifepar.firebaseapp.com",
    projectId: "web-lifepar",
    storageBucket: "web-lifepar.firebasestorage.app",
    messagingSenderId: "140850288146",
    appId: "1:140850288146:web:fe1d35bac4c30c39b3aacb",
    measurementId: "G-MF0RNRQL92"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    console.log("Conectado al emulador local de Lifepar");
}
const provider = new GoogleAuthProvider();
const db = getDatabase(app);
const storage = getStorage(app);
const URL_SHEET = "https://script.google.com/macros/s/AKfycbwoefOQGZ4rIlNj_XOG9UPSt7pvn1u4apuPmDUYMYepYZ5jx8pEwSyykoo7TYn9pRgWBg/exec";

// 3. FUNCIONES DE INTERFAZ (DOM)
const loginForm = document.getElementById('loginForm');
const bloqueLogin = document.getElementById('bloqueLogin');
const bloqueRegistro = document.getElementById('bloqueRegistro');
const title = document.getElementById('loginTitle');

// FUNCIONES DE INTERFAZ
const resetFormulario = () => {
    bloqueLogin.style.display = 'block';
    bloqueRegistro.style.display = 'none';
    document.getElementById('seccionConfirmarPass').style.display = 'none';
    document.getElementById('btnVerificarSheet').style.display = 'block';
    title.innerText = "ACCESO PERSONAL";
    document.getElementById('emailLogin').value = "";
    document.getElementById('passLogin').value = "";
    document.getElementById('emailManual').value = "";
};

// Abrir login
window.mostrarLogin = () => { 
    resetFormulario();
    document.getElementById('portal-padres').style.display = 'none';
    document.querySelector('.contenido-principal').style.display = 'block';
    loginForm.style.display = 'block'; 
};

// Cerrar login
document.getElementById('btnCerrarLogin').onclick = () => { 
    loginForm.style.display = 'none';
    resetFormulario();
};

// Conectar botón de acceso a entrenadores
document.getElementById('btnAccesoEntrenadores').onclick = () => {
    mostrarLogin();
};

// 1. Botón de Ingreso con Email/Clave
document.getElementById('btnEntrar').onclick = async () => {
    const email = document.getElementById('emailLogin').value;
    const pass = document.getElementById('passLogin').value;
    if(!email || !pass) return alert("Completá todos los campos.");
    
    try {
        // Mantenemos la sesión activa al cambiar de página
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, pass);
        
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userName', "Entrenador Lifepar"); 
        
        window.location.href = "admin.html";
    } catch (err) {
        alert("Credenciales incorrectas.");
    }
};


// Ingreso con Google + Check de Lista Blanca
// 2. Botón de Ingreso con Google (Tu lógica real)
document.getElementById('btnGoogle').onclick = async () => {
    try {
        await setPersistence(auth, browserSessionPersistence);
        const result = await signInWithPopup(auth, provider);
        const email = result.user.email;
        const nombre = result.user.displayName || "Entrenador";

        // VALIDACIÓN EN FIREBASE (Tu carpeta listaBlanca)
        const emailKey = email.replace(/\./g, '_');
        const snapshot = await get(child(ref(db), `listaBlanca/${emailKey}`));

        if(snapshot.exists()) {
            // ES ENTRENADOR: Vamos al admin
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', nombre);
            window.location.href = "admin.html";
        } else {
            // NO ES ENTRENADOR: Tu lógica de confirmación para Padres
            loginForm.style.display = 'none';
            const confirmacion = confirm("Tu mail no está en la lista de entrenadores. ¿Querés ingresar al Portal de Padres?");

            if (confirmacion) {
                document.getElementById('portal-padres').style.display = 'block';
                document.querySelector('.contenido-principal').style.display = 'none';
            } else {
                mostrarLogin();
            }
        }
    } catch (err) {
        console.error(err);
        alert("Error con Google.");
    }
};

// Atrás en registro
document.getElementById('linkVolverLogin').onclick = () => {
    resetFormulario();
};

// Abrir modo registro
document.getElementById('linkRegistrarse').onclick = () => {
    bloqueLogin.style.display = 'none';
    bloqueRegistro.style.display = 'block';
    title.innerText = "NUEVO ENTRENADOR";
};

// 4. LÓGICA DE NEGOCIO (SHEETS + FIREBASE)
document.getElementById('btnVerificarSheet').onclick = async () => {
    const emailNormal = document.getElementById('emailManual').value.trim().toLowerCase();
    const emailFirebase = emailNormal.replace(/\./g, '_'); 
    if(!emailNormal.includes("@")) return alert("Ingresá un mail válido.");

    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, `listaBlanca/${emailFirebase}`));

        if (snapshot.exists()) {
            // ✅ Mail autorizado: abrir sección para crear contraseña
            alert("¡Autorizado! Ahora configurá tu contraseña de acceso.");
            document.getElementById('btnVerificarSheet').style.display = 'none';
            document.getElementById('seccionConfirmarPass').style.display = 'block';

        } else {
            // ❌ Mail no autorizado: preguntar si es padre
            const confirmacion = confirm("Tu mail no está en la lista de entrenadores. ¿Querés ingresar al Portal de Padres para subir documentación?");

            if (confirmacion) {
                // Padre dice sí → portal padres
                loginForm.style.display = 'none';
                document.getElementById('portal-padres').style.display = 'block';
                document.querySelector('.contenido-principal').style.display = 'none';
            } else {
                // Padre dice no → volver a mostrar login
                mostrarLogin();
            }
        }
    } catch (err) {
        alert("Error de conexión con la base de datos.");
    }
};

// Registro Final en Firebase
document.getElementById('btnFinalizarRegistro').onclick = async () => {
    const email = document.getElementById('emailManual').value;
    const p1 = document.getElementById('passNuevo').value;
    const p2 = document.getElementById('passConfirmar').value;

    if(p1.length < 6) return alert("La clave debe tener al menos 6 caracteres.");
    if(p1 !== p2) return alert("Las claves no coinciden.");

    try {
        await createUserWithEmailAndPassword(auth, email, p1);
        alert("¡Cuenta creada con éxito!");
        window.location.href = "admin.html"; // redirige directo al admin después de crear la cuenta
    } catch (err) {
        alert("Error al crear cuenta: " + err.message);
    }
};


// Recuperar Clave
document.getElementById('linkRecuperar').onclick = async () => {
    const email = document.getElementById('emailLogin').value || document.getElementById('emailManual').value;
    if(!email) return alert("Escribí tu email primero.");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Te enviamos un link a tu correo.");
    } catch (err) {
        alert("Error al enviar: " + err.message);
    }
};

// Variable global para patinador
let patinadorSesionPadre = null;

// PASO 1: Verificar DNI
window.verificarDniPadre = async () => {
    const dniBusqueda = document.getElementById('dni-validacion').value.trim();
    if (!dniBusqueda) return alert("Por favor, ingresá un DNI.");
    const dbRef = ref(db);
    patinadorSesionPadre = null;
    try {
        for (let i = 1; i <= 6; i++) {
            const rutaReal = `ZONAS/ZONA_${i}`;
            const snapshot = await get(child(dbRef, rutaReal));
            if (snapshot.exists()) {
                const dataZonales = snapshot.val();
                for (let id in dataZonales) {
                    let registro = dataZonales[id];
                    const dniLimpioBase = String(registro.DNI || "").replace(/\D/g, "");
                    const dniLimpioBusqueda = String(dniBusqueda).replace(/\D/g, "");
                    if (dniLimpioBase === dniLimpioBusqueda) {
                        patinadorSesionPadre = { ...registro, id: id, zona: rutaReal };
                        break;
                    }
                }
            }
            if (patinadorSesionPadre) break;
        }
        if (patinadorSesionPadre) {
            document.getElementById('paso-dni').style.display = 'none';
            document.getElementById('paso-fecha').style.display = 'block';
        } else {
            alert("DNI no encontrado en el padrón oficial.");
        }
    } catch (e) {
        console.error("Error de Firebase:", e);
        alert("Error de conexión con la base de datos.");
    }
};

// PASO 2: Validar fecha
window.validarFechaPadre = () => {
    const fechaIngresada = document.getElementById('fecha-validacion').value;
    if (fechaIngresada === patinadorSesionPadre.fechaDeNacimiento || fechaIngresada === patinadorSesionPadre.fecha_de_nacimiento) {
        document.getElementById('paso-fecha').style.display = 'none';
        document.getElementById('paso-carga').style.display = 'block';
        document.getElementById('nombre-hijo').innerText = `¡Bienvenido/a, ${patinadorSesionPadre.nombre}!`;
        document.getElementById('detalle-hijo').innerText = `${patinadorSesionPadre.club} | ${patinadorSesionPadre.categoria}`;
        document.getElementById('instruccion-padre').innerText = "Ya podés adjuntar la documentación oficial.";
    } else {
        alert("La fecha de nacimiento no coincide. Verificá los datos.");
    }
};

// PASO 3: Subida de archivos
window.subirArchivo = async (tipo) => {
    const input = document.getElementById(`input-${tipo}`);
    const archivo = input.files[0];
    if (!archivo) return;
    const barra = document.getElementById(`barra-${tipo}`);
    const progreso = document.getElementById(`progreso-${tipo}`);
    const btn = input.nextElementSibling;
    const infoDiv = document.getElementById(`info-${tipo}`);
        if (infoDiv) {
        if (archivo.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            infoDiv.innerHTML = `<img src="${e.target.result}" class="mini-previa"><br><b>Archivo:</b> ${archivo.name}`;
        };
        reader.readAsDataURL(archivo);
    } else {
        infoDiv.innerHTML = `<br><b>Documento:</b> ${archivo.name}`;
      }
    }
    progreso.style.width = '100%';
progreso.style.backgroundColor = '#28a745';
btn.disabled = true;
btn.innerText = 'CARGADO EN NUBE';
    const extension = archivo.name.split('.').pop();
    const nombreFinal = `${tipo.toUpperCase()}_${patinadorSesionPadre.DNI}_${patinadorSesionPadre.nombre}.${extension}`;
    const storageRef = sRef(storage, `documentacion/${nombreFinal}`); 
    const uploadTask = uploadBytesResumable(storageRef, archivo);
    uploadTask.on('state_changed', 
        (snapshot) => {
            const porc = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progreso.style.width = porc + '%';
        }, 
        (error) => {
            progreso.style.backgroundColor = '#e74c3c';
            progreso.innerHTML = "✕";
            console.error("Error al subir:", error);
        }, 
        async () => {
            try {
                const urlDescarga = await getDownloadURL(uploadTask.snapshot.ref);
                const dbRef = ref(db, `${patinadorSesionPadre.zona}/${patinadorSesionPadre.id}`);
                await update(dbRef, { [tipo === 'dni' ? 'linkDNI' : 'linkMedico']: urlDescarga });
                progreso.style.width = '100%';
                progreso.style.backgroundColor = '#28a745';
                progreso.innerHTML = "✓";
                btn.disabled = true;
                btn.style.backgroundColor = "#6c757d";
                btn.style.cursor = "not-allowed";
                 btn.innerText = "CARGADO EN NUBE";
             } catch (err) {
                    console.error("Error en DB, pero archivo subido:", err);
                    // No cambiamos la barra ni marcamos error visual
            }

        }
    );
};

// Atrás en registro
document.getElementById('linkVolverLogin').onclick = () => {
    resetFormulario();
};

const btnCerrar = document.getElementById('cerrarContacto');

btnCerrar.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ============================================================
   1. FUNCIÓN VER ZONA (Fusión de HTML + JS)
   ============================================================ */
window.verZona = function(numero) {
    console.log("Cargando zona número:", numero);
    const contenedorCentro = document.getElementById('panel-cristal');
    const infoABuscar = document.getElementById('detalle-zona' + numero);

    if (contenedorCentro && infoABuscar) {
        contenedorCentro.innerHTML = ''; 
        
        // Clonamos la zona para que no desaparezca del menú lateral
        const clon = infoABuscar.cloneNode(true);
        
        // QUITAMOS EL ID: Esto evita que el botón falle al segundo click
        clon.removeAttribute('id'); 
        clon.classList.remove('oculto');
        clon.classList.add('visible');
        
        contenedorCentro.appendChild(clon);

        // USAMOS TU SCROLL DEL HTML: Sube suave al principio para ver la info
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error("No encontré el panel o la zona:", numero);
    }
};

/* ============================================================
   2. BOTÓN DE FONDO (Pasado del HTML al JS)
   ============================================================ */
// Buscamos el botón y el slider
const btnToggle = document.getElementById('toggle-bg');
const slider = document.querySelector('.background-slider');

if (btnToggle && slider) {
    btnToggle.onclick = () => {
        // Si está visible, lo oculta; si está oculto, lo muestra
        if (slider.style.display === 'none') {
            slider.style.display = 'block';
        } else {
            slider.style.display = 'none';
        }
    };
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.warn('Error al registrar SW', err));
  });
}
/* ============================================================
   LÓGICA DE ACCESO BIOMÉTRICO (HUELLA)
   ============================================================ */

async function loginBiometrico() {
    const mail = localStorage.getItem('mailVinculado');
    const credID = localStorage.getItem('credencial_biometrica');

    if (!mail || !credID) {
        console.log("No hay credenciales guardadas.");
        return;
    }

    try {
        const idBuffer = Uint8Array.from(atob(credID.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

        const authResponse = await navigator.credentials.get({
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                allowCredentials: [{ id: idBuffer, type: 'public-key' }],
                userVerification: 'required'
            }
        });

        if (authResponse) {
            console.log("✅ Huella reconocida");
            
            // Guardamos en sessionStorage para que el Admin sepa que venimos de la huella
            sessionStorage.setItem('userEmail', mail);
            sessionStorage.setItem('userName', "Entrenador Lifepar"); 

            // Redirección inmediata
            window.location.href = "admin.html";
        }
    } catch (err) {
        console.error("Error en Biometría:", err);
        // No alertar aquí para no molestar si el usuario solo canceló
    }
}
// Ejecución automática
loginBiometrico();
