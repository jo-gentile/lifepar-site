// Definirla así asegura que esté disponible para todo el documento
window.toggleLock = function(btn, idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return; // Seguridad por si el ID no existe

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

function actualizarCascada(nivel, numZona) {
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
}

async function abrirFormularioCarga(numZona) {
    const contenedor = document.getElementById('contenedor-formulario-dinamico');
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    if (!userEmail) {
        alert("⚠️ No se detectó sesión de usuario.");
        return;
    }

    if (contenedor.style.display === 'flex') {
        contenedor.style.display = 'none';
        return;
    }

    contenedor.innerHTML = '<p style="color:gold; text-align:center;">⏳ Conectando con la base de datos...</p>';
    contenedor.style.display = 'flex';

    let opcionesClub = "";

    try {
        const emailKey = userEmail.replace(/\./g, '_');
        // Llamamos al puente del padre para traer los clubes de Firebase
        const clubesData = await parent.obtenerClubesFirebase(emailKey);

        if (clubesData) {
            // Convertimos el objeto de Firebase en opciones del select
            opcionesClub = Object.keys(clubesData).map(key => {
                const nombreLimpio = key.replace(/_/g, ' ');
                return `<option value="${nombreLimpio}">${nombreLimpio}</option>`;
            }).join('');
        } else {
            opcionesClub = '<option value="">Sin clubes asociados</option>';
        }
    } catch (error) {
        console.error("Error al leer Firebase:", error);
        opcionesClub = '<option value="">Error al cargar clubes</option>';
    }

contenedor.innerHTML = `
    <div style="background: rgba(255,255,255,0.05); border: 1px solid #ffd700; padding: 25px; border-radius: 15px; margin-top: 15px;">
        <h4 style="color:#ffd700;text-align:center;font-family:'Anton',sans-serif;">📝 NUEVA INSCRIPCIÓN - ZONA ${numZona}</h4>

        <style>
            .lock-group { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
            .btn-lock { background: #222; border: 1px solid #444; border-radius: 5px; cursor: pointer; padding: 5px; font-size: 1.1rem; color: white; line-height: 1; }
            .btn-lock.locked { border-color: gold; color: gold; background: rgba(255, 215, 0, 0.1); }
            .input-registro { margin-bottom: 0 !important; flex: 1; }
        </style>

        <label>Club</label>
        <div class="lock-group">
            <select id="z${numZona}-club" class="input-registro">${opcionesClub}</select>
            <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${numZona}-club')">🔓</button>
        </div>

        <label>Disciplina</label>
        <div class="lock-group">
            <select id="z${numZona}-disciplina" class="input-registro" onchange="actualizarCascada('disciplina', ${numZona})">
                <option value="">SELECCIONE...</option>
                <option value="LIBRE">LIBRE</option>
                <option value="DANZA">DANZA SOLO</option>
            </select>
            <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${numZona}-disciplina')">🔓</button>
        </div>

        <label>Divisional</label>
        <div class="lock-group">
            <select id="z${numZona}-divisional" class="input-registro" onchange="actualizarCascada('divisional', ${numZona})">
                <option value="">DIVISIONAL...</option>
            </select>
            <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${numZona}-divisional')">🔓</button>
        </div>

        <label>Categoría</label>
        <div class="lock-group">
            <select id="z${numZona}-categoria" class="input-registro">
                <option value="">CATEGORÍA...</option>
            </select>
            <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${numZona}-categoria')">🔓</button>
        </div>

        <input id="z${numZona}-apellido" placeholder="APELLIDO" class="input-registro" style="margin-top:10px;">
        <input id="z${numZona}-nombre" placeholder="NOMBRE" class="input-registro" style="margin-top:10px;">
        <input id="z${numZona}-DNI" placeholder="DNI" class="input-registro" style="margin-top:10px;">
        <input type="date" id="z${numZona}-nacimiento" class="input-registro" style="margin-top:10px;" onchange="calcularEdadDeportiva(this.value, 'z${numZona}-edad')">
        <input id="z${numZona}-edad" readonly class="input-registro" style="color:gold;text-align:center;margin-top:10px;">

        <label>Género</label>
        <div class="lock-group">
            <select id="z${numZona}-genero" class="input-registro" style="height: 35px;">
                <option value="FEMENINO">FEMENINO</option>
                <option value="MASCULINO">MASCULINO</option>
                <option value="NO BINARIO">NO BINARIO</option>
            </select>
            <button type="button" class="btn-lock" onclick="toggleLock(this, 'z${numZona}-genero')">🔓</button>
        </div>

        <button type="button" onclick="enviarCargaPatinador(${numZona})" style="margin-top:20px;width:100%;background:gold;font-weight:bold;color:black;padding:12px;border-radius:5px;border:none;cursor:pointer;">🚀 CARGAR PATINADOR</button>
    </div>`;
}   

function calcularEdadDeportiva(fecha, target) {
    const anio = new Date(fecha).getFullYear();
    document.getElementById(target).value = (2026 - anio) + " AÑOS";
}

async function enviarCargaPatinador(numZona) {
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    // Recolectamos los datos de los inputs
    const datos = {
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

    // Validación básica
    if (!datos.apellido || !datos.nombre || !datos.DNI) {
        alert("⚠️ Por favor, completa Apellido, Nombre y DNI.");
        return;
    }

    try {
        // Llamamos al puente del padre para guardar en Firebase
        if (parent && parent.guardarPatinadorFirebase) {
            await parent.guardarPatinadorFirebase(numZona, datos);
            
            alert("✅ Registro guardado en Firebase (Zona " + numZona + ")");
            
            // Limpiamos los campos que no están bloqueados
            limpiarCamposPostCarga(numZona);
        } else {
            throw new Error("No se pudo conectar con la base de datos.");
        }
    } catch (error) {
        console.error(error);
        alert("❌ Error al guardar: " + error.message);
    }
}

// ESTA FUNCIÓN VA AFUERA (Independiente)
function limpiarCamposPostCarga(numZona) {
    const campos = [
        `z${numZona}-club`,
        `z${numZona}-disciplina`,
        `z${numZona}-divisional`,
        `z${numZona}-categoria`,
        `z${numZona}-genero`,
        `z${numZona}-apellido`,
        `z${numZona}-nombre`,
        `z${numZona}-DNI`,
        `z${numZona}-nacimiento`,
        `z${numZona}-edad`
    ];

    campos.forEach(id => {
        const el = document.getElementById(id);
        // Si el elemento existe y NO está bloqueado por el candado, se limpia
        if (el && !el.disabled) { 
            el.value = "";
        }
    });
}

/* --- CONTROL DEL MODAL DE CLUBES --- */
function abrirModalClubes() { // Cambié el nombre para que el "puente" del HTML la encuentre
    document.getElementById('ModalClub').style.display = 'block';
}

function cerrarModalClubes() {
    document.getElementById('ModalClub').style.display = 'none';
}

async function guardarNuevoClub() {
    const nombreClub = document.getElementById('nuevo-club-nombre').value.trim().toUpperCase();
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    if (!nombreClub || !userEmail) {
        alert("⚠️ Faltan datos (nombre del club o sesión de usuario).");
        return;
    }

    // Limpiamos los puntos para que Firebase no de error en la ruta
    const emailKey = userEmail.replace(/\./g, '_');
    const clubKey = nombreClub.replace(/\./g, '_');

    try {
        // Usamos la función puente que ya tenés creada para hablar con el script type="module" del padre
        await enviarDatosAlPadre(emailKey, clubKey);
        
        alert("✅ Club registrado con éxito en Firebase.");
        document.getElementById('nuevo-club-nombre').value = "";
        cerrarModalClubes();
    } catch (error) {
        console.error(error);
        alert("❌ Error: La base de datos de Firebase no respondió.");
    }
}

// Forzamos que las funciones sean visibles para los botones del HTML
window.abrirModalClubes = abrirModalClubes;
window.cerrarModalClubes = cerrarModalClubes;
window.guardarNuevoClub = guardarNuevoClub;

// 1. ESTILOS INYECTADOS (Para que se vea como la App)
const estilosTarjetas = `
<style>
    .grid-tarjetas {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 15px;
        padding: 15px;
    }
    .tarjeta-patinador {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 15px;
        position: relative;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .tarjeta-patinador h3 { color: #ffd700; margin: 0 0 10px 0; font-size: 1.2rem; }
    .tarjeta-patinador p { color: #ccc; margin: 3px 0; font-size: 0.9rem; }
    
    .selector-fechas {
        display: flex;
        gap: 10px;
        margin-top: 15px;
        border-top: 1px solid #333;
        padding-top: 10px;
    }
    .btn-fecha {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        border: 2px solid #555;
        background: transparent;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
    }
    .btn-fecha.activo {
        background: #28a745;
        border-color: #28a745;
        box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
    }
</style>
`;

async function ejecutarAltas(numZona) {
    const mailProfe = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    if (!mailProfe) {
        alert("⚠️ Sesión no detectada. Volvé a iniciar sesión.");
        return;
    }
    // 1. Buscamos el lugar donde vamos a dibujar (el div central)
    const contenedor = window.parent.document.getElementById('contenedor-acciones-zonas');
        
    if (!contenedor) {
        console.error("Error: No se encontró el contenedor-acciones-zonas en el padre.");
        return;
    }
    
    contenedor.style.display = 'block';
    // 2. Definimos cómo se ven las tarjetas (Diseño interactivo)
    const estilos = `
    <style>
        .grid-tarjetas { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; padding: 20px; }
        .tarjeta { background: #1a1a1a; border: 1px solid #ffd700; border-radius: 15px; padding: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .tarjeta h3 { color: #ffd700; margin: 0 0 5px 0; font-size: 1.1rem; text-transform: uppercase; font-family: 'Anton', sans-serif; }
        .tarjeta p { color: #ccc; margin: 2px 0; font-size: 0.9rem; font-family: 'Quicksand', sans-serif; }
        .botones-f { display: flex; gap: 10px; margin-top: 15px; border-top: 1px solid #333; padding-top: 10px; }
        .btn-f { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #444; background: none; color: white; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-f.activo { background: #28a745; border-color: #28a745; box-shadow: 0 0 10px rgba(40,167,69,0.5); }
    </style>`;
    // 3. Limpiamos y avisamos que estamos cargando
    contenedor.innerHTML = estilos + '<p style="color:gold; text-align:center; font-family:sans-serif;">⏳ Cargando Padrón de Zona ' + numZona + '...</p>';

 // ... (código anterior de ejecutarAltas)

    try {
        console.log("🚀 HIJO: Gritándole al padre por datos de Zona " + numZona);
        
        // --- ESTA ES LA LÍNEA QUE CAMBIAMOS ---
        const puente = window.parent.obtenerPatinadoresPorClub || parent.obtenerPatinadoresPorClub;

        if (!puente) {
            throw new Error("El puente con Firebase no está listo.");
        }

        const patinadores = await puente(numZona, mailProfe);
        // --------------------------------------

        console.log("📥 HIJO: El padre me respondió esto:", patinadores);

        // Si el padre no responde nada (null o undefined)
        if (patinadores === null) {
            throw new Error("El padre respondió NULL (error en el puente)");
        }
        
        // ... (resto del código igual)

        // Si el padre responde pero la zona está vacía para ese profe
        if (Object.keys(patinadores).length === 0) {
            console.warn("⚠️ HIJO: El objeto vino vacío de Firebase.");
            contenedor.innerHTML = '<p style="color:white; text-align:center;">No tenés patinadores en esta zona.</p>';
            return;
        }

        // 5. SI LLEGAMOS ACÁ, DIBUJAMOS LAS TARJETAS
        contenedor.innerHTML = estilos + `
            <div style="padding:10px; display:flex; flex-direction:column; gap:10px;">
                <button onclick="location.reload()" style="background:none; border:none; color:gold; cursor:pointer; text-align:left;">⬅ Volver al menú</button>
                <input type="text" id="buscador" placeholder="🔍 Buscar patinador..." onkeyup="filtrar()" 
                       style="padding:10px; border-radius:10px; background:#000; color:#fff; border:1px solid #444;">
            </div>
            <div class="grid-tarjetas" id="grid"></div>
        `;

        const grid = document.getElementById('grid');
        
        Object.keys(patinadores).forEach(id => {
            const p = patinadores[id];
            const div = document.createElement('div');
            div.className = 'tarjeta';
            div.innerHTML = `
                <h3>${p.apellido}, ${p.nombre}</h3>
                <p>Categoría: ${p.categoria}</p>
                <p>Edad: ${p.edadDeportiva || 'N/A'}</p>
                <div class="botones-f">
                    <button class="btn-f ${p.asisteF2 ? 'activo' : ''}" onclick="toggleAsistencia('${numZona}', '${id}', 'asisteF2', this)">F2</button>
                    <button class="btn-f ${p.asisteF3 ? 'activo' : ''}" onclick="toggleAsistencia('${numZona}', '${id}', 'asisteF3', this)">F3</button>
                    <button class="btn-f ${p.asisteF4 ? 'activo' : ''}" onclick="toggleAsistencia('${numZona}', '${id}', 'asisteF4', this)">F4</button>
                </div>
            `;
            grid.appendChild(div);
        });

    } catch (e) {
        console.error("❌ HIJO: Error capturado:", e);
        contenedor.innerHTML = '<p style="color:red; text-align:center;">Error al conectar con la base de datos.</p>';
    }
}    

// Función auxiliar para que el buscador funcione
function filtrar() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    document.querySelectorAll('.tarjeta').forEach(t => {
        const nombre = t.querySelector('h3').innerText.toLowerCase();
        t.style.display = nombre.includes(texto) ? 'block' : 'none';
    });
}
async function toggleAsistencia(numZona, id, campo, boton) {
    // Si ya es verde (activo), el nuevo estado es false. Si no, es true.
    const nuevoEstado = !boton.classList.contains('activo');
    
    try {
        // Le avisamos al padre que guarde en Firebase
        await parent.actualizarAsistencia(numZona, id, campo, nuevoEstado);
        
        // Si salió bien, cambiamos el color del botón en la pantalla
        boton.classList.toggle('activo');
        
    } catch (error) {
        alert("Error al guardar asistencia. Reintentá.");
    }
}
window.ejecutarAltas = ejecutarAltas;
