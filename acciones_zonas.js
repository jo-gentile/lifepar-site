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
    "FREE DANCE": {
        "Lifedance": ["Advanced", "Elemental"],
        "Gonzalez Molina": ["Basico", "Avanzado"],
        "Nacional": ["Basico", "Intermedio", "Promocional WS"],
        "Nacional Elite": ["Junior B", "Senior B", "Leyenda"],
        "WS": ["WS"]
    },
    "DUOS": {
        "C": ["Bronce", "Plata", "Oro", "Platinum"]
    },
    "TRIOS": {
        "C": ["Bronce", "Plata", "Oro", "Platinum"]
    },
    "GRUPOS": {
        "LIFEPAR": ["Exhibicion"],
        "SMALL NACIONAL": ["Infantil", "Junior", "Senior"],
        "LARGE NACIONAL": ["Cadete", "Senior"],
        "CUARTETO NACIONAL": ["Infantil", "Junior", "Senior"],
        "PRECISION NACIONAL": ["Infantil", "Junior", "Senior"]
    },
    "GRUPOS WS": {
        "SMALL WS": ["Junior", "Senior"],
        "LARGE WS": ["Junior", "Senior"],
        "PRECISION WS": ["Junior", "Senior"],
        "CUARTETO WS": ["Cadete", "Junior", "Senior"]
    },
    "PAREJAS DANZA": {
        "Lifedance": ["Advanced", "Elemental"],
        "Gonzalez Molina": ["Basico", "Avanzado"],
        "Nacional": ["Basico", "Intermedio", "Promocional WS"],
        "Nacional Elite": ["Junior B", "Senior B", "Leyenda"],
        "WS": ["WS"]
    },
    "PAREJAS MIXTA": {
        "Roberto Rodriguez": ["Tots", "Mini Infantil", "Infantiles", "Cadete", "Juvenil", "Junior", "Senior"],
        "Gonzalez Molina": ["Tots", "Mini Infantil", "Infantiles", "Cadete", "Juvenil", "Junior", "Senior"],
        "Sub B" : ["Tots", "Mini Infantil", "Infantiles", "Cadete", "Juvenil", "Junior", "Senior"],
        "Sub A" :["Tots", "Mini Infantil", "Infantiles", "Cadete", "Juvenil/Youth", "Junior", "Senior"],
        "WS" : ["Junior", "Senior"]
    },
    "IN LINE": {
        "C": ["Basico", "Preliminar"],
        "B": ["Intermedio"],
        "A": ["Avanzado"]
    },
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

// Bloque a insertar en el innerHTML de tu función abrirFormularioCarga
contenedor.innerHTML = `
<div style="background: rgba(0,0,0,0.85); border: 1px solid gold; border-radius: 15px; padding: 12px; width: 95%; max-width: 560px; margin: auto;">

  <h4 style="color: gold; text-align: center; font-family: 'Anton'; margin-bottom: 10px;">
    📝 INSCRIPCIÓN ZONA ${zonaReal}
  </h4>

  <!-- CLUB -->
  <label>CLUB</label>
  <div style="display:flex; gap:5px; margin-bottom:6px;">
    <select id="z${zonaReal}-club" class="campo-form">
      ${opcionesClub}
    </select>
    <button onclick="toggleLock(this,'z${zonaReal}-club')">🔓</button>
  </div>

  <!-- DISCIPLINA / DIVISIONAL -->
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
    <div>
      <label>DISCIPLINA</label>
      <div style="display:flex; gap:5px;">
        <select id="z${zonaReal}-disciplina" class="campo-form"
              onchange="actualizarCascada('disciplina', ${zonaReal})">
              <option value="">DISCIPLINA...</option>
              ${Object.keys(MAPA_COMPETENCIA).map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
        <button onclick="toggleLock(this,'z${zonaReal}-disciplina')">🔓</button>
      </div>
    </div>

    <div>
      <label>DIVISIONAL</label>
      <div style="display:flex; gap:5px;">
        <select id="z${zonaReal}-divisional" class="campo-form"
          onchange="actualizarCascada('divisional', ${zonaReal})">
          <option value="">DIVISIONAL...</option>
        </select>
        <button onclick="toggleLock(this,'z${zonaReal}-divisional')">🔓</button>
      </div>
    </div>
  </div>

  <!-- CATEGORIA / GENERO -->
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
    <div>
      <label>CATEGORÍA</label>
      <div style="display:flex; gap:5px;">
        <select id="z${zonaReal}-categoria" class="campo-form">
          <option value="">CATEGORÍA...</option>
        </select>
        <button onclick="toggleLock(this,'z${zonaReal}-categoria')">🔓</button>
      </div>
    </div>

<!-- GENERO (INDEPENDIENTE) -->
<div>
  <label>GÉNERO</label>
  <div class="campo-flex">
    <select id="z${zonaReal}-genero" class="campo-form">
      <option value="">GÉNERO...</option>
      <option value="FEMENINO">FEMENINO</option>
      <option value="MASCULINO">MASCULINO</option>
      <option value="NO BINARIO">NO BINARIO</option>
    </select>
    <button onclick="toggleLock(this,'z${zonaReal}-genero')">🔓</button>
  </div>
</div>



  <!-- APELLIDO / NOMBRE -->
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
    <div>
      <label>APELLIDO</label>
      <input id="z${zonaReal}-apellido" class="campo-form" style="text-transform:uppercase;">
    </div>
    <div>
      <label>NOMBRE</label>
      <input id="z${zonaReal}-nombre" class="campo-form" style="text-transform:uppercase;">
    </div>
  </div>

  <!-- DNI / NACIMIENTO -->
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
    <div>
      <label>DNI</label>
      <input id="z${zonaReal}-DNI" class="campo-form">
    </div>
    <div>
      <label>NACIMIENTO</label>
      <input type="date" id="z${zonaReal}-nacimiento" class="campo-form"
        onchange="calcularEdadDeportiva(this.value,'z${zonaReal}-edad')">
    </div>
  </div>

  <!-- EDAD -->
  <div style="text-align:center; margin-top:6px;">
    <label>EDAD DEPORTIVA</label>
    <input id="z${zonaReal}-edad" readonly
      style="background:none; border:none; color:gold; font-weight:bold; text-align:center;">
  </div>

  <button onclick="enviarCargaPatinador(${zonaReal})"
    style="width:100%; margin-top:10px; background:gold; color:black; font-weight:bold; padding:10px; border:none; border-radius:6px;">
    🚀 CARGAR
  </button>

</div>
`;

    } catch (e) { console.error(e); }
};

window.limpiarCamposPostCarga = function(numZona) {
    // Listado de todos los IDs que pueden tener datos
    const campos = [
        'club', 'disciplina', 'divisional', 'categoria', 
        'apellido', 'nombre', 'DNI', 'nacimiento', 'edad'
    ];

    campos.forEach(id => {
        const el = document.getElementById(`z${numZona}-${id}`);
        
        // REGLA: Solo limpia si el campo existe y NO está bloqueado (disabled)
        if (el && !el.disabled) {
            // Si es un select, vuelve a la primera opción, si es input, vacía el texto
            if (el.tagName === 'SELECT') {
                el.selectedIndex = 0;
            } else {
                el.value = "";
            }
        }
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
        backgroundColor: 'rgba(0,0,0,0.95)', zIndex: '5000', padding: '20px 0',
        justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto'
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
            .modal-altas-cuerpo { width: 95%; max-width: 1100px; border: 2px solid gold; border-radius: 15px; padding: 25px; background: #0a0a0a; position: relative; margin: 20px auto; }
            .btn-x-cerrar { position: absolute; top: -15px; right: -15px; background: gold; width: 35px; height: 35px; border-radius: 50%; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2px solid black; z-index:10; }
            .grid-altas { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; margin-top: 20px; }
            .card-alta { background: #151515; border-radius: 10px; padding: 15px; border-left: 5px solid gold; color: white; position: relative; }
            .nombre-p { font-weight: bold; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 5px; padding-right: 25px; }
            .datos-p { color: #888; font-size: 0.75rem; margin-bottom: 10px; line-height: 1.2; }
            .btn-f { background: #222; border: 1px solid #444; color: #ccc; padding: 5px; border-radius: 5px; cursor: pointer; font-size: 0.65rem; flex: 1; font-weight: bold; }
            .btn-f.activo { background: #28a745 !important; color: white !important; border-color: #28a745 !important; }
            .input-busqueda { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid gold; background: #1a1a1a; color: white; margin-top: 15px; font-size: 1rem; }
        </style>
        <div class="modal-altas-cuerpo">
            <div class="btn-x-cerrar" onclick="document.getElementById('contenedor-tarjetas-hijo').style.display='none'">✕</div>
            <h3 style="color:gold; text-align:center; font-family:'Anton'; margin:0;">PADRÓN ZONA ${numZona}</h3>
            
            <input type="text" id="busqueda-patinador" class="input-busqueda" placeholder="🔍 Buscar por Apellido, Nombre o Club..." onkeyup="window.filtrarPadron()">

            <div class="grid-altas" id="grid-tarjetas-padron">`;

        patinadores.forEach(p => {
            const tieneAnual = p.seguroAnual === true;
            html += `
                <div class="card-alta">
                    <button onclick="window.abrirEditorPatinador('${numZona}','${p.id}')" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:1.2rem;">📝</button>
                    <div class="nombre-p">${p.apellido}, ${p.nombre}</div>
                    <div class="datos-p">
                        ${p.club}<br>
                        ${p.categoria} — <span style="color:gold;">${p.edadDeportiva}</span>
                    </div>
                    
                    <div style="font-size:0.6rem; color:gold; border-top:1px solid #333; padding-top:5px; margin-top:5px;">SEGUROS</div>
                    <div style="display:flex; flex-direction:column; gap:5px; margin-top:5px;">
                        <button class="btn-f ${tieneAnual ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','seguroAnual',this)">ANUAL</button>
                        <div style="display:flex; gap:3px;">
                            <button class="btn-f ${p.seguroSD1 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','seguroSD1',this)">SD1</button>
                            <button class="btn-f ${p.seguroSD2 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','seguroSD2',this)">SD2</button>
                            <button class="btn-f ${p.seguroSD3 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','seguroSD3',this)">SD3</button>
                            <button class="btn-f ${p.seguroSD4 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','seguroSD4',this)">SD4</button>
                        </div>
                    </div>

                    <div style="font-size:0.6rem; color:gold; border-top:1px solid #333; padding-top:5px; margin-top:8px;">FECHAS / DOCS</div>
                    <div style="display:flex; gap:3px; margin-top:5px;">
                        <button class="btn-f ${p.F2 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','F2',this)">F2</button>
                        <button class="btn-f ${p.F3 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','F3',this)">F3</button>
                        <button class="btn-f ${p.F4 ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','F4',this)">F4</button>
                    </div>
                    <div style="display:flex; gap:3px; margin-top:3px;">
                        <button class="btn-f ${p.dniFisico ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','dniFisico',this)">DNI</button>
                        <button class="btn-f ${p.certMedico ? 'activo' : ''}" onclick="window.toggleAsistencia('${numZona}','${p.id}','certMedico',this)">CERT</button>
                    </div>
                </div>`;
        });

        html += `</div><button onclick="document.getElementById('contenedor-tarjetas-hijo').style.display='none'" style="width:100%; background:gold; margin-top:20px; padding:15px; font-weight:bold; border-radius:10px; border:none; cursor:pointer; color:black;">CERRAR PADRÓN</button></div>`;
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
  genero: document.getElementById(`z${numZona}-genero`).value,
  apellido: document.getElementById(`z${numZona}-apellido`).value.trim().toUpperCase(),
  nombre: document.getElementById(`z${numZona}-nombre`).value.trim().toUpperCase(),
  DNI: document.getElementById(`z${numZona}-DNI`).value.trim(),
  fecha_de_nacimiento: document.getElementById(`z${numZona}-nacimiento`).value,
  edadDeportiva: document.getElementById(`z${numZona}-edad`).value,
  mailProfe: userEmail
};

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
    const estaActivo = boton.classList.contains('activo');
    const nuevoEstado = !estaActivo; // Ahora permitimos DESMARCAR (mejor para errores)

    let actualizaciones = { [campo]: nuevoEstado };

    // REGLA MAESTRA DE SEGUROS
    if (campo === 'seguroAnual' && nuevoEstado === true) {
        // Si pongo ANUAL, apago todos los diarios
        actualizaciones['seguroSD1'] = false;
        actualizaciones['seguroSD2'] = false;
        actualizaciones['seguroSD3'] = false;
        actualizaciones['seguroSD4'] = false;
    } 
    else if (campo.startsWith('seguroSD') && nuevoEstado === true) {
        // Si pongo cualquier Diario (SD), apago el Anual
        actualizaciones['seguroAnual'] = false;
    }

    try {
        await window.parent.puenteFirebase('update', `ZONAS/ZONA_${numZona}/${id}`, actualizaciones);
        window.mostrarListadoAltas(numZona);
    } catch (e) {
        alert("Error al actualizar");
    }
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

window.guardarNuevoClub = async function() {
    // Corregimos el ID para que sea igual al de tu HTML
    const input = document.getElementById('nuevo-club-nombre');
    const nombreClub = input ? input.value.trim().toUpperCase() : "";
    const userEmail = sessionStorage.getItem('userEmail');

    if (!nombreClub || !userEmail) return alert("⚠️ Datos incompletos");

    const emailKey = userEmail.replace(/\./g, '_');

    try {
        // Orden al padre para escribir
        await window.parent.puenteFirebase('update', `CLUBES/${emailKey}`, {
            [nombreClub]: true
        });

        alert("✅ Club '" + nombreClub + "' guardado correctamente.");
        
        // Limpiar y cerrar
        input.value = "";
        window.cerrarModalClubes();
        
        // Refrescar el selector de inscripción
        if (typeof window.abrirFormularioCarga === 'function') {
            window.abrirFormularioCarga(window.zonaActivaNum);
        }
    } catch (e) {
        console.error(e);
        alert("❌ Error al guardar el club.");
    }
};
window.abrirEditorPatinador = async function(numZona, idPatinador) {
    document.getElementById('contenedor-tarjetas-hijo').style.display = 'none';
    
    if (document.getElementById('contenedor-formulario-dinamico').style.display !== 'flex') {
        await window.abrirFormularioCarga(numZona);
    }

    try {
        const snapshot = await window.parent.puenteFirebase('get', `ZONAS/ZONA_${numZona}/${idPatinador}`, null);
        const p = snapshot.val();

        if (p) {
            // Llenado de campos... (mantené lo que ya tenías)
            document.getElementById(`z${numZona}-club`).value = p.club || "";
            document.getElementById(`z${numZona}-disciplina`).value = p.disciplina || "";
            window.actualizarCascada('disciplina', numZona);
            document.getElementById(`z${numZona}-divisional`).value = p.divisional || "";
            window.actualizarCascada('divisional', numZona);
            document.getElementById(`z${numZona}-categoria`).value = p.categoria || "";
            document.getElementById(`z${numZona}-genero`).value = p.genero || "";
            document.getElementById(`z${numZona}-apellido`).value = p.apellido || "";
            document.getElementById(`z${numZona}-nombre`).value = p.nombre || "";
            document.getElementById(`z${numZona}-DNI`).value = p.DNI || "";
            document.getElementById(`z${numZona}-nacimiento`).value = p.fecha_de_nacimiento || "";
            document.getElementById(`z${numZona}-edad`).value = p.edadDeportiva || "";

            // --- MANEJO DE BOTONES ---
            // 1. Buscamos el botón de CARGAR (el del cohete) y lo ocultamos
            const btnCargarOriginal = document.querySelector(`#contenedor-formulario-dinamico button[onclick^="enviarCargaPatinador"]`);
            if (btnCargarOriginal) btnCargarOriginal.style.display = 'none';

            // 2. Buscamos si ya existe un botón de ACTUALIZAR para no duplicarlo
            let btnAct = document.getElementById('btn-actualizar-dinamico');
            if (!btnAct) {
                btnAct = document.createElement('button');
                btnAct.id = 'btn-actualizar-dinamico';
                btnAct.style = "width:100%; margin-top:10px; background:#28a745; color:white; font-weight:bold; padding:10px; border:none; border-radius:6px; cursor:pointer;";
                // Insertamos el botón verde debajo de la edad
                const contenedor = document.querySelector('#contenedor-formulario-dinamico > div');
                contenedor.appendChild(btnAct);
            }
            
            btnAct.innerText = "💾 ACTUALIZAR DATOS";
            btnAct.style.display = 'block'; // Aseguramos que se vea
            btnAct.onclick = () => window.actualizarPatinador(numZona, idPatinador);

            document.getElementById('contenedor-formulario-dinamico').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (e) { console.error(e); }
};

// Función para guardar los cambios
// Función para guardar los cambios
window.actualizarPatinador = async function(numZona, idPatinador) {
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
    
    const datosModificados = {
        club: document.getElementById(`z${numZona}-club`).value,
        disciplina: document.getElementById(`z${numZona}-disciplina`).value,
        divisional: document.getElementById(`z${numZona}-divisional`).value,
        categoria: document.getElementById(`z${numZona}-categoria`).value,
        genero: document.getElementById(`z${numZona}-genero`).value,
        apellido: document.getElementById(`z${numZona}-apellido`).value.trim().toUpperCase(),
        nombre: document.getElementById(`z${numZona}-nombre`).value.trim().toUpperCase(),
        DNI: document.getElementById(`z${numZona}-DNI`).value.trim(),
        fecha_de_nacimiento: document.getElementById(`z${numZona}-nacimiento`).value,
        edadDeportiva: document.getElementById(`z${numZona}-edad`).value,
        mailProfe: userEmail,
        ultima_edicion: new Date().toISOString()
    };

    try {
        await window.parent.puenteFirebase('update', `ZONAS/ZONA_${numZona}/${idPatinador}`, datosModificados);
        
        // Ocultamos formulario y botón verde
        document.getElementById('contenedor-formulario-dinamico').style.display = 'none';
        document.getElementById('btn-actualizar-dinamico').style.display = 'none';
        
        // Mostramos el cohete de nuevo
        const btnCargarOriginal = document.querySelector(`#contenedor-formulario-dinamico button[onclick^="enviarCargaPatinador"]`);
        if (btnCargarOriginal) btnCargarOriginal.style.display = 'block';

        limpiarCamposPostCarga(numZona);
        alert("✅ Datos actualizados.");

        // Volvemos a las tarjetas
        setTimeout(() => { window.mostrarListadoAltas(numZona); }, 300);
    } catch (e) { 
        alert("❌ Error al actualizar."); 
    }
}; // <--- ASEGURATE DE QUE ESTA LLAVE ESTÉ
window.filtrarPadron = function() {
    const input = document.getElementById('busqueda-patinador');
    const filtro = input.value.toUpperCase();
    const tarjetas = document.querySelectorAll('.card-alta');

    tarjetas.forEach(tarjeta => {
        const textoTarjeta = tarjeta.innerText.toUpperCase();
        if (textoTarjeta.indexOf(filtro) > -1) {
            tarjeta.style.display = "";
        } else {
            tarjeta.style.display = "none";
        }
    });
};
// --- FINAL: EXPOSICIÓN DE FUNCIONES ---
window.abrirModalClubes = () => document.getElementById('ModalClub').style.display = 'block';
window.cerrarModalClubes = () => document.getElementById('ModalClub').style.display = 'none';