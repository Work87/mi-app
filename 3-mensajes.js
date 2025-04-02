/**
 * 3-mensajes.js - Sistema de mensajes y patrones
 * Este archivo contiene el sistema de notificaciones y los patrones
 * para procesar mensajes de ventas y jugadas.
 */

// Patrones de formato válidos
const patrones = {
    // Formatos básicos originales
    numeroSimple: /^\d{1,2}[-.+=, /;]+\d+$/,                      // 25-10
    linea: /^l(?:inea)?(?:[-., /]+\d{1,2}){1,2}[-.+=, /]+(?:con[-.,]*)*\d+$/i, // Linea-80-20 / L-01-10-05 / l-0-10-5 / l-0-20-5
    decena: /^dece(?:na)?[-., /]+\d{1,2}[-.+=, /]+(?:con[-.,]*)*\d+$/i,        // decena-80-20
    terminal: /^(?:t(?:erminal)?[-.+=, /]+(?:0?\d|00)[-., /]+(?:con[-.,/]*)*\d+)$/i,   // Terminal-5-10
    pareja: /^(?:p(?:areja)?[-.+=, /]+(?:con[-.,]*)*\d+)$/i,                   // Pareja-10

    // Números separados por comas con monto
    numerosComaMonto: /^\d{1,3}(?:[-.+=, /]+\d{1,3})*\d+$/i,        // 37,98,1000

    // Números con "con"
    conSimple: /^\d{1,3}-con-\d+$/i,                        // 10-con-100

    // Múltiples números con "con"
    multiplesCon: /^(?:\d{1,3}(?:[-.+=, /]+\d{1,3})*)-con-\d+$/i,// 35 36 37 57-con-20
    // 54-96-con-50
    // 46-98-83-12-07-58-con-10

    // Tres números separados por guion
    tresNumeros: /^(?:\d{1,2}[-.+=, /]+)+\d+$/i,              // 04-10-17

    // Formatos especiales adicionales
    terminalMultiple: /^t(?:erminal)?-(?:0?\d|00)(?:[-.+=, /]+(?:0?\d|00))*[-.+=, /]+(?:con[-.,]*)*\d+$/i,
    lineaConY: /^(?:l(?:inea)?-\d{1,2}-y-\d{1,2}[-.+=, /]+(?:con[-.,]*)*\d+)$/i,
    rangoConMonto: /^\d{1,2}-\d{1,2}-\d+\/\d+$/,

    // Nuevos formatos de terminal al, parejas al, y numero al numero
    terminalAl: /^(?:0?[1-9]|10)[-_\s]*al[-_\s]*(?:9[1-9]|100|00)[-.,+=, /]+(?:con[-.,]*)*\d+$/i,
    parejasAl: /^(?:11|00|100)[-_\s]*al[-_\s]*(?:00|99|100|109)[-_\s]*(?:con)[-_\s]*\d+$/i,
    numeroAlNumero: /^(?:del[-\s]*)?\d+\W+aL\W+\d+\W*(?:c|con)*\W*\d+$/i,
    // Detecta números solitarios de 3 o más dígitos
    numeroSolitario: /^\d{3,}$/i,
};

// Función para mostrar mensajes
/**
 * Muestra un mensaje temporal en la interfaz
 * @param {string} mensaje - Texto del mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje: 'info', 'error', 'success', 'warning'
 * @param {Object} opciones - Opciones adicionales
 * @param {number} opciones.duracion - Duración en ms antes de que desaparezca (0 para no desaparecer)
 * @param {boolean} opciones.cerrable - Si es true, muestra un botón para cerrar el mensaje
 * @param {Function} opciones.onClose - Callback que se ejecuta cuando el mensaje se cierra
 * @returns {HTMLElement} - El elemento del mensaje creado
 */

function mostrarMensaje(mensaje, tipo = 'info', opciones = {}) {
    // Configuración por defecto
    const config = {
        duracion: opciones.duracion !== undefined ? opciones.duracion : 5000,
        cerrable: opciones.cerrable !== undefined ? opciones.cerrable : false,
        onClose: opciones.onClose || null
    };
    
    // Crear o obtener el contenedor de mensajes
    const contenedor = document.querySelector('.mensajes-container') || crearContenedorMensajes();
    
    // Crear el elemento del mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje mensaje-${tipo}`;
    mensajeElement.setAttribute('role', 'alert'); // Para accesibilidad
    
    // Crear el contenido del mensaje
    const contenidoElement = document.createElement('div');
    contenidoElement.className = 'mensaje-contenido';
    contenidoElement.textContent = mensaje;
    mensajeElement.appendChild(contenidoElement);
    
    // Añadir botón de cierre si es cerrable
    if (config.cerrable) {
        const botonCerrar = document.createElement('button');
        botonCerrar.className = 'mensaje-cerrar';
        botonCerrar.innerHTML = '&times;';
        botonCerrar.setAttribute('aria-label', 'Cerrar mensaje');
        botonCerrar.onclick = () => cerrarMensaje(mensajeElement, config.onClose);
        mensajeElement.appendChild(botonCerrar);
    }
    
    // Estilos según el tipo de mensaje
    const estilos = {
        info: {
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            borderLeft: '4px solid #1565c0',
            icon: '&#9432;' // Símbolo de información
        },
        error: {
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderLeft: '4px solid #c62828',
            icon: '&#9888;' // Símbolo de advertencia
        },
        success: {
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderLeft: '4px solid #2e7d32',
            icon: '&#10004;' // Símbolo de check
        },
        warning: {
            backgroundColor: '#fff8e1',
            color: '#f57f17',
            borderLeft: '4px solid #f57f17',
            icon: '&#9888;' // Símbolo de advertencia
        }
    };
    
    // Aplicar estilos según el tipo
    const estilo = estilos[tipo] || estilos.info;
    Object.assign(mensajeElement.style, {
        backgroundColor: estilo.backgroundColor,
        color: estilo.color,
        borderLeft: estilo.borderLeft,
        padding: '12px 20px',
        margin: '8px 0',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: '0',
        transform: 'translateY(-10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
    });
    
    // Añadir icono si está disponible
    if (estilo.icon) {
        const iconoElement = document.createElement('span');
        iconoElement.className = 'mensaje-icono';
        iconoElement.innerHTML = estilo.icon;
        iconoElement.style.marginRight = '10px';
        iconoElement.style.fontSize = '18px';
        // Insertar antes del contenido
        mensajeElement.insertBefore(iconoElement, contenidoElement);
    }
    
    // Añadir estilos para los botones de cierre
    if (config.cerrable) {
        const botonCerrar = mensajeElement.querySelector('.mensaje-cerrar');
        Object.assign(botonCerrar.style, {
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: '20px',
            cursor: 'pointer',
            marginLeft: '15px',
            padding: '0 5px',
            opacity: '0.7'
        });
    }
    
    // Agregar al contenedor
    contenedor.appendChild(mensajeElement);
    
    // Forzar un reflow para que la animación funcione correctamente
    void mensajeElement.offsetWidth;
    
    // Mostrar con animación
    mensajeElement.style.opacity = '1';
    mensajeElement.style.transform = 'translateY(0)';
    
    // Configurar la eliminación automática si hay duración
    if (config.duracion > 0) {
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                cerrarMensaje(mensajeElement, config.onClose);
            }
        }, config.duracion);
    }
    
    return mensajeElement;
}
 
// Función para agregar estilos de mensajes
function agregarEstilosMensajes() {
    // Verificar si los estilos ya existen
    if (document.getElementById('mensajes-styles')) return;

    const style = document.createElement('style');
    style.id = 'mensajes-styles';
    style.textContent = `
        .mensajes-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 300px;
        }

        .mensaje {
            padding: 10px 20px;
            margin: 5px 0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            opacity: 1;
            transition: opacity 0.5s ease;
        }

        .mensaje-success {
            background-color: #e8f5e9;
            color: #2e7d32;
            border-left: 4px solid #2e7d32;
        }

        .mensaje-error {
            background-color: #ffebee;
            color: #c62828;
            border-left: 4px solid #c62828;
        }

        .mensaje-info {
            background-color: #e3f2fd;
            color: #1565c0;
            border-left: 4px solid #1565c0;
        }

        .dark-mode .mensaje-success {
            background-color: #1b5e20;
            color: #fff;
        }

        .dark-mode .mensaje-error {
            background-color: #b71c1c;
            color: #fff;
        }

        .dark-mode .mensaje-info {
            background-color: #0d47a1;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}

function limpiarTexto(texto) {
    return texto
        .replace(/\s+/g, ' ')            // Múltiples espacios a uno
        .replace(/\s*,\s*/g, ',')        // Limpiar espacios alrededor de comas
        .replace(/\s+-\s+/g, '-')        // Limpiar espacios alrededor de guiones
        .replace(/\s+con\s+/g, '-con-')  // Normalizar formato "con"
        .trim();
}

// Función de pre-procesamiento de patrones
function preProcesarPatrones() {
    // Obtener el texto del campo de entrada
    let mensajeVenta = document.getElementById('mensajeVenta').value;

    // Procesar cada línea del texto
    mensajeVenta = mensajeVenta.split('\n').map(line => {
        // 1. Reemplazos básicos
        line = line
            // Reemplazar 'o' por '0' si está al lado de un número
            .replace(/o(?=\d)|(?<=\d)o/g, '0')

            // Procesar números mayores al inicio de línea
            .replace(/(?:Total|TOTAL)[-_.:,;\s=]+(\d+)\s*\n\s*\1/gi, 'Total: $1')

            // Eliminar espacios adicionales
            .replace(/\s+/g, ' ')

            // Reemplazar Pj- por P-
            .replace(/Pj-/g, 'P-')

            // Nuevos patrones de reemplazo
            .replace(/\/+\s*$/, '')          // Borrar / al final de la línea
            .replace(/^[*=#]+/, '')          // Borrar *=# al inicio
            .replace(/^(\d+)-(?![\w\d])/, '$1')  // Borrar - después de número inicial
            .replace(/:/g, "-")
            //.replace(/(\w)\s*-\s*(\w)/g, '$1-$2')

            // Reemplazar patrones SMS
            .replace(/\[.+?\]\s+\+\d+\s+\d+\s+\d+:\s/g, '\nsms\n')
            // Reemplazar líneas que empiecen con [algo]
            .replace(/^\[.*?\]\s+([^\s]+)\s+(\d+)%\s+(Grupo\s+[^:]+):\s*/gim, '\nsms\n')
            // Reemplazar patrones como "[algo] texto:"
            .replace(/\[.+?\]\s+[a-zA-Z0-9 ]*:\s/g, '\nsms\n')
            .replace(/\[.+?\]\s+[a-zA-Z0-9 ]*-\s/g, '\nsms\n')
            // Reemplazar el nuevo formato [fecha hora] Nombre porcentaje GruPo Nombre-
            .replace(/\[\d{2}\/\d{2}\/\d{4}\s+\d{2}-\d{2}\s+[AP]M\]\s+\w+\s+\d+%\s+GruPo\s+\w+(-|\s)/gi, '\nsms\n')
            .replace(/\[\d{2}\/\d{2}\/\d{4}\s+\d{2}-\d{2}\s+[AP]M\]\s+\w+\s+\d+%\s+GruPo\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(-|\s)/gi, '\nsms\n')

            // Cambiar '100' por '00' al inicio de una línea
            .replace(/^(100)/g, '00')
            .replace(/(sms\s*-?\s*)(.*)/gi, '$1\n$2')
            .replace(/([TLPAYtlpay\d]+)\s{1,2}-/gi, '$1-')
            .replace(/-\s{1,2}(\d+)/gi, '-$1')
            .replace(/\.{2,}/g, '.')

            // Añadir un '0' delante de números menores de 10
            .replace(/(?<!\d)(?<![a-zA-Z])(\d)(?!\d)/g, '0$1')
            .replace(/sms(\s+)(\d+.+)/g, 'sms$1\n$2')
            //.replace(/sms(\s+)(Pareja|Linea|Terminal.+)/gi, 'sms$1\n$2')
            .replace(/(Pareja[-.+=, /]+(?:con[-.,]*)*\d+.*?)(\s+sms)$/gm, '$1\n$2')
            .replace(/([a-zA-Z0-9]+)(pareja|lineas|terminal|con)/gmi, '$1 $2')
            .replace(/^(?!(?:d|p|l|t|s|c|o|no|#|\d+|Final|Finales))\w+\s*|[-=./]+\s*$/gmi, '')
            //.replace(/^(?:(\d+[=\-.\/]*)(?:\s+.*)?|(?!(?:d|p|l|t|s|c|o|no|#|\d|Final|Finales))\w+\s*)(.*)/gmi, '$1$2')
            //.replace(/^(\d+[? .,\s]+)\s+/gm, '$1') //

            // Reemplazar '$' por '/'
            .replace(/\$/g, '/')

            // Convertir 'l' en 'L'
            .replace(/l/g, 'L')

            // Convertir 't' en 'T'
            .replace(/t/g, 'T')

            // Convertir 'p' en 'P'
            .replace(/p/g, 'P');

        // 3. Separar números/letras de las palabras clave
        line = line.replace(/([a-zA-Z0-9]+)(pareja|lineas|terminal)/g, '$1 $2');

        return line;
    }).join('\n');

    // Actualizar el campo de entrada con el texto procesado
    document.getElementById('mensajeVenta').value = mensajeVenta;

    // Mostrar mensaje de éxito
    mostrarMensaje('Pre-procesamiento completado', 'success');
}

// Agregar el nuevo botón al DOM
document.addEventListener('DOMContentLoaded', function () {
    // Asegurarnos que inicie en modo oscuro
    document.body.classList.add('dark-mode');
    // Inicialización básica existente
    document.getElementById('Bienvenida').style.display = 'block';
    actualizarSelectJefes();
    updateToggleDarkModeButton();

    // Agregar el event listener para el campo de número ganador
    const numeroGanadorInput = document.getElementById('numeroGanador');
    if (numeroGanadorInput) {
        numeroGanadorInput.addEventListener('input', function (e) {
            validarNumero(this);
        });
    }

    // Agregar el nuevo botón de pre-procesamiento
    const botonesContainer = document.querySelector('.button-container');
    if (botonesContainer) {
        const reprocesarBtn = botonesContainer.querySelector('button');
        if (reprocesarBtn) {
            const preBtn = document.createElement('button');
            preBtn.textContent = '🔄 Pre-procesar';
            preBtn.onclick = preProcesarPatrones;
            preBtn.className = 'btn btn-secondary';
            preBtn.style.marginRight = '10px';

            botonesContainer.insertBefore(preBtn, reprocesarBtn);
        }
    }
});

// Función principal de procesamiento múltiple
function procesarTextoCompleto() {
    const textarea = document.getElementById('mensajeVenta');
    const indicator = document.querySelector('.validation-indicator');

    try {
        if (indicator) {
            indicator.className = 'validation-indicator processing';
        }

        let texto = textarea.value;
        texto = procesarExpresionesEspecificas(texto, 15);
        texto = procesarPatronesMultiplesVeces(texto, 5); // 3 pasadas por defecto
        textarea.value = texto;

        if (indicator) {
            indicator.className = 'validation-indicator success';
        }

        mostrarMensaje('Procesamiento completado', 'success');

    } catch (error) {
        console.error('Error durante el procesamiento:', error);
        if (indicator) {
            indicator.className = 'validation-indicator error';
        }
        mostrarMensaje('Error en el procesamiento', 'error');
    }
}

// Función para procesar múltiples veces
function procesarPatronesMultiplesVeces(texto, numeroIteraciones = 3) {
    let resultado = texto;
    let iteracionAnterior;

    for (let i = 0; i < numeroIteraciones; i++) {
        iteracionAnterior = resultado;
        resultado = procesarPatronesUnaVez(resultado);

        if (iteracionAnterior === resultado) {
            break;
        }
    }

    return resultado;
}

// Event listener único para el botón de procesar
document.addEventListener('DOMContentLoaded', function () {
    const btnProcesar = document.querySelector('.btn-procesar');
    if (btnProcesar) {
        btnProcesar.addEventListener('click', procesarTextoCompleto);
    }
});

// Función para procesar expresiones regulares específicas múltiples veces
function procesarExpresionesEspecificas(texto, numeroIteraciones = 15) {
    let resultado = texto;

    // Lista de expresiones regulares que necesitan múltiples pasadas
    const expresionesMultiples = [
        [/^(\d+:\d+)(?:\s+|\s*,\s*|\s*\.\s*)(\d+:\d+)/g, '$1\n$2'],
        //[/(\d+(?:[-.+=,]+\d+))\/([\s]*)sms/gi, '$1\nsms'],
        //[/(\d+(?:[-.+=,/ ]+\d+))[\s/]+sms/gi, '$1\nsms'],
        //[/(\d+-\d+\/),?/g, '$1\n'],
        [/^(\d+:\d+)[\s,.]?(\d+:\d+)/g, '$1\n$2'],
        [/(\d+:\d+)[^\n](\d+:\d+)/g, '$1\n$2'],
        // Esta es más agresiva y forzará el salto de línea
        [/(^\d+:\d+)([^\n]*?)(\d+:\d+)/g, '$1\n$3'],
        // Agregar aquí las expresiones que necesitas procesar múltiples veces
        // Separadores con =
        [/(\d+\=\d+)\/(\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\=\d+)\/(\d+\/\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\=\d+)\/(\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\=\d+)\/(\d+\.\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\=\d+)\/(\d+\-aL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\=\d+)\/ (\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-\d+)\/ (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -/-
        [/(\d+\=\d+) (\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =\s=
        [/(\d+\=\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =\s-
        [/(\d+\=\d+) (\d+\.\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =\s.
        [/(\d+\=\d+) (\d+\:\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =\s:
        [/(\d+\=\d+) (\d+\;\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =\s:
        [/(\d+\=\d+);(\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =\s:
        [/(\d+\=\d+) (\d+\-con-)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =\s:
        [/(\d+\=\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\=\d+)\.(Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\=\d+)\. (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\=\d+)\ ,(Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\=\d+)\, (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\=\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(\d+\=\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(\d+\=\d+) (Parejas\-con-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        // Separadores con -
        [/(\d+\-\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\s-
        [/(\d+\-\d+)\, (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+)\/\. (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+)\,(\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+)\/,(\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+)\ ,(\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+)\, (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+)\, (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+)\. (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\.\d+)\. (\d+\.\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+) (\d+\;\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\s;
        [/(\d+\-\d+) (deL \d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\s;
        [/(\d+\-\d+) (\d+\-con-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\s;
        [/(\d+\-\d+)\/\s*$/gm, '$1'], // Manda para Abajo los # que siguen de -/;
        [/(\d+\-\d+)\/(\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -/;
        [/(\d+\-\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(\d+\-\d+)\, (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -\, -
        [/(\d+\-\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(\d+\-\d+) (Parejas-con-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(\d+\-\d+) (Parejas-de \d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        // Separador con ,
        [/(\d+\,\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\,\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(\d+\,\d+) (\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ,\s=
        [/(\d+\,\d+) (\d+\;\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ,\s;
        [/(\d+\,\d+) (\d+\:\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ,\s:
        [/(\d+\,\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ,\s-
        [/(\d+\,\d+)\/(\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ,/-
        [/(\d+\,\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(\d+\,\d+) (\d+\,\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ,\s,
        // Separador con -aL-
        [/(\d+\-aL-\d+\=\d+)\/(\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+)\/(\d+\/\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+)\/(\d+\-aL-\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+)\/(Linea-\d+\-aL-\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+)\/(Parejas=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+)\/(TerminaL=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+) (Linea-\d+\-aL-\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+) (Parejas=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+\=\d+) (TerminaL=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\-aL-\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        // Separadores \s
        [/(\d+\.\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\.\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(\d+\.\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(\d+\.\d+) (\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de .\s=
        [/(\d+\.\d+) (\d+\.\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de .
        [/^(\d+\:\d+)\s(\d+\:\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de :
        [/(\d+\.\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de .\s-
        [/(\d+\.\d+) (\d+\:\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de .\s:
        [/(\d+\.\d+) (\d+\;\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de .\s:
        [/(\d+\ \d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\ \d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de =/=
        [/(\d+\ c-\d+) (\d+\ c-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de -/;
        [/(\d+[-:,;=]\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\:\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\:\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(\d+\:\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(\d+:\d+)\s+(\d+:\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de :
        [/(\d+;\d+)\, (\d+;\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de :
        [/(\d+;\d+)\ ,(\d+;\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de :
        [/(\d+\;\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(\d+\;\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(\d+\;\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(\d+\;\d+) (\d+\;\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ;\s;
        [/(\d+\;\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ;\s-
        [/(\d+\;\d+) (\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ;\s=
        [/(\d+\;\d+) (\d+\:\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ;\s:
        [/(\d+\;\d+)\/(\d+\:\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de ;/:
        // Separadores con Lineas- TerminaL- Parejas-
        [/(Linea-\d+\-\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(L-\d+\-\d+) (L-\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(L-\d+\-\d+) (T-\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(Linea-\d+\,\d+) (Parejas,\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(Linea-\d+\-\d+) (\d+\.\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(Linea-\d+\-\d+) (\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(Linea-\d+\-con-\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(Linea-\d+\-con-\d+) (\d+\-con-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(Linea-\d+\-con-\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-
        [/(Linea-\d+\-con-\d+) (Parejas-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Lineas-#
        [/(TerminaL-\d+\-\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(T-\d+\-\d+) (T-\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(TerminaL-\d+\=\d+) (\d+\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(TerminaL-\d+\=\d+) (Parejas\=\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(TerminaL-\d+\-\d+) (\d+\-con-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de TerminaL-
        [/(Parejas-\d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas-de \d+) (\d+\-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas-\d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas-de \d+) (Linea-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas-\d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas-de \d+) (TerminaL-\d+)/g, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas=\d+) (\d+\=\d+)/mg, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas=\d+) (Linea-\d+\=\d+)/mg, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/(Parejas=\d+) (TerminaL-\d+\=\d+)/mg, '$1\n$2'], // Manda para Abajo los # que siguen de Parejas-
        [/^(\d+\:\d+)\s+(\d+\:\d+)/mg, '$1\n$2'],
        [/^(\d+\:\d+)\s*(\d+\:\d+)/mg, '$1\n$2'],
        [/^([0-9]+\:[0-9]+)\s+([0-9]+\:[0-9]+)/g, '$1\n$2'],
        [/(sms\s*-?\s*)(.*)/gi, '$1\n$2'],
        [/sms(\s+)(\d+.+)/g, 'sms$1\n$2'],
        //[/sms(\s+)(Pareja|Linea|Terminal.+)/gi, 'sms$1\n$2'],
        //[/Pareja-\d+(\s+)sms/g, 'Pareja-\d+$1\nsms'],
        // Agrega más expresiones aquí según necesites
    ];

    // Procesar solo estas expresiones múltiples veces
    for (let i = 0; i < numeroIteraciones; i++) {
        expresionesMultiples.forEach(([regex, replacement]) => {
            resultado = resultado.replace(regex, replacement);
        });
    }

    return resultado;
}

function procesarPatronesUnaVez(texto) {
    // Asegurarse que el texto esté en trim antes de empezar
    texto = texto.trim();

    // PRIMERO: Procesar los patrones específicos que deben ir primero
    texto = texto.replace(/(\d+(?:[-.+=,]+\d+))\/([\s]*)sms/gi, '$1\nsms');
    texto = texto.replace(/(\d+(?:[-.+=,/ ]+\d+))[\s/]+sms/gi, '$1\nsms');
    texto = texto.replace(/(\d+(?:[-.+=,/ ]+\d+))[\s/]+(\w+)(?:\s+sms)/gi, '$1\n$2\nsms');
    texto = texto.replace(/^\[.*?\]\s+([^\s]+)\s+(\d+)%\s+(Grupo\s+[^:]+):\s*/gm, 'SMS:\n');
    texto = texto.replace(/\[.+?\]\s+[a-zA-Z0-9 ]*:\s/gm, 'SMS:\n');
    texto = texto.replace(/\s*([-.:,;])\s*([PaL])/g, '$1$2');
    texto = texto.replace(/([PaL])\s*([-.:,;])\s*/g, '$1$2');
    // Normalizar todos los separadores comunes
    texto = texto.replace(/\s+(?:von|com|cin|vin|con|c|de)\s+/gi, 'con');
    texto = texto.replace(/--con--/g, '-con-');
    texto = texto.replace(/-+con-+/g, '-con-');
    texto = texto.replace(/(sms\s*-?\s*)(.*)/gi, '$1\n$2');
    // Reemplazar letras con tilde por sus equivalentes sin tilde
    texto = texto.replace(/á/g, 'a');
    texto = texto.replace(/é/g, 'e');
    texto = texto.replace(/í/g, 'i');
    texto = texto.replace(/ó/g, 'o');
    texto = texto.replace(/ú/g, 'u');
    // Reemplazar letras con tilde mayúsculas por sus equivalentes sin tilde
    texto = texto.replace(/Á/g, 'A');
    texto = texto.replace(/É/g, 'E');
    texto = texto.replace(/Í/g, 'I');
    texto = texto.replace(/Ó/g, 'O');
    texto = texto.replace(/Ú/g, 'U');
    // Reemplazar la letra "ñ" por "n"
    texto = texto.replace(/ñ/g, 'n');
    // Reemplazar la letra "Ñ" por "N"
    texto = texto.replace(/Ñ/g, 'N');
    // Eliminar espacios alrededor de los símbolos (=, -, :, , ;)
    //texto = texto.replace(/(\d+)\s*([=:\-,;])\s*(\d+)/g, '$1$2$3');
    // Reemplazar * + _ ¨ ^ = con -
    texto = texto.replace(/[\*\+\_\¨\^\=\']/g, '-');
    // 1. Reducir múltiples guiones (`---`) a un solo guion (`-`)
    texto = texto.replace(/-{2,}/g, '-');
    // 2. Reducir múltiples comas (`,,,`) a una sola coma (`,`)
    texto = texto.replace(/,{2,}/g, ',');
    // 3. Reducir múltiples puntos y comas (`;;;`) a un solo punto y coma (`;`)
    texto = texto.replace(/;{2,}/g, ';');
    // 4. Reducir múltiples dos puntos (`:::`) a un solo dos puntos (`:`)
    // texto = texto.replace(/:{2,}/g, ':');
    // 5. Reducir múltiples guiones bajos (`___`) a un solo guion bajo (`_`)
    texto = texto.replace(/_{2,}/g, '_');
    // 6. Reducir múltiples símbolos de intercalación (`^^^`) a un solo símbolo (`^`)
    texto = texto.replace(/\^{2,}/g, '^');
    // 7. Reducir múltiples diéresis (`¨¨¨`) a una sola diéresis (`¨`)
    texto = texto.replace(/¨{2,}/g, '¨');
    // 8. Reducir múltiples espacios en blanco a un solo espacio
    texto = texto.replace(/\s{2,}/g, ' ');

    // Limpiar puntuación y espacios extra
    texto = texto.replace(/(\d+)[,.\s]*-*con-*[,.\s]*(\d+)/gi, '$1-con$2');
    texto = texto.replace(/^[Ll]-(\d+)/gm, 'L-$1');
    texto = texto.replace(/(?<!\d)(\d)(?!\d)/g, '0$1');
    // Resto del procesamiento...
    texto = texto.replace(/\b(?:con|c)\s*\b/gi, '-con-');
    texto = texto.replace(/[-\s]+con[-\s]+/g, '-con-');
    texto = texto.replace(/(?:\s|\W)+aL(?:\s|\W)+/g, '-aL-');
    texto = texto.replace(/(\d+)\s*aL\s*(\d+)/gi, '$1-aL-$2');
    texto = texto.replace(/\b(?:con|c)\b/gi, '-con-');

    // Procesamiento de palabras específicas
    texto = texto.replace(/(\d+)([a-zA-Z]+)/g, '$1 $2');
    texto = texto.replace(/([a-zA-Z])([0-9]+)/g, '$1-$2');
    texto = texto.replace(/Ter([a-zA-Z]*)/gi, 'TerminaL');
    texto = texto.replace(/TerminaL /gi, 'TerminaL-');
    texto = texto.replace(/Lin([a-zA-Z]*)/gi, 'Linea');
    texto = texto.replace(/Linea /gi, 'Linea-');
    texto = texto.replace(/Línea /gi, 'Linea-');
    texto = texto.replace(/Pare([a-zA-Z]*)/gi, 'Pareja');
    texto = texto.replace(/Parejas /gi, 'Pareja-');

    // Limpieza final
    texto = texto.replace(/c(?:on)?\W*(\d+)(\s*)(\W+)/g, 'con-$1\n$2');
    texto = texto.replace(/^(?!(?:d|p|l|t|s|c|o|no|#|\d))\w+\s*|[-=./]+\s*$/gim, '');
    texto = texto.replace(/(?<!\d)(?<![a-zA-Z])(\d)(?!\d)/g, '0$1');
    texto = texto.replace(/ToTaL\W\d+\$*/g, '');
    texto = texto.replace(/(\d+-(?:al|con)-\d+(?:-con-\d+)?)/g, '$1');

    // Procesar las líneas con 'de'
    texto = texto.trim().split('\n').map(line => {
        if (line.includes(' de ')) {
            return line.replace(' de ', 'con');
        }
        return line;
    }).join('\n');

    return texto.trim();
}

// Función reprocesarPatrones optimizada
function reprocesarPatrones() {
    try {
        let mensajeVenta = document.getElementById('mensajeVenta').value;
        const lineas = mensajeVenta.split('\n').filter(linea => linea.trim());
        let mensajesInvalidos = [];
        let mensajesValidos = [];
        let totalVenta = 0;
        let premioEncontrado = 0;
        const montosPorNumero = {};
        const numerosCriticos = [];
        let numeroGanador = obtenerNumeroGanador();

        // Validar número ganador
        if (!numeroGanador && !mensajeVenta.toUpperCase().startsWith('TOTAL:')) {
            mensajesInvalidos.push('Por favor ingrese el número ganador', 'error');
            numeroGanador = null;
            // return false;
        }

        // Función auxiliar para procesar montos por número
        function procesarMontoNumero(jugadas) {
            Object.keys(jugadas).forEach((numero)=> {
                if (!isNaN(numero) && !isNaN(jugadas[numero])) {
                    montosPorNumero[numero] = (montosPorNumero[numero] || 0) + jugadas[numero];
                    if (montosPorNumero[numero] > 5000 && !numerosCriticos.includes(numero)) {
                        numerosCriticos.push(numero);
                    }
                }
            })
        }

        const nuevasLineas = lineas.map(linea => {
            linea = linea.trim();
            if (!linea) return linea;

            if (linea.toUpperCase() === 'SMS') return linea;

            if (esJugadaValida(linea)) {
                let resultado;
                //linea = linea.toLowerCase(); Cambia de Mayuscula a Minuscula todo
                try {
                    // Verificar primero si es un número solitario de 3 o más dígitos
                        if (/^\d{3,}$/.test(linea)) {
                            console.log('Número solitario detectado: ' + linea);
                            mensajesInvalidos.push(linea + ' (número solitario no válido)');
                            return linea;
                    } else if (patrones.linea.test(linea)) {
                        console.log('jugada linea');
                        resultado = procesarLineaConGanador(linea, numeroGanador);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                        }
                    } else if (patrones.lineaConY.test(linea)) {
                        console.log('jugada linea con Y');
                        resultado = procesarLineaConYGanador(linea, numeroGanador);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                        }
                    } else if (patrones.terminal.test(linea) || patrones.terminalMultiple.test(linea) ){
                        console.log('jugada terminal');
                        resultado = procesarTerminalesConGanador(linea, numeroGanador);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                        }
                    } else if (patrones.pareja.test(linea)) {
                        console.log('jugada pareja');
                        resultado = procesarParejasConGanador(linea, numeroGanador);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                        }
                    } else if (patrones.terminalAl.test(linea)) {
                        console.log('jugada terminal Al');
                        resultado = procesarTerminalAl(linea, numeroGanador);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                        }
                    } else if (patrones.parejasAl.test(linea)) {
                        console.log('jugada parejas al');
                        resultado = procesarParejasAlConGanador(linea, numeroGanador);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                        }
                    } else if (patrones.numeroAlNumero.test(linea)) {
                        console.log('jugada numero al');
                        resultado = procesarNumeroAlNumero(linea, numeroGanador);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                        }
                    } else {
                        resultado = procesarGenerica(linea, numeroGanador);
                        console.log(resultado);
                        if (resultado) {
                            totalVenta += resultado.totalVenta;
                            procesarMontoNumero(resultado.jugadas);
                            console.log('procesado');
                        }
                    }

                    if (resultado) {
                        mensajesValidos.push(linea);
                        premioEncontrado += resultado.premioEncontrado || 0;
                    } else {
                        mensajesInvalidos.push(linea);
                    }
                    return linea;
                } catch (error) {
                    mensajesInvalidos.push(linea);
                    return linea;
                }
            } else {
                mensajesInvalidos.push(linea);
                return linea;
            }
        });

        // Mostrar alerta si hay números que exceden 5000
        if (numerosCriticos.length > 0) {
            const mensaje = `¡ADVERTENCIA!\nLos siguientes números exceden el límite de 5,000:\n${
                numerosCriticos.map(num => `Número ${num}: ${montosPorNumero[num].toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`).join('\n')
            }`;
            alert(mensaje);
        }

        // Actualizar el campo de entrada
        document.getElementById('mensajeVenta').value = nuevasLineas.join('\n');

        // Manejar mensajes no procesados
        const mensajesNoProcesadosSection = document.getElementById('mensajesNoProcesadosSection');
        if (mensajesInvalidos.length > 0) {
            mensajesNoProcesadosSection.style.display = 'block';
            document.getElementById('mensajesNoProcesadosTextarea').value = mensajesInvalidos.join('\n');

            const mensajesInteractivosExistente = mensajesNoProcesadosSection.querySelector('.mensajes-interactivos');
            if (mensajesInteractivosExistente) {
                mensajesInteractivosExistente.remove();
            }

            const mensajesInteractivos = crearMensajesInteractivos(mensajesInvalidos);
            mensajesNoProcesadosSection.appendChild(mensajesInteractivos);
            mostrarMensaje('Hay mensajes inválidos. Haga clic en ellos para localizarlos.', 'error');
        } else {
            mensajesNoProcesadosSection.style.display = 'none';
            document.getElementById('mensajesNoProcesadosTextarea').value = '';
        }

        mostrarMensaje('Patrones reprocesados', 'success');
        // Mostrar resultados finales
        // Añadir cálculo de ganancia/pérdida
        const vendedorSeleccionado = document.getElementById('vendedorSelect').value;
            let porcentajeVendedor = 10; // Valor por defecto
            let precioVenta = 1000; // Valor por defecto

            // Obtener valores del vendedor seleccionado si existe
        if (vendedorSeleccionado && vendedores[vendedorSeleccionado]) {
            porcentajeVendedor = vendedores[vendedorSeleccionado].porcentaje || 10;
            precioVenta = vendedores[vendedorSeleccionado].precioVenta || 1000;
        }

        // Cálculo de ganancia del vendedor basado en porcentaje
        const gananciaVendedor = totalVenta * (porcentajeVendedor / 100);

        // Calcular el pago de premios
        const pagoPremios = premioEncontrado * precioVenta;

        // Calcular la entrega (venta total menos ganancia del vendedor)
        const entrega = totalVenta - gananciaVendedor;

        // Calcular si hay ganancia o pérdida
        const diferencia = entrega - pagoPremios;
        const esGanancia = diferencia >= 0;

        let mensaje;
            if (numeroGanador)
            mensaje = `Total Venta: ${totalVenta.toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - Número Ganador: ${numeroGanador} - Premio Total: ${premioEncontrado}`;
        else
            mensaje = `Total Venta: ${totalVenta.toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

        // Primero establecer el texto base
        document.getElementById('totalVenta').innerText = mensaje;

        // Luego añadir el span coloreado si hay número ganador
        if (numeroGanador) {
        // Añadir información de ganancia/pérdida con color
        const spanElement = document.createElement('span');
            spanElement.style.color = esGanancia ? 'green' : 'red';
            spanElement.textContent = ` - ${esGanancia ? 'Ganancia' : 'Pérdida'}: ${Math.round(Math.abs(diferencia)).toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            document.getElementById('totalVenta').appendChild(spanElement);
        }
        return {
            mensajesValidos,
            totalVenta,
            mensajesInvalidos,
            premioEncontrado
        };

    } catch (error) {
        console.error('Error al reprocesar patrones:', error);
        mostrarMensaje('Error al reprocesar patrones', 'error');
    }

}

/**
 * Cierra un mensaje con animación
 * @param {HTMLElement} mensajeElement - El elemento del mensaje a cerrar
 * @param {Function} callback - Función a ejecutar después de cerrar
 */
function cerrarMensaje(mensajeElement, callback) {
    mensajeElement.style.opacity = '0';
    mensajeElement.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        if (mensajeElement.parentNode) {
            mensajeElement.remove();
            if (typeof callback === 'function') {
                callback();
            }
        }
    }, 300); // Duración de la animación
}

// Exportar funciones para acceso global
window.mostrarMensaje = mostrarMensaje;
window.agregarEstilosMensajes = agregarEstilosMensajes;
window.limpiarTexto = limpiarTexto;
window.procesarTextoCompleto = procesarTextoCompleto;
window.procesarPatronesMultiplesVeces = procesarPatronesMultiplesVeces;
window.procesarPatronesUnaVez = procesarPatronesUnaVez;
window.procesarExpresionesEspecificas = procesarExpresionesEspecificas;
window.preProcesarPatrones = preProcesarPatrones;
window.reprocesarPatrones = reprocesarPatrones;
