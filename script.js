// 1. IMPORTACIÓN DE MÓDULOS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, child, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const provider = new GoogleAuthProvider();
const db = getDatabase(app);
const storage = getStorage(app);
const URL_SHEET = "https://script.google.com/macros/s/AKfycbwoefOQGZ4rIlNj_XOG9UPSt7pvn1u4apuPmDUYMYepYZ5jx8pEwSyykoo7TYn9pRgWBg/exec";

// 3. FUNCIONES DE INTERFAZ (DOM)
const loginForm = document.getElementById('loginForm');
const bloqueLogin = document.getElementById('bloqueLogin');
const bloqueRegistro = document.getElementById('bloqueRegistro');
const title = document.getElementById('loginTitle');

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
            alert("¡Autorizado! Ahora configurá tu contraseña de acceso.");
            document.getElementById('btnVerificarSheet').style.display = 'none';
            document.getElementById('seccionConfirmarPass').style.display = 'block';
        } else {
            const confirmacion = confirm("Tu mail no está en la lista de entrenadores. ¿Deseas ingresar al Portal de Padres para subir documentación?");
            if (confirmacion) {
                loginForm.style.display = 'none';
                document.getElementById('portal-padres').style.display = 'block';
                document.querySelector('.contenido-principal').style.display = 'none';
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
        location.reload();
    } catch (err) {
        alert("Error al crear cuenta: " + err.message);
    }
};

// Ingreso con Email y Clave
document.getElementById('btnEntrar').onclick = async () => {
    const email = document.getElementById('emailLogin').value;
    const pass = document.getElementById('passLogin').value;
    if(!email || !pass) return alert("Completá todos los campos.");
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userName', "Entrenador Lifepar"); 
        alert("Ingreso exitoso.");
        loginForm.style.display = 'none';
        window.location.href = "admin.html";
    } catch (err) {
        console.error("Error Firebase:", err.code);
        alert("Credenciales incorrectas o usuario no encontrado.");
    }
};

// Ingreso con Google + Check de Lista Blanca
document.getElementById('btnGoogle').onclick = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const email = result.user.email;
        const nombre = result.user.displayName || "Entrenador";
        const response = await fetch(`${URL_SHEET}?email=${email}`);
        const data = await response.json();
        if(data.autorizado) {
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', nombre);
            window.location.href = "admin.html";
        } else {
            loginForm.style.display = 'none';
            document.getElementById('portal-padres').style.display = 'block';
            document.querySelector('.contenido-principal').style.display = 'none';
        }
    } catch (err) {
        console.error(err);
        alert("Error con Google.");
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

// Atrás en registro
document.getElementById('linkVolverLogin').onclick = () => {
    resetFormulario();
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
    const barra = document.getElementById('barra-progreso');
    const progreso = document.getElementById('progreso-interno');
    const btn = input.nextElementSibling;
    const infoDiv = document.getElementById(`info-${tipo}`) || {}; 
    if (archivo.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            infoDiv.innerHTML = `<img src="${e.target.result}" class="mini-previa"><br><b>Archivo:</b> ${archivo.name}`;
        };
        reader.readAsDataURL(archivo);
    } else {
        infoDiv.innerHTML = `<br><b>Documento:</b> ${archivo.name}`;
    }
    barra.style.display = 'block';
    progreso.style.width = '0%';
    progreso.style.backgroundColor = '#3498db';
    progreso.innerHTML = "";
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
                console.error("Error final:", err);
                progreso.style.backgroundColor = '#e74c3c';
                progreso.innerHTML = "✕";
            }
        }
    );
};

// Mostrar la sección contacto al presionar el enlace
document.querySelector('a[href="#contacto"]').addEventListener('click', function(e){
    e.preventDefault(); // Evita que haga scroll
    document.getElementById('contacto').style.display = 'block';
});

// Ocultar la sección contacto con el botón de cerrar
document.getElementById('cerrarContacto').addEventListener('click', function(){
    document.getElementById('contacto').style.display = 'none';
});
