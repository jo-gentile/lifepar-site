// Captura la zona de la URL (ej: ?zona=1)
const urlParams = new URLSearchParams(window.location.search);
window.zonaActivaNum = urlParams.get('zona'); 

// Si por alguna razón la URL no tiene la zona, intentamos recuperarla del título
if (!window.zonaActivaNum) {
    const titulo = document.getElementById('dinamico-titulo');
    if (titulo) window.zonaActivaNum = titulo.innerText.replace(/[^0-9]/g, '');
}
// --- 1. SISTEMA DE CANDADOS (LOCKS) ---
window.toggleLock = function(btn, idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    if (campo.disabled) {
        campo.disabled = false;
        btn.innerText = "🔓";
        btn.classList.remove("locked");
    } else {
        campo.disabled = true;
        btn.innerText = "🔒";
        btn.classList.add("locked");
    }
};

// --- 2. MAPA DE COMPETENCIA ---
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

window.actualizarCascada = function(nivel, numZona) {
    const disc = document.getElementById(`z${numZona}-disciplina`).value;
    const div  = document.getElementById(`z${numZona}-divisional`);
    const cat  = document.getElementById(`z${numZona}-categoria`);

    if (nivel === 'disciplina') {
        div.innerHTML = '<option value="">DIVISIONAL...</option>';
        if (MAPA_COMPETENCIA[disc]) {
            Object.keys(MAPA_COMPETENCIA[disc]).forEach(d => {
                div.innerHTML += `<option value="${d}">${d}</option>`;
            });
        }
        cat.innerHTML = '<option value="">CATEGORÍA...</option>';
    }

    if (nivel === 'divisional') {
        cat.innerHTML = '<option value="">CATEGORÍA...</option>';
        const seleccionada = div.value;
        if (MAPA_COMPETENCIA[disc] && MAPA_COMPETENCIA[disc][seleccionada]) {
            MAPA_COMPETENCIA[disc][seleccionada].forEach(c => {
                cat.innerHTML += `<option value="${c}">${c}</option>`;
            });
        }
    }
};

window.abrirFormularioCarga = async function(numZona) {
    // Si numZona viene vacío o undefined, usamos la variable global
    const zonaReal = numZona || window.zonaActivaNum;
    
    const contenedor = document.getElementById('contenedor-formulario-dinamico');
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    if (!userEmail) return alert("⚠️ No se detectó sesión.");
    if (contenedor.style.display === 'flex') { contenedor.style.display = 'none'; return; }

    contenedor.innerHTML = '<p style="color:gold; text-align:center;">⏳ Cargando Clubes...</p>';
    contenedor.style.display = 'flex';

    try {
        const emailKey = userEmail.replace(/\./g, '_');
        const snapshot = await window.parent.puenteFirebase('get', `CLUBES/${emailKey}`, null);
        const clubesData = (snapshot && typeof snapshot.val === 'function') ? snapshot.val() : null;
        
        let opcionesClub = clubesData ? Object.keys(clubesData).map(key => `<option value="${key}">${key}</option>`).join('') : '<option value="">Sin clubes asociados</option>';

        // Usamos zonaReal en todo el template de abajo
        contenedor.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid gold; padding: 25px; border-radius: 15px; width: 100%; max-width: 500px;">
                <h4 style="color:gold; text-align:center; font-family:'Anton';">📝 NUEVA INSCRIPCIÓN - ZONA ${zonaReal}</h4>
                
                <label>Club</label>
                <div class="lock-group">
                    <select id="z${zonaReal}-club">${opcionesClub}</select>
                    <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${zonaReal}-club')">🔓</button>
                </div>

                <label>Disciplina</label>
                <div class="lock-group">
                    <select id="z${zonaReal}-disciplina" onchange="actualizarCascada('disciplina', ${zonaReal})">
                        <option value="">SELECCIONE...</option>
                        <option value="LIBRE">LIBRE</option>
                        <option value="DANZA">DANZA SOLO</option>
                    </select>
                    <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${zonaReal}-disciplina')">🔓</button>
                </div>

                <label>Divisional</label>
                <div class="lock-group">
                    <select id="z${zonaReal}-divisional" onchange="actualizarCascada('divisional', ${zonaReal})">
                        <option value="">DIVISIONAL...</option>
                    </select>
                    <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${zonaReal}-divisional')">🔓</button>
                </div>

                <label>Categoría</label>
                <div class="lock-group">
                    <select id="z${zonaReal}-categoria">
                        <option value="">CATEGORÍA...</option>
                    </select>
                    <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${zonaReal}-categoria')">🔓</button>
                </div>

                <input id="z${zonaReal}-apellido" placeholder="APELLIDO" class="input-registro" style="margin-top:10px; text-transform:uppercase;">
                <input id="z${zonaReal}-nombre" placeholder="NOMBRE" class="input-registro" style="margin-top:10px; text-transform:uppercase;">
                <input id="z${zonaReal}-DNI" placeholder="DNI" class="input-registro" style="margin-top:10px;">
                <input type="date" id="z${zonaReal}-nacimiento" class="input-registro" style="margin-top:10px;" onchange="calcularEdadDeportiva(this.value, 'z${zonaReal}-edad')">
                <input id="z${zonaReal}-edad" readonly class="input-registro" style="color:gold; text-align:center; margin-top:10px;">

                <button type="button" onclick="enviarCargaPatinador(${zonaReal})" style="margin-top:20px; width:100%; background:gold; font-weight:bold; padding:12px; border:none; border-radius:5px; cursor:pointer;">🚀 CARGAR PATINADOR</button>
            </div>`;
    } catch (e) { console.error(e); }
};

window.limpiarCamposPostCarga = function(numZona) {
    const campos = ['apellido', 'nombre', 'DNI', 'nacimiento', 'edad'];
    campos.forEach(campo => {
        const el = document.getElementById(`z${numZona}-${campo}`);
        if (el) el.value = "";
    });
};

window.calcularEdadDeportiva = (fecha, target) => {
    const anio = new Date(fecha).getFullYear();
    document.getElementById(target).value = (2026 - anio) + " AÑOS";
};

// --- 4. LISTADO DE ALTAS (TARJETAS LINDAS) ---
window.mostrarListadoAltas = async (numZona) => {
    const mailProfe = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
    let contenedor = document.getElementById('contenedor-tarjetas-hijo');
    if(!contenedor){
        contenedor = document.createElement('div');
        contenedor.id = 'contenedor-tarjetas-hijo';
        document.body.appendChild(contenedor);
    }

    Object.assign(contenedor.style, {
        display: 'flex', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.95)', zIndex: '5000', overflowY: 'auto', padding: '20px 0',
        justifyContent: 'center', alignItems: 'flex-start'
    });

    contenedor.innerHTML = '<p style="color:gold; text-align:center; margin-top:50px;">⏳ Organizando Padrón...</p>';

    try {
        const snapshot = await window.parent.puenteFirebase('get', `ZONAS/ZONA_${numZona}`, null);
        if (!snapshot.exists()) {
            contenedor.innerHTML = `<button onclick="this.parentElement.style.display='none'" style="background:gold; padding:15px; margin:50px auto; display:block; border:none; font-weight:bold; cursor:pointer;">CERRAR (No hay datos)</button>`;
            return;
        }

        let patinadores = [];
        snapshot.forEach(h => {
            const p = h.val();
            if(p.mailProfe === mailProfe || mailProfe === 'test@test.com') patinadores.push({id: h.key, ...p});
        });
        patinadores.sort((a,b) => a.apellido.localeCompare(b.apellido));

        let html = `
        <style>
            .modal-altas-cuerpo { width: 90%; max-width: 1100px; border: 2px solid gold; border-radius: 15px; padding: 25px; background: #0a0a0a; position: relative; margin: 20px auto; }
            .btn-x-cerrar { position: absolute; top: -15px; right: -15px; background: gold; width: 35px; height: 35px; border-radius: 50%; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2px solid black; }
            .grid-altas { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
            .card-alta { background: #151515; border-radius: 10px; padding: 15px; border-left: 5px solid gold; color: white; position: relative; }
            .nombre-p { font-weight: bold; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 5px; }
            .datos-p { color: #888; font-size: 0.75rem; margin-bottom: 10px; }
            .btn-f { background: #222; border: 1px solid #444; color: #666; padding: 5px; border-radius: 5px; cursor: pointer; font-size: 0.7rem; flex: 1; font-weight: bold; }
            .btn-f.activo { background: #28a745 !important; color: white !important; border-color: #28a745 !important; }
        </style>
        <div class="modal-altas-cuerpo">
            <div class="btn-x-cerrar" onclick="document.getElementById('contenedor-tarjetas-hijo').style.display='none'">✕</div>
            <h3 style="color:gold; text-align:center; font-family:'Anton';">PADRÓN ZONA ${numZona}</h3>
            <div class="grid-altas">`;

        patinadores.forEach(p => {
            const tieneAnual = p.seguroAnual === true;
            html += `
                <div class="card-alta">
                    <button onclick="window.abrirEditorPatinador('${numZona}','${p.id}')" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer;">📝</button>
                    <div class="nombre-p">${p.apellido}, ${p.nombre}</div>
                    <div class="datos-p">${p.club}<br>${p.categoria}</div>
                    <div style="font-size:0.6rem; color:gold; border-top:1px solid #333; padding-top:5px;">SEGUROS</div>
                    <div style="display:flex; gap:5px; margin-top:5px;">
                        <button class="btn-f ${tieneAnual ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','seguroAnual',this)">ANUAL</button>
                        <button class="btn-f ${p.seguroF2 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','seguroF2',this)">DIARIO</button>
                    </div>
                </div>`;
        });

        html += `</div><button onclick="document.getElementById('contenedor-tarjetas-hijo').style.display='none'" style="width:100%; background:gold; margin-top:20px; padding:15px; font-weight:bold; border-radius:10px; border:none; cursor:pointer;">CERRAR PADRÓN</button></div>`;
        contenedor.innerHTML = html;
    } catch (e) { console.error(e); }
};

// --- 5. GUARDAR DATOS (USANDO PUENTE) ---
window.enviarCargaPatinador = async (numZona) => {
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
    const selectorFecha = document.getElementById('selectorFechaActiva');
    const fechaValor = selectorFecha ? selectorFecha.value : "1"; 

    let marcaAsistencia = {};
    if (fechaValor === "2") marcaAsistencia.asisteF2 = true;
    if (fechaValor === "3") marcaAsistencia.asisteF3 = true;
    if (fechaValor === "4") marcaAsistencia.asisteF4 = true;

    const datos = {
        ...marcaAsistencia,
        club: document.getElementById(`z${numZona}-club`).value,
        disciplina: document.getElementById(`z${numZona}-disciplina`).value,
        divisional: document.getElementById(`z${numZona}-divisional`).value,
        categoria: document.getElementById(`z${numZona}-categoria`).value,
        apellido: document.getElementById(`z${numZona}-apellido`).value.trim().toUpperCase(),
        nombre: document.getElementById(`z${numZona}-nombre`).value.trim().toUpperCase(),
        DNI: document.getElementById(`z${numZona}-DNI`).value.trim(),
        fecha_de_nacimiento: document.getElementById(`z${numZona}-nacimiento`).value,
        edadDeportiva: document.getElementById(`z${numZona}-edad`).value,
        mailProfe: userEmail
    }

    if (!datos.apellido || !datos.nombre || !datos.DNI) return alert("⚠️ Completa Apellido, Nombre y DNI.");

    try {
        // Usamos el nombre exacto del puente que pusimos en admin.js
        await window.parent.puenteFirebase('push', `ZONAS/ZONA_${numZona}`, { 
            ...datos, 
            fecha_registro: new Date().toISOString() 
        });
        
        alert("✅ ¡Registro guardado con éxito!");
        limpiarCamposPostCarga(numZona);
    } catch (error) {
        console.error("Error en el puente:", error);
        alert("❌ Error de permisos o conexión. Revisá el admin.js");
    }
};

window.toggleAsistencia = async (numZona, id, campo, boton) => {
    if (boton.classList.contains('activo')) return; 
    try {
        await window.parent.puenteFirebase('update', `ZONAS/ZONA_${numZona}/${id}`, { [campo]: true });
        boton.classList.add('activo');
        boton.style.pointerEvents = 'none';
    } catch (e) { alert("Error al guardar"); }
};
// --- 6. CONEXIÓN CON EL HTML (BOTONES) ---
window.ejecutarCargaConFecha = function() {
    const selector = document.getElementById('selectorFechaActiva');
    const fecha = selector ? selector.value : "1";
    // Llama a la función que ya tenés en el punto 3
    window.abrirFormularioCarga(window.zonaActivaNum, fecha); 
};

window.ejecutarModalClubes = function() {
    const modal = document.getElementById('ModalClub');
    if(modal) modal.style.display = 'flex';
};
// --- FINAL: EXPOSICIÓN DE FUNCIONES ---
window.abrirModalClubes = () => document.getElementById('ModalClub').style.display = 'block';
window.cerrarModalClubes = () => document.getElementById('ModalClub').style.display = 'none';