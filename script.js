/* ============================================================
   1. FUNCIÓN VER ZONA (Fusión de HTML + JS)
   ============================================================ */
window.verZona = function(numero) {
    console.log("Cargando zona número:", numero);
    const contenedorCentro = document.getElementById('panel-cristal');
    const infoABuscar = document.getElementById('detalle-zona' + numero);

    if (contenedorCentro && infoABuscar) {
        contenedorCentro.innerHTML = ''; 
        
        // Clonamos la zona para que no desaparezca del menú lateral
        const clon = infoABuscar.cloneNode(true);
        
        // QUITAMOS EL ID: Esto evita que el botón falle al segundo click
        clon.removeAttribute('id'); 
        clon.classList.remove('oculto');
        clon.classList.add('visible');
        
        contenedorCentro.appendChild(clon);

        // USAMOS TU SCROLL DEL HTML: Sube suave al principio para ver la info
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error("No encontré el panel o la zona:", numero);
    }
};

/* ============================================================
   2. BOTÓN DE FONDO (Pasado del HTML al JS)
   ============================================================ */
const btnToggle = document.getElementById('toggle-bg');
if (btnToggle) {
    btnToggle.addEventListener('click', () => {
        document.body.classList.toggle('no-background');
        const icono = btnToggle.querySelector('.icono-bg');
        if (icono) {
            // Lógica de cambio de emoji que tenías en el HTML
            icono.innerText = document.body.classList.contains('no-background') ? '✨' : '🖼️';
        }
    });
}
