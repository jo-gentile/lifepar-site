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
// Control del fondo
const btn = document.getElementById('toggle-bg');
if (btn) {
    btn.addEventListener('click', () => {
        document.body.classList.toggle('no-background');
        const estado = document.body.classList.contains('no-background');
        localStorage.setItem('fondo-desactivado', estado);
    });
} // <--- Asegurate que acá también cierre bien.