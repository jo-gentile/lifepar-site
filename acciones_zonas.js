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
        const URL_GET = `https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec?mail=${userEmail}`;
        const respuesta = await fetch(URL_GET);
        const listaDeClubes = await respuesta.json();

        if (listaDeClubes && listaDeClubes.length > 0) {
            opcionesClub = listaDeClubes.map(c => `<option value="${c}">${c}</option>`).join('');
        } else {
            opcionesClub = '<option value="">Sin clubes asociados</option>';
        }
    } catch {
        opcionesClub = '<option value="CLUB MANUAL">ERROR AL CARGAR - ESCRIBIR ABAJO</option>';
    }

    contenedor.innerHTML = `
    <div style="background: rgba(255,255,255,0.05); border: 1px solid #ffd700; padding: 25px; border-radius: 15px; margin-top: 15px;">
        <h4 style="color:#ffd700;text-align:center;font-family:'Anton',sans-serif;">📝 NUEVA INSCRIPCIÓN - ZONA ${numZona}</h4>

        <label>Club</label>
        <select id="z${numZona}-club" class="input-registro">${opcionesClub}</select>

        <label>Disciplina</label>
        <select id="z${numZona}-disciplina" class="input-registro" onchange="actualizarCascada('disciplina', ${numZona})">
            <option value="">SELECCIONE...</option>
            <option value="LIBRE">LIBRE</option>
            <option value="DANZA">DANZA SOLO</option>
        </select>

        <label>Divisional</label>
        <select id="z${numZona}-divisional" class="input-registro" onchange="actualizarCascada('divisional', ${numZona})">
            <option value="">DIVISIONAL...</option>
        </select>

        <label>Categoría</label>
        <select id="z${numZona}-categoria" class="input-registro">
            <option value="">CATEGORÍA...</option>
        </select>

        <input id="z${numZona}-apellido" placeholder="APELLIDO" class="input-registro">
        <input id="z${numZona}-nombre" placeholder="NOMBRE" class="input-registro">
        <input id="z${numZona}-DNI" placeholder="DNI" class="input-registro">
        <input type="date" id="z${numZona}-nacimiento" class="input-registro" onchange="calcularEdadDeportiva(this.value, 'z${numZona}-edad')">
        <input id="z${numZona}-edad" readonly class="input-registro" style="color:gold;text-align:center;">

        <button onclick="enviarCargaPatinador(${numZona})" style="margin-top:10px;width:100%;background:gold;font-weight:bold;">🚀 CARGAR PATINADOR</button>
    </div>`;
}


function calcularEdadDeportiva(fecha, target) {
    const anio = new Date(fecha).getFullYear();
    document.getElementById(target).value = (2026 - anio) + " AÑOS";
}

async function enviarCargaPatinador(numZona) {
    const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');

    const datos = {
        tipo: "INSCRIPCION",
        nombreZona: window.zonaActiva,
        club: document.getElementById(`z${numZona}-club`).value,
        disciplina: document.getElementById(`z${numZona}-disciplina`).value,
        divisional: document.getElementById(`z${numZona}-divisional`).value,
        categoria: document.getElementById(`z${numZona}-categoria`).value,
        apellido: document.getElementById(`z${numZona}-apellido`).value,
        nombre: document.getElementById(`z${numZona}-nombre`).value,
        DNI: document.getElementById(`z${numZona}-DNI`).value,
        nacimiento: document.getElementById(`z${numZona}-nacimiento`).value,
        edadDeportiva: document.getElementById(`z${numZona}-edad`).value,
        mailProfe: userEmail
    };

    await fetch("https://script.google.com/macros/s/AKfycbyvMXrBXZSGvxDwVGIXib-_CRrf5S9kG_pejm4ccUKMVTCHSHVpWMN1OKlE3zgd8yWc/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(datos)
    });

    alert("✅ Registro enviado");
}
