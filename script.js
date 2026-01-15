// Usamos window. para que el HTML "vea" la función desde afuera
window.verZona = function(numero) {
    const contenedorCentro = document.getElementById('panel-cristal');
    const infoABuscar = document.getElementById('detalle-zona' + numero);
    
   if (contenedorCentro && infoABuscar) {
        contenedorCentro.innerHTML = ''; 
        
        // Clonamos la info
        const clon = infoABuscar.cloneNode(true);
        
        // --- AQUÍ ESTÁ EL TRUCO ---
        // En lugar de forzar 'flex' por código, solo le quitamos la clase que lo oculta
        clon.classList.remove('oculto'); 
        clon.classList.add('visible'); // Asegurate de tener .visible { display: flex !important; } en tu CSS
        
        // Limpiamos cualquier estilo manual que pueda arruinar la transparencia
        clon.style.backgroundColor = "transparent"; 
        
        contenedorCentro.appendChild(clon);
        
        console.log("Éxito: Zona " + numero + " cargada con transparencia.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error("No se encontró el panel o la info.");
    }
};

window.abrirSeccion = function(seccion) {
    document.querySelectorAll('.detalle-zona').forEach(det => {
        det.classList.remove('visible');
    });
    console.log("Abriendo sección: " + seccion);
    const guia = document.getElementById('mensaje-guia');
    if(guia) {
        guia.innerHTML = "<h3>Cargando " + seccion.toUpperCase() + "...</h3>";
    }
};
const btnToggle = document.getElementById('toggle-bg');

if (btnToggle) {
    btnToggle.addEventListener('click', () => {
        console.log("Botón presionado!"); // Esto nos dirá si funciona
        document.body.classList.toggle('no-background');
        
        const icono = btnToggle.querySelector('.icono-bg');
        if (icono) {
            icono.innerText = document.body.classList.contains('no-background') ? '✨' : '🖼️';
        }
    });
} else {
    console.error("No encontré el botón con ID toggle-bg");
}
// --- FUNCIÓN PARA EL BOTÓN DE REGISTRARME ---
window.abrirRegistro = function() {
    console.log("Botón Registrarme clickeado");
    
    // Buscamos los elementos por su ID
    const extra = document.getElementById('seccionRegistroExtra');
    const emailInput = document.getElementById('emailManual');
    const btnVerificar = document.getElementById('btnVerificar');

    // Los mostramos
    if (extra) {
        extra.style.display = 'block';
    }
    if (emailInput) {
        emailInput.style.display = 'block';
    }
    if (btnVerificar) {
        btnVerificar.style.display = 'block';
    }
};