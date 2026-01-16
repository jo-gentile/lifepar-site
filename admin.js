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
// 1. FUNCIÓN PRINCIPAL: ABRE Y CIERRA EL FORMULARIO
function abrirFormularioCarga(numZona) {
    const contenedor = document.getElementById('contenedor-formulario-dinamico');
    
    if (contenedor.style.display === 'none' || contenedor.style.display === '') {
        // Metemos el HTML
        contenedor.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid #ffd700; padding: 25px; border-radius: 15px; margin-top: 15px;">
                <h4 style="color: #ffd700; text-align: center;">📝 NUEVA INSCRIPCIÓN - ZONA ${numZona}</h4>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label>Club</label>
                        <div style="display: flex; gap: 5px;">
                            <select id="z3-club" class="input-registro" style="width:100%">
                                <option value="">Seleccione...</option>
                                <option value="CLUB PRUEBA">CLUB PRUEBA</option>
                            </select>
                            <button type="button" onclick="toggleLock('z3-club')" style="cursor:pointer">🔓</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="z3-apellido" placeholder="APELLIDO" class="input-registro" style="flex:1">
                    <input type="text" id="z3-nombre" placeholder="NOMBRE" class="input-registro" style="flex:1">
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="date" id="z3-nacimiento" class="input-registro" style="flex:1" onchange="calcularEdadDeportiva(this.value, 'z3-edad')">
                    <input type="text" id="z3-edad" placeholder="EDAD" class="input-registro" readonly style="flex:1; color:gold">
                </div>

                <button type="button" onclick="alert('¡Casi listo! Falta conectar con Google')" style="width: 100%; padding: 15px; background: gold; color: black; font-weight: bold; cursor:pointer; border-radius:5px;">
                    🚀 PROBAR CARGA
                </button>
            </div>
        `;
        contenedor.style.display = 'block';
    } else {
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
async function guardarNuevoClub() {
    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec"; 
    const clubNombre = document.getElementById('nuevo-club-nombre').value.toUpperCase();
    
    // Este mail luego vendrá del login automático
    const userEmail = localStorage.getItem('userEmail') || "profe_invitado@gmail.com";

    if (!clubNombre) {
        alert("⚠️ Por favor, ingresá el nombre de la institución.");
        return;
    }
 
    const datos = {
        tipo: "REGISTRO_CLUB",
        mail: userEmail,
        clubNombre: clubNombre
    };

    try {
        // El envío que funcionará cuando estés online
        await fetch("https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec", {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(datos)
        });

        alert("✅ Club registrado. El sistema lo asociará a tu planilla.");
        
        // Cierra el modal y limpia el campo
        cerrarModalClubes();
        document.getElementById('nuevo-club-nombre').value = "";

    } catch (error) {
        // Esto es lo que verás ahora que estás offline
        console.log("Modo Offline: El dato se procesó pero no pudo viajar.");
        alert("❌ Error de conexión. Inténtalo de nuevo.");  
    }
}
