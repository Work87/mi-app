/**
 * 1-config.js - Configuración global y utilidades básicas
 * Este archivo define las variables globales, constantes y utilidades básicas
 * que serán utilizadas por los demás módulos de la aplicación.
 */

// Variables globales principales
window.vendedores = window.vendedores || [];
window.jefes = window.jefes || [];
window.mensajesInvalidos = window.mensajesInvalidos || [];
window.ventaYaRegistrada = window.ventaYaRegistrada || false;

// Configuración global
window.CONFIG = {
    VERSION: '1.0.2',
    MAX_VENDEDORES: 100,
    MAX_JEFES: 20,
    HORARIOS: ['dia', 'noche'],
    BACKUP_INTERVAL: 60000, // 1 minuto en milisegundos
    MIN_NUMERO: 0,
    MAX_NUMERO: 99,
    DIAS_HISTORICO: 15, // Días de histórico a mantener
    MENSAJE_DURACION: 2000,
    MENSAJES: {
        FILA_ELIMINADA: 'Fila eliminada',
        NO_ELIMINAR_UNICA: 'No se puede eliminar la única fila',
        FILA_NO_VACIA: 'Para borrar, la fila debe estar vacía',
        SELECCIONAR_VENDEDOR: 'Debe seleccionar un vendedor',
        SELECCIONAR_HORARIO: 'Debe seleccionar un horario',
        INGRESAR_NUMERO: 'Debe ingresar un número ganador',
        VENTA_REGISTRADA: 'Venta registrada para'
    }
};

// Historial de datos
window.historialDatos = window.historialDatos || {
    fechas: {},
    ultimaActualizacion: null
};

/**
 * Función para guardar todos los datos en localStorage
 */
function guardarDatos() {
    try {
        // Usar la función obtenerFechaFormateada para mantener consistencia
        const fechaActual = obtenerFechaFormateada();
        
        const datosActuales = {
            vendedores: vendedores,
            jefes: jefes,
            fecha: fechaActual,
            timestamp: new Date().getTime()
        };
        
        // Guardar en historial
        historialDatos.fechas[fechaActual] = datosActuales;
        historialDatos.ultimaActualizacion = fechaActual;
        
        // Limpiar datos antiguos (mantener solo los últimos 15 días)
        const fechas = Object.keys(historialDatos.fechas).sort();
        while (fechas.length > CONFIG.DIAS_HISTORICO) {
            delete historialDatos.fechas[fechas.shift()];
        }
        
        // Guardar datos actuales
        localStorage.setItem('datosLoteria', JSON.stringify(datosActuales));
        
        // Guardar historial
        localStorage.setItem('historialLoteria', JSON.stringify(historialDatos));
        
        // Guardar vendedores
        localStorage.setItem('vendedores', JSON.stringify(vendedores));
        
        console.log("Datos guardados con fecha:", fechaActual);
        mostrarMensaje('Datos guardados correctamente', 'success');
    } catch (error) {
        console.error('Error al guardar datos:', error);
        mostrarMensaje('Error al guardar los datos', 'error');
    }
}

/**
 * Función para cargar todos los datos desde localStorage
 */
function cargarDatos() {
    try {
        // Cargar datos actuales
        const datosGuardados = localStorage.getItem('datosLoteria');
        // Cargar historial
        const historialGuardado = localStorage.getItem('historialLoteria');
        
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            window.vendedores = datos.vendedores || [];
            window.jefes = datos.jefes || [];

            // Verificar y corregir la estructura de los vendedores
            window.vendedores.forEach((vendedor, index) => {
                // Asegurarse de que cada vendedor tenga la propiedad jefes
                if (!vendedor.jefes) {
                    vendedor.jefes = [];
                    console.warn(`Vendedor ${index} no tiene jefes definidos. Inicializando como array vacío.`);
                }

                // Asegurarse de que otras propiedades importantes existan
                if (!vendedor.ventas) vendedor.ventas = [];
                if (!vendedor.nombre) vendedor.nombre = `Vendedor ${index}`;
                if (typeof vendedor.fondo !== 'number') vendedor.fondo = 0;
                if (typeof vendedor.fondoDia !== 'number') vendedor.fondoDia = 0;
                if (typeof vendedor.porcentaje !== 'number') vendedor.porcentaje = 10;
                if (typeof vendedor.precioVenta !== 'number') vendedor.precioVenta = 1000;
            });
        }
        
        if (historialGuardado) {
            window.historialDatos = JSON.parse(historialGuardado);
        }

        // Actualizar las interfaces necesarias si las funciones existen
        if (typeof actualizarListaVendedores === 'function') actualizarListaVendedores();
        if (typeof actualizarListaJefes === 'function') actualizarListaJefes();
        if (typeof actualizarSelectVendedores === 'function') actualizarSelectVendedores();
        if (typeof actualizarSelectJefes === 'function') actualizarSelectJefes();

        mostrarMensaje('Datos cargados correctamente', 'success');
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarMensaje('Error al cargar los datos', 'error');
    }
}

/**
 * Función para exportar el historial completo
 */
function exportarHistorial() {
    try {
        const datosExportados = {
            historialLoteria: JSON.parse(localStorage.getItem('historialLoteria')) || {},
            datosLoteria: JSON.parse(localStorage.getItem('datosLoteria')) || {},
            vendedores: JSON.parse(localStorage.getItem('vendedores')) || []
        };

        const blob = new Blob([JSON.stringify(datosExportados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_loteria_${new Date().toLocaleDateString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarMensaje('Historial exportado correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar historial:', error);
        mostrarMensaje('Error al exportar el historial', 'error');
    }
}

/**
 * Función para importar historial
 */
function importarHistorial(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const datosImportados = JSON.parse(e.target.result);
                if (datosImportados.historialLoteria) {
                    localStorage.setItem('historialLoteria', JSON.stringify(datosImportados.historialLoteria));
                    window.historialDatos = datosImportados.historialLoteria;
                }
                if (datosImportados.datosLoteria) {
                    localStorage.setItem('datosLoteria', JSON.stringify(datosImportados.datosLoteria));
                }
                if (datosImportados.vendedores) {
                    localStorage.setItem('vendedores', JSON.stringify(datosImportados.vendedores));
                    window.vendedores = datosImportados.vendedores;
                }
                
                mostrarMensaje('Historial importado correctamente', 'success');
                
                // Recargar los datos en las interfaces
                if (typeof actualizarListaVendedores === 'function') actualizarListaVendedores();
                if (typeof actualizarListaJefes === 'function') actualizarListaJefes();
                if (typeof actualizarSelectVendedores === 'function') actualizarSelectVendedores();
                if (typeof actualizarSelectJefes === 'function') actualizarSelectJefes();
                
            } catch (error) {
                console.error('Error al procesar el archivo importado:', error);
                mostrarMensaje('Error al procesar el archivo', 'error');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error al importar historial:', error);
        mostrarMensaje('Error al importar el historial', 'error');
    }
}

/**
 * Función para mostrar u ocultar una pestaña
 */
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    if (!tabName) {
        console.warn("Se intentó abrir una pestaña sin nombre");
        return;
    }
    // Ocultar todos los contenidos de pestañas
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    // Quitar la clase "active" de todos los botones
    tablinks = document.getElementsByClassName("nav-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    
    // Verificar si el elemento existe antes de intentar mostrarlo
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.style.display = "block";
    } else {
        console.warn(`Tab content with ID '${tabName}' not found`);
        return; // Salir de la función si no se encuentra el elemento
    }
    
    // Activar el botón si existe
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
    
    // Guardar la pestaña activa en localStorage
    localStorage.setItem("activeTab", tabName);
}

/**
 * Función para cambiar entre modo claro y oscuro
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (typeof updateToggleDarkModeButton === 'function') {
        updateToggleDarkModeButton();
    }
}

/**
 * Función para actualizar el botón de modo oscuro
 */
function updateToggleDarkModeButton() {
    const btn = document.querySelector('.btn-theme');
    if (btn) {
        btn.textContent = document.body.classList.contains('dark-mode')
            ? 'Cambiar a Modo Claro'
            : 'Cambiar a Modo Oscuro';
    }
}

/**
 * Función para limpiar fondos 
 */
function limpiarFondos() {
    // Esta función se puede personalizar según necesidades específicas
    // Por ahora elimina los fondos almacenados en localStorage
    const confirmacion = confirm("¿Estás seguro que deseas borrar todos los fondos de los vendedores?");
    
    if (confirmacion) {
        // Iterar sobre todos los vendedores
        window.vendedores.forEach((vendedor, index) => {
            // Limpiar localStorage para cada vendedor
            localStorage.removeItem(`fondoVendedor_${index}_dia`);
            localStorage.removeItem(`fondoVendedor_${index}_noche`);
            localStorage.removeItem(`fondoVendedor_${index}`);
            
            // Limpiar propiedades en memoria
            if (vendedor.fondosPorHorario) {
                vendedor.fondosPorHorario = {
                    dia: { anterior: 0, actual: 0 },
                    noche: { anterior: 0, actual: 0 }
                };
            }
            
            vendedor.fondo = 0;
        });
        
        // Guardar cambios
        guardarDatos();
        
        // Actualizar UI
        if (typeof actualizarListaVendedores === 'function') {
            actualizarListaVendedores();
        }
        
        // Mostrar mensaje
        mostrarMensaje("Fondos de los vendedores borrados correctamente", "success");
    }
}

/**
 * Función para cerrar modales
 */
function cerrarModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Configura la funcionalidad de arrastrar y soltar para los elementos especificados
 * @param {string} dragSelector - Selector CSS para los elementos arrastrables
 * @param {string} dropSelector - Selector CSS para las zonas donde soltar
 * @param {Function} onDrop - Función a ejecutar cuando se suelta un elemento (recibe el elemento arrastrado y la zona donde se suelta)
 */
function configurarDragAndDrop(dragSelector, dropSelector, onDrop) {
    // Seleccionar todos los elementos arrastrables
    const draggables = document.querySelectorAll(dragSelector);
    // Seleccionar todas las zonas donde soltar
    const dropZones = document.querySelectorAll(dropSelector);
    
    // Configurar cada elemento arrastrable
    draggables.forEach(item => {
        // Hacer el elemento arrastrable
        item.setAttribute('draggable', 'true');
        
        // Evento al comenzar a arrastrar
        item.addEventListener('dragstart', function(e) {
            // Añadir clase para estilo visual
            this.classList.add('dragging');
            // Guardar ID o datos del elemento
            e.dataTransfer.setData('text/plain', this.id || this.dataset.id || '');
            // Efecto visual al arrastrar
            e.dataTransfer.effectAllowed = 'move';
        });
        
        // Evento al terminar de arrastrar
        item.addEventListener('dragend', function() {
            // Quitar clase de estilo
            this.classList.remove('dragging');
        });
    });
    
    // Configurar cada zona donde soltar
    dropZones.forEach(zone => {
        // Evento cuando un elemento arrastrable entra en la zona
        zone.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        // Evento cuando un elemento arrastrable está sobre la zona
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
            // Permitir soltar
            e.dataTransfer.dropEffect = 'move';
        });
        
        // Evento cuando un elemento arrastrable sale de la zona
        zone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        // Evento cuando se suelta un elemento en la zona
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            
            // Quitar clase de estilo
            this.classList.remove('drag-over');
            
            // Obtener ID o datos del elemento
            const itemId = e.dataTransfer.getData('text/plain');
            const draggedItem = document.getElementById(itemId) || 
                                document.querySelector(`[data-id="${itemId}"]`) || 
                                document.querySelector('.dragging');
            
            // Si hay elemento y función de callback, ejecutarla
            if (draggedItem && typeof onDrop === 'function') {
                onDrop(draggedItem, this);
            }
        });
    });
    
    console.log('Drag and drop configurado para', draggables.length, 'elementos y', dropZones.length, 'zonas');
}

// Exportar funciones para acceso global
window.guardarDatos = guardarDatos;
window.cargarDatos = cargarDatos;
window.exportarHistorial = exportarHistorial;
window.importarHistorial = importarHistorial;
window.openTab = openTab;
window.toggleDarkMode = toggleDarkMode;
window.updateToggleDarkModeButton = updateToggleDarkModeButton;
window.limpiarFondos = limpiarFondos;
window.cerrarModal = cerrarModal;
window.openTab = openTab;
window.configurarDragAndDrop = configurarDragAndDrop;