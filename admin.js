// --- MAPA DE COMPETENCIA (El Cerebro) ---
let zonaActiva = "";
const MAPA_COMPETENCIA = {
    "LIBRE": {
        "A": ["Nacional A", "Elite"],
        "B": ["1°", "2°", "3°", "Promocional"],
        "C": ["1°", "2°", "3°", "4°", "5°", "Escuela Formativa"],
        "D": ["Principiantes A", "Principiantes B", "Incentivación", "Futuros Talentos"]
    },
    "DANZA": {
        "Lifedance": ["Advanced", "Elemental"],
        "Gonzalez Molina": ["Avanzado"],
        "Nacional": ["Basico", "Avanzado"]
    }
};
async function abrirFormularioCarga(numZona) {
    zonaActiva = "ZONA " + numZona; // Esto guarda "ZONA 3" para el envío
    // ... resto de tu código de la función ...
}
function actualizarCascada(nivel) {
    const disc = document.getElementById('z3-disciplina').value;
    const div = document.getElementById('z3-divisional');
    const cat = document.getElementById('z3-categoria');

    if (nivel === 'disciplina') {
        // Si el candado de divisional está abierto, actualizamos
        if (!div.disabled) {
            div.innerHTML = '<option value="">DIVISIONAL...</option>';
            if (MAPA_COMPETENCIA[disc]) {
                Object.keys(MAPA_COMPETENCIA[disc]).forEach(d => {
                    div.innerHTML += `<option value="${d}">${d}</option>`;
                });
            }
            // Al cambiar disciplina, reseteamos categoría si no está trabada
            if (!cat.disabled) cat.innerHTML = '<option value="">CATEGORÍA...</option>';
        }
    }

    if (nivel === 'divisional') {
        // Si el candado de categoría está abierto, actualizamos
        if (!cat.disabled) {
            cat.innerHTML = '<option value="">CATEGORÍA...</option>';
            const seleccionada = div.value;
            if (MAPA_COMPETENCIA[disc] && MAPA_COMPETENCIA[disc][seleccionada]) {
                MAPA_COMPETENCIA[disc][seleccionada].forEach(c => {
                    cat.innerHTML += `<option value="${c}">${c}</option>`;
                });
            }
        }
    }
}    
    // Variable global para saber en qué pestaña de Sheets escribir

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
    // 1. Desbloqueamos el contenedor principal (la section)
    const contenedor = document.getElementById('contenedor-acciones-zonas');
    if (contenedor) {
        contenedor.style.display = 'flex'; 
    }

    // 2. Ocultamos todas las tarjetas de zona primero
    const todosLosMenus = document.querySelectorAll('.menu-zona');
    todosLosMenus.forEach(menu => {
        menu.style.display = 'none';
    });

    // 3. Ocultamos también el de seguros por si estaba abierto
    const menuSeguros = document.getElementById('menu-seguros');
    if (menuSeguros) { menuSeguros.style.display = 'none'; }

    // 4. Mostramos la zona que elegimos
    const menuSeleccionado = document.getElementById('menu-zona' + numeroZona);
    if (menuSeleccionado) {
        menuSeleccionado.style.display = 'block';
    }
}
function mostrarSeguros() {
    // 1. Ocultamos el contenedor de las zonas para que no se pisen
    const contenedorZonas = document.getElementById('contenedor-acciones-zonas');
    if (contenedorZonas) {
        contenedorZonas.style.display = 'none';
    }

    // 2. Mostramos TU sección de seguros (la que ya tenías funcionando)
    const boxSeguros = document.getElementById('seguros');
    if (boxSeguros) {
        boxSeguros.style.display = 'block'; // O 'flex' si querés que use el centrado
    }
}
function mostrarCopa() {
    // 1. Ocultamos Zonas y Seguros primero
    document.getElementById('contenedor-acciones-zonas').style.display = 'none';
    const boxSeguros = document.getElementById('seguros');
    if (boxSeguros) boxSeguros.style.display = 'none';

    // 2. Mostramos la Copa Federal
    const boxCopa = document.getElementById('copa-federal');
    if (boxCopa) {
        boxCopa.style.display = 'block';
    }
}
async function abrirFormularioCarga(numZona) {
    const contenedor = document.getElementById('contenedor-formulario-dinamico');
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    // Si está oculto, lo cargamos y mostramos
    if (contenedor.style.display === 'none' || contenedor.style.display === '') {
        
        let opcionesClub = '<option value="">Cargando mis clubes...</option>';
        
        try {
            // Usamos tu URL de Google Apps Script con el mail del usuario logueado
            const URL_GET = `https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec?mail=${userEmail}`;
            const respuesta = await fetch(URL_GET);
            const listaDeClubes = await respuesta.json();
            
            if (listaDeClubes.length > 0) {
                // Si hay clubes en la planilla, armamos el select dinámico
                opcionesClub = listaDeClubes.map(c => `<option value="${c}">${c}</option>`).join('');
            } else {
                opcionesClub = '<option value="">Sin clubes registrados</option>';
            }
        } catch (error) {
            console.error("Error al traer clubes:", error);
            opcionesClub = '<option value="CLUB PRUEBA">CLUB PRUEBA</option>';
        }

        // Cargamos TODO el HTML dentro del contenedor vía JS
        // ... dentro de abrirFormularioCarga(numZona) ...
// Este bloque integra TODO: Competencia + Datos Personales + Botón Final
contenedor.innerHTML = `
    <div style="background: rgba(255,255,255,0.05); border: 1px solid #ffd700; padding: 25px; border-radius: 15px; margin-top: 15px;">
        <h4 style="color: #ffd700; text-align: center; font-family: 'Anton', sans-serif;">📝 NUEVA INSCRIPCIÓN - ${zonaActiva}</h4>
        
        <div style="margin-bottom: 15px;">
            <label style="color: white; font-size: 0.8rem;">Club</label>
            <div style="display: flex; gap: 5px;">
                <select id="z3-club" class="input-registro" style="width:100%">${opcionesClub}</select>
                <button type="button" onclick="toggleLock('z3-club')" style="cursor:pointer; background:transparent; border:none; font-size:1.2rem;">🔓</button>
            </div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="color: white; font-size: 0.8rem;">Disciplina</label>
            <div style="display: flex; gap: 5px;">
                <select id="z3-disciplina" class="input-registro" style="width:100%" onchange="actualizarCascada('disciplina')">
                    <option value="">SELECCIONE...</option>
                    <option value="LIBRE">LIBRE</option>
                    <option value="DANZA">DANZA SOLO</option>
                </select>
                <button type="button" onclick="toggleLock('z3-disciplina')" style="cursor:pointer; background:transparent; border:none; font-size:1.2rem;">🔓</button>
            </div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="color: white; font-size: 0.8rem;">Divisional</label>
            <div style="display: flex; gap: 5px;">
                <select id="z3-divisional" class="input-registro" style="width:100%" onchange="actualizarCascada('divisional')">
                    <option value="">DIVISIONAL...</option>
                </select>
                <button type="button" onclick="toggleLock('z3-divisional')" style="cursor:pointer; background:transparent; border:none; font-size:1.2rem;">🔓</button>
            </div>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="color: white; font-size: 0.8rem;">Categoría</label>
            <div style="display: flex; gap: 5px;">
                <select id="z3-categoria" class="input-registro" style="width:100%">
                    <option value="">CATEGORÍA...</option>
                </select>
                <button type="button" onclick="toggleLock('z3-categoria')" style="cursor:pointer; background:transparent; border:none; font-size:1.2rem;">🔓</button>
            </div>
        </div>

        <hr style="border: 0.5px solid rgba(255,215,0,0.3); margin: 20px 0;">

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <input type="text" id="z3-apellido" placeholder="APELLIDO" class="input-registro" style="flex:1">
            <input type="text" id="z3-nombre" placeholder="NOMBRE" class="input-registro" style="flex:1">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="color: white; font-size: 0.8rem;">Género</label>
            <select id="z3-genero" class="input-registro" style="width:100%">
                <option value="">SELECCIONE...</option>
                <option value="FEMENINO">FEMENINO</option>
                <option value="MASCULINO">MASCULINO</option>
                <option value="NO BINARIO">NO BINARIO</option>
            </select>
        </div>

        <div style="margin-bottom: 15px;">
            <input type="number" id="z3-DNI" placeholder="DNI (Sín puntos)" class="input-registro" style="width:100%">
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 2;">
                <label style="color: white; font-size: 0.7rem;">Fecha de Nacimiento</label>
                <input type="date" id="z3-nacimiento" class="input-registro" style="width:100%" onchange="calcularEdadDeportiva(this.value, 'z3-edad')">
            </div>
            <div style="flex: 1;">
                <label style="color: white; font-size: 0.7rem;">Edad Dep.</label>
                <input type="text" id="z3-edad" placeholder="0" class="input-registro" readonly style="width:100%; color:gold; font-weight:bold; text-align:center;">
            </div>
        </div>

        <button type="button" onclick="enviarCargaPatinador()" style="width: 100%; padding: 15px; background: gold; color: black; font-weight: bold; cursor:pointer; border-radius:10px; border:none; font-family: 'Anton', sans-serif; margin-top: 10px;">
            🚀 CARGAR PATINADOR
        </button>
    </div>
`;
        contenedor.style.display = 'block';
    } else {
        // Si ya está visible, el botón lo cierra
        contenedor.style.display = 'none';
    }
}

// 2. FUNCIÓN PARA LOS CANDADOS (Corregida)
function toggleLock(fieldId) {
    const input = document.getElementById(fieldId);
    // Buscamos el botón que está justo al lado del input
    const boton = input.nextElementSibling; 

    if (input.disabled) {
        input.disabled = false;
        if (boton) boton.innerText = "🔓";
    } else {
        input.disabled = true;
        if (boton) boton.innerText = "🔒";
    }
}

// 3. FUNCIÓN PARA LA EDAD (Corregida)
function calcularEdadDeportiva(fechaNac, targetId) {
    if (!fechaNac) return;
    const anioNac = new Date(fechaNac).getFullYear();
    const anioActual = 2026; 
    document.getElementById(targetId).value = (anioActual - anioNac) + " AÑOS";
}
function abrirModalClubes() {
    const modal = document.getElementById('modal-clubes');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function cerrarModalClubes() {
    document.getElementById('modal-clubes').style.display = 'none';
}
async function guardarNuevoClub() {
    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec"; // La que termina en /exec
    const clubNombre = document.getElementById('nuevo-club-nombre').value.toUpperCase();
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    if (!clubNombre || !userEmail) {
        alert("⚠️ Error: Datos incompletos (Nombre del club o Email).");
        return;
    }

    const datos = {
        tipo: "REGISTRO_CLUB",
        mail: userEmail,
        clubNombre: clubNombre
    };

    try {
        await fetch("https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec", {
            method: "POST",
            mode: "no-cors", // Cambiado de no-cors para asegurar que viaje el JSON
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        
// Con no-cors no podemos leer la respuesta "OK", pero si no salta al catch, es que salió.
        alert("✅ Solicitud de registro enviada.");
        cerrarModalClubes();
        document.getElementById('nuevo-club-nombre').value = "";

    } catch (error) {
        console.error("Error:", error);
        alert("❌ No se pudo conectar con el servidor.");
    }
}
async function enviarCargaPatinador() {
    const datos = {
        tipo: "INSCRIPCION",
        nombreZona: zonaActiva,
        club: document.getElementById('z3-club').value,
        disciplina: document.getElementById('z3-disciplina').value,
        divisional: document.getElementById('z3-divisional').value,
        categoria: document.getElementById('z3-categoria').value,
        apellido: document.getElementById('z3-apellido').value.toUpperCase(),
        nombre: document.getElementById('z3-nombre').value.toUpperCase(),
        DNI: document.getElementById('z3-DNI').value, // <-- NUEVO CAMPO
        nacimiento: document.getElementById('z3-nacimiento').value,
        edadDeportiva: document.getElementById('z3-edad').value,
        mailProfe: userEmail
    };
        try {
        await fetch("https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec", { 
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(datos)
        });

        // 3. Si llegó acá, es que el navegador procesó el envío
        alert("✅ Registro enviado a la " + zonaActiva);
        
        // Aquí podés llamar a la función que limpia los campos (DNI, Nombre, etc.)
        function limpiarFormularioPostCarga() {
    // Solo vaciamos los datos del patinador para que el profe no escriba doble
    if(document.getElementById('z3-apellido')) document.getElementById('z3-apellido').value = "";
    if(document.getElementById('z3-nombre')) document.getElementById('z3-nombre').value = "";
    if(document.getElementById('z3-DNI')) document.getElementById('z3-DNI').value = "";
    if(document.getElementById('z3-nacimiento')) document.getElementById('z3-nacimiento').value = "";
    if(document.getElementById('z3-edad')) document.getElementById('z3-edad').value = "";
    // El género lo reseteamos a la primera opción
    if(document.getElementById('z3-genero')) document.getElementById('z3-genero').selectedIndex = 0;

    console.log("Campos de patinador vaciados correctamente.");
}

    } catch (error) {
        console.error("Error al enviar:", error);
        alert("❌ Hubo un problema al conectar con la planilla.");
    }
}
// --- FUNCIÓN DE LIMPIEZA DE CAMPOS ---

