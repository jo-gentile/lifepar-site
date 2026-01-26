let clinicaActiva = "";

window.initClinica = async function (idClinica) {
    clinicaActiva = idClinica;

    // Seteamos el título
    const titulo = document.getElementById("titulo-clinica");
    if(titulo) titulo.innerText = "Inscripción: " + idClinica.replace(/-/g, " ").toUpperCase();

    // Cargamos los clubes y preparamos la tabla
    await cargarClubes();
    construirTabla();

    // Evento del botón de enviar
    const btnEnviar = document.getElementById("btn-enviar-clinica");
    if(btnEnviar) {
        btnEnviar.onclick = enviarClinica; // Usamos onclick para evitar duplicados
    }
};

async function cargarClubes() {
    const select = document.getElementById("select-club-clinica");
    if(!select) return;
    
    select.innerHTML = '<option value="">Seleccioná un club...</option>';

    const mail = sessionStorage.getItem("userEmail") || localStorage.getItem("userEmail");
    if (!mail) return;

    try {
        const emailKey = mail.replace(/\./g, "_");
        
        // LE PEDIMOS AL PADRE LOS CLUBES POR EL PUENTE
        const snapshot = await window.parent.puenteFirebase('get', `CLUBES/${emailKey}`, null);
        
        if (snapshot.exists()) {
            const clubes = snapshot.val();
            Object.keys(clubes).forEach(id => {
                const op = document.createElement("option");
                op.value = id;
                op.textContent = clubes[id].nombre;
                select.appendChild(op);
            });
        }
    } catch (e) {
        console.error("Error cargando clubes:", e);
    }
}

function construirTabla() {
    const tbody = document.getElementById("body-tabla-clinica");
    if(!tbody) return;
    tbody.innerHTML = "";

    // Mantenemos tus 20 filas
    for (let i = 1; i <= 20; i++) {
        tbody.innerHTML += `
            <tr>
                <td>${i}</td>
                <td><input class="nombre" placeholder="Nombre y Apellido"></td>
                <td><input class="categoria" placeholder="Categoría"></td>
                <td><input type="number" class="edad" placeholder="0"></td>
            </tr>
        `;
    }
    
}

async function enviarClinica() {
    const select = document.getElementById("select-club-clinica");
    const club = select.value;
    const nombreClub = select.options[select.selectedIndex].text; // Para guardar el nombre real

    if (!club) return alert("⚠️ Seleccioná un club");

    const filas = document.querySelectorAll("#body-tabla-clinica tr");
    const lista = [];

    filas.forEach(f => {
        const nombre = f.querySelector(".nombre").value.trim();
        if (nombre) {
            lista.push({
                nombre: nombre.toUpperCase(),
                categoria: f.querySelector(".categoria").value.toUpperCase(),
                edad: f.querySelector(".edad").value
            });
        }
    });

    if (!lista.length) return alert("⚠️ No ingresaste ningún patinador");

    try {
        const clubKey = club.replace(/\./g, "_");
        const ruta = `INSCRIPCIONES_CLINICAS/${clinicaActiva}/${clubKey}`;
        const datos = {
            lista,
            fecha_registro: new Date().toISOString(),
            id_clinica: clinicaActiva,
            club: nombreClub
        };

        // LE PEDIMOS AL PADRE QUE GUARDE LA INSCRIPCIÓN
        await window.parent.puenteFirebase('set', ruta, datos);

        alert("✅ Inscripción enviada con éxito.");
        construirTabla(); // Limpiamos la tabla
    } catch (e) {
        console.error("Error al enviar clínica:", e);
        alert("❌ Error al enviar. Revisá la conexión.");
    }
}
window.initClinica("clinica-test"); 
