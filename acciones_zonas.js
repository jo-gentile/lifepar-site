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

function actualizarCascada(nivel) {
    const disc = document.getElementById('z${numZona}--disciplina').value;
    const div = document.getElementById('z${numZona}--divisional');
    const cat = document.getElementById('z${numZona}--categoria');

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

async function abrirFormularioCarga(numZona) {
    const contenedor = document.getElementById('contenedor-formulario-dinamico');
    const titulo = document.getElementById('titulo-dinamico-zona');
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    // Guardamos la zona en una variable global para el envío
    window.zonaActivaNum = numZona;
    window.zonaActiva = "ZONA " + numZona;

    if (contenedor.style.display === 'block') {
        contenedor.style.display = 'none';
    } else {
        titulo.innerText = `📝 NUEVA INSCRIPCIÓN - ZONA ${numZona}`;
        contenedor.style.display = 'block';
        
        // Cargamos los clubes solo si el selector está vacío o dice "Cargando..."
        const selectorClub = document.getElementById('reg-club');
        if (selectorClub.options.length <= 1) {
            cargarClubesDinamicos(userEmail);
        }
    }
}

// Nueva función separada para no trabar el dibujo del HTML
async function cargarClubesDinamicos(email) {
    const selectorClub = document.getElementById('reg-club');
    try {
        const URL_GET = `https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec?mail=${email}`;
        const respuesta = await fetch(URL_GET);
        const listaDeClubes = await respuesta.json();
        
        if (listaDeClubes && listaDeClubes.length > 0) {
            selectorClub.innerHTML = listaDeClubes.map(c => `<option value="${c}">${c}</option>`).join('');
        } else {
            selectorClub.innerHTML = '<option value="">Sin clubes registrados</option>';
        }
    } catch (e) {
        selectorClub.innerHTML = '<option value="ERROR">Error al cargar clubes</option>';
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
// 1. FUNCIÓN PARA MOSTRAR EL CARTEL
function abrirModalClubes() {
    // Busca en el documento actual
    let modal = document.getElementById('ModalClub');
    
    // Si no lo encuentra, busca en la página padre (por si acaso)
    if (!modal) {
        modal = window.parent.document.getElementById('ModalClub');
    }

    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error("Error: No se encontró el div con ID 'ModalClub' en ningún lado.");
        alert("Error de sistema: El componente ModalClub no fue detectado.");
    }
}

// 2. FUNCIÓN PARA CERRAR EL CARTEL
function cerrarModalClubes() {
    const modal = document.getElementById('ModalClub');
    if (modal) {
        modal.style.display = 'none';
    }
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
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
    
    const datos = {
        tipo: "INSCRIPCION",
        nombreZona: window.zonaActiva,
        club: document.getElementById('reg-club').value,
        disciplina: document.getElementById('reg-disciplina').value,
        divisional: document.getElementById('reg-divisional').value,
        categoria: document.getElementById('reg-categoria').value,
        apellido: document.getElementById('reg-apellido').value.toUpperCase(),
        nombre: document.getElementById('reg-nombre').value.toUpperCase(),
        DNI: document.getElementById('reg-DNI').value,
        nacimiento: document.getElementById('reg-nacimiento').value,
        edadDeportiva: document.getElementById('reg-edad').value,
        mailProfe: userEmail
    };

    try {
        await fetch("https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec", { 
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(datos)
        });

        alert("✅ Registro enviado a la " + window.zonaActiva);
        limpiarFormularioPostCarga();

    } catch (error) {
        console.error("Error al enviar:", error);
        alert("❌ Hubo un problema al conectar con la planilla.");
    }
}

function limpiarFormularioPostCarga() {
    const campos = ['reg-apellido', 'reg-nombre', 'reg-DNI', 'reg-nacimiento', 'reg-edad'];
    campos.forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = "";
    });
    console.log("Campos de patinador vaciados correctamente.");
}