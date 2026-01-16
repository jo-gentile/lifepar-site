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
        contenedor.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid #ffd700; padding: 25px; border-radius: 15px; margin-top: 15px;">
                <h4 style="color: #ffd700; text-align: center; font-family: 'Anton', sans-serif;">📝 NUEVA INSCRIPCIÓN - ZONA ${numZona}</h4>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="color: white; font-size: 0.8rem;">Club</label>
                        <div style="display: flex; gap: 5px;">
                            <select id="z3-club" class="input-registro" style="width:100%">
                                ${opcionesClub}
                            </select>
                            <button type="button" onclick="toggleLock('z3-club')" style="cursor:pointer; background: transparent; border: none; font-size: 1.2rem;">🔓</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="z3-apellido" placeholder="APELLIDO" class="input-registro" style="flex:1">
                    <input type="text" id="z3-nombre" placeholder="NOMBRE" class="input-registro" style="flex:1">
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="date" id="z3-nacimiento" class="input-registro" style="flex:1" onchange="calcularEdadDeportiva(this.value, 'z3-edad')">
                    <input type="text" id="z3-edad" placeholder="EDAD" class="input-registro" readonly style="flex:1; color:gold; font-weight: bold;">
                </div>

                <button type="button" onclick="alert('¡Datos listos para enviar!')" style="width: 100%; padding: 15px; background: gold; color: black; font-weight: bold; cursor:pointer; border-radius:10px; border: none; font-family: 'Anton', sans-serif; letter-spacing: 1px;">
                    🚀 PROBAR CARGA
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
    if (input.disabled) {
        input.disabled = false;
    } else {
        input.disabled = true;
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
// VARIABLES GLOBALES DE SESIÓN
let userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail') || "Email no detectado";
let userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || "Usuario";

// Mostrar datos en el header
if(document.getElementById('display-email')) document.getElementById('display-email').innerText = userEmail;
if(document.getElementById('display-name')) document.getElementById('display-name').innerText = userName;

// URL ÚNICA DE TU SCRIPT DE GOOGLE
const MI_URL_GOOGLE = "https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec";

// --- FUNCIONES DE NAVEGACIÓN (Se mantienen igual) ---
function logout() { localStorage.clear(); window.location.href = "index.html"; }
function toggleSidebar() { 
    document.getElementById('sidebar').classList.toggle('collapsed'); 
    document.getElementById('main-content').classList.toggle('expanded'); 
}
function toggleArbol(id) {
    const lista = document.getElementById(id);
    lista.style.display = (lista.style.display === "flex") ? "none" : "flex";
}
function mostrarAccionesZona(num) {
    document.getElementById('contenedor-acciones-zonas').style.display = 'flex';
    document.querySelectorAll('.menu-zona').forEach(m => m.style.display = 'none');
    const seleccionado = document.getElementById('menu-zona' + num);
    if (seleccionado) seleccionado.style.display = 'block';
}

// --- FUNCIÓN 1: GUARDAR NUEVO CLUB (La que te tiraba error en Chrome) ---
async function guardarNuevoClub() {
    const clubNombre = document.getElementById('nuevo-club-nombre').value.toUpperCase();
    if (!clubNombre || userEmail === "Email no detectado") {
        alert("⚠️ Datos incompletos."); return;
    }
    const datos = { tipo: "REGISTRO_CLUB", mail: userEmail, clubNombre: clubNombre };

    try {
        await fetch(MI_URL_GOOGLE, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(datos)
        });
        alert("✅ Solicitud enviada. Reiniciá para ver los cambios.");
        cerrarModalClubes();
    } catch (e) { alert("❌ Error de conexión."); }
}

// --- FUNCIÓN 2: CARGAR FORMULARIO Y BUSCAR CLUBES ---
async function abrirFormularioCarga(numZona) {
    const contenedor = document.getElementById('contenedor-formulario-dinamico');
    if (contenedor.style.display === 'block') { contenedor.style.display = 'none'; return; }

    let opciones = '<option value="">Cargando clubes...</option>';
    try {
        const res = await fetch(`${MI_URL_GOOGLE}?mail=${encodeURIComponent(userEmail)}`);
        const clubes = await res.json();
        opciones = clubes.length > 0 
            ? clubes.map(c => `<option value="${c}">${c}</option>`).join('')
            : '<option value="">Sin clubes asociados</option>';
    } catch (e) { opciones = '<option value="">Error al cargar</option>'; }

    contenedor.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid #ffd700; padding: 25px; border-radius: 15px;">
            <h4 style="color: #ffd700; text-align: center;">📝 NUEVA INSCRIPCIÓN - ZONA ${numZona}</h4>
            <label>Club</label>
            <select id="z3-club" class="input-registro" style="width:100%; margin-bottom:15px;">${opciones}</select>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="z3-apellido" placeholder="APELLIDO" class="input-registro" style="flex:1">
                <input type="text" id="z3-nombre" placeholder="NOMBRE" class="input-registro" style="flex:1">
            </div>
            <button class="btn-accion" style="width:100%; background:gold; color:black;">🚀 PROBAR CARGA</button>
        </div>`;
    contenedor.style.display = 'block';
}

// --- FUNCIONES MODAL ---
function abrirModalClubes() { document.getElementById('modal-clubes').style.display = 'flex'; }
function cerrarModalClubes() { document.getElementById('modal-clubes').style.display = 'none'; }