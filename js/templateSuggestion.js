// Template Suggestion Module - Analyzes questions and suggests appropriate templates

window.analizarYSugerirPlantilla = async function () {
    // Initialize template manager if it doesn't exist
    if (!window.templateManager) {
        console.log('Inicializando templateManager...');

        // Dynamically import TemplateManager
        try {
            const module = await import('./templates.js');
            window.templateManager = new module.TemplateManager();

            // Wait a bit for templates to load
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            console.error('Error inicializando templateManager:', error);
            window.showNotification('Error al cargar el sistema de plantillas. Recarga la página e intenta de nuevo.', 'error');
            return;
        }
    }

    // Get all the answers from the questions section
    const tipoServicio = document.getElementById('tipoServicio')?.value || '';
    const estadoLuces = document.getElementById('estadoLuces')?.value || '';
    const estadoOnt = document.getElementById('estadoOnt')?.value || '';
    const clienteMasiva = document.getElementById('clienteMasiva')?.value || '';
    const fallaMasiva = document.getElementById('fallaMasiva')?.value || '';
    const instalacionReparacion = document.getElementById('instalacionReparacion')?.value || '';
    const clienteReincidente = document.getElementById('clienteReincidente')?.value || '';

    // Get all templates
    const allTemplates = window.templateManager.getAllItems();

    if (allTemplates.length === 0) {
        window.showNotification('No hay plantillas disponibles en el sistema. Las plantillas se están cargando, intenta de nuevo en unos segundos.', 'warning');
        return;
    }

    // Validate that at least service type is selected
    if (!tipoServicio) {
        window.showNotification('Por favor completa la sección de "Preguntas" primero. Debes seleccionar al menos el tipo de servicio.', 'warning');
        return;
    }

    // Check how many questions have been answered
    const answeredQuestions = [
        tipoServicio,
        estadoLuces,
        estadoOnt,
        clienteMasiva,
        fallaMasiva,
        instalacionReparacion,
        clienteReincidente
    ].filter(answer => answer && answer !== 'Seleccione').length;

    // Warn if very few questions are answered
    if (answeredQuestions < 3) {
        window.showNotification(
            `Solo has respondido ${answeredQuestions} pregunta(s). Para mejores sugerencias, completa más campos en la sección "Preguntas" (estado ONT, luces, etc.)`,
            'info'
        );
    }

    // Score each template based on the answers
    let bestMatch = null;
    let bestScore = 0;

    allTemplates.forEach(template => {
        let score = 0;

        // Skip shortcuts for automatic suggestion
        if (template.isShortcut) {
            return;
        }

        // Match by service type (highest priority)
        if (tipoServicio.includes('INTERNET') && template.categoria === 'Internet') {
            score += 50;
        } else if (tipoServicio.includes('TV') && template.categoria === 'Television') {
            score += 50;
        } else if (tipoServicio.includes('VOZ') && template.categoria === 'Telefonia') {
            score += 50;
        } else if (tipoServicio.includes('MOVIL') && template.categoria === 'Movil') {
            score += 50;
        }

        // Match by ONT state
        if (estadoOnt) {
            if (estadoOnt === 'Offline' && template.tags.some(tag => tag.toLowerCase().includes('los'))) {
                score += 20;
            } else if (estadoOnt === 'Conectado' && template.tags.some(tag => tag.toLowerCase().includes('navegacion') || tag.toLowerCase().includes('lentitud'))) {
                score += 15;
            } else if (estadoOnt === 'Desconocido' && template.tags.some(tag => tag.toLowerCase().includes('los'))) {
                score += 15;
            }
        }

        // Match by light state
        if (estadoLuces) {
            if (estadoLuces.includes('Roja') && template.tags.some(tag => tag.toLowerCase().includes('los'))) {
                score += 20;
            } else if (estadoLuces.includes('Verdes') && template.tags.some(tag => tag.toLowerCase().includes('navegacion') || tag.toLowerCase().includes('lentitud'))) {
                score += 10;
            } else if (estadoLuces.includes('Sin Luces') && template.tags.some(tag => tag.toLowerCase().includes('los'))) {
                score += 15;
            }
        }

        // Match by massive failure
        if (fallaMasiva === 'Sí' || clienteMasiva === 'Sí') {
            if (template.tags.some(tag => tag.toLowerCase().includes('masiva'))) {
                score += 15;
            }
        }

        // Match by installation/repair issues
        if (instalacionReparacion && instalacionReparacion !== 'No') {
            if (template.tags.some(tag => tag.toLowerCase().includes('instalacion') || tag.toLowerCase().includes('tecnico'))) {
                score += 10;
            }
        }

        // Match by recurrent client
        if (clienteReincidente && clienteReincidente !== 'N/A') {
            if (clienteReincidente.includes('internet') && template.categoria === 'Internet') {
                score += 10;
            } else if (clienteReincidente.includes('tv') && template.categoria === 'Television') {
                score += 10;
            } else if (clienteReincidente.includes('fono') && template.categoria === 'Telefonia') {
                score += 10;
            }
        }

        // Update best match if this template has a higher score
        if (score > bestScore) {
            bestScore = score;
            bestMatch = template;
        }
    });

    // Apply the best matching template
    if (bestMatch && bestScore > 0) {
        const soporteGenerado = document.getElementById('soporteGenerado');
        if (soporteGenerado) {
            soporteGenerado.value = bestMatch.observacion;

            // Show template info
            const showTemplateInfo = !bestMatch.isShortcut || localStorage.getItem('showTemplateInfoForTags') === 'true';

            if (showTemplateInfo && bestMatch.tipificacion && window.templateManager) {
                window.templateManager.displayTemplateInfo(bestMatch);
            }

            // Show success notification
            window.showNotification(`✓ Plantilla sugerida: "${bestMatch.nombre}" (Coincidencia: ${Math.round((bestScore / 100) * 100)}%)`, 'success');
        }
    } else {
        // More informative message when no template is found
        let message = 'No se encontró una plantilla apropiada para las respuestas proporcionadas. ';

        if (answeredQuestions < 5) {
            message += 'Intenta completar más preguntas en la sección "Preguntas" (estado ONT, luces, falla masiva, etc.) para obtener mejores sugerencias.';
        } else {
            message += 'Las respuestas no coinciden con ninguna plantilla disponible. Puedes buscar manualmente con F2 o crear una nueva plantilla.';
        }

        window.showNotification(message, 'warning');
    }
};

// Clear support field function
window.limpiarCampoSoporte = function () {
    const soporteGenerado = document.getElementById('soporteGenerado');
    const templateInfoContainer = document.getElementById('templateInfoContainer');
    const templateInfoContent = document.getElementById('templateInfoContent');

    if (soporteGenerado) {
        soporteGenerado.value = '';
        soporteGenerado.focus();
    }

    if (templateInfoContainer) {
        templateInfoContainer.style.display = 'none';
    }

    // Also clear the content to ensure no stale information remains
    if (templateInfoContent) {
        templateInfoContent.innerHTML = '';
    }

    window.showNotification('Campo limpiado correctamente', 'success');
};

// Clear all questions function
window.limpiarPreguntas = function () {
    // List of all question field IDs
    const questionFields = [
        'suministroElectrico',
        'generadorElectrico',
        'tiempoFalla',
        'tipoServicio',
        'controlRemoto',
        'cambioPilas',
        'pruebaCruzada',
        'instalacionReparacion',
        'clienteReincidente',
        'estadoLuces',
        'estadoOnt',
        'clienteMasiva',
        'fallaMasiva',
        'visitaTecnica',
        'perdidaMonitoreo',
        'clienteConectadoPor',
        'estadoOntPersiste',
        'redesUnificadas',
        'redesUnificadasOtros'
    ];

    // Clear all select fields
    questionFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.tagName === 'SELECT') {
                field.selectedIndex = 0; // Reset to first option (usually "Seleccione")
            } else if (field.tagName === 'INPUT') {
                field.value = ''; // Clear input fields
            }
        }
    });

    // Clear the TV questions switch if it exists
    const fallaTvSwitch = document.getElementById('fallaTvSwitch');
    if (fallaTvSwitch) {
        fallaTvSwitch.checked = false;
    }

    // Hide TV questions if they're visible
    const tvQuestions = document.getElementById('tvQuestions');
    if (tvQuestions) {
        tvQuestions.style.display = 'none';
    }

    // Hide the 3 MUNDOS switch container
    const tresMundosSwitchContainer = document.getElementById('tresMundosSwitchContainer');
    if (tresMundosSwitchContainer) {
        tresMundosSwitchContainer.style.display = 'none';
    }

    // Hide the Redes Unificadas Otros container
    const redesUnificadasOtrosContainer = document.getElementById('redesUnificadasOtrosContainer');
    if (redesUnificadasOtrosContainer) {
        redesUnificadasOtrosContainer.style.display = 'none';
    }

    window.showNotification('Preguntas limpiadas correctamente', 'success');
};

// Monitor the support field and hide template info when empty
window.initSoporteGeneradoMonitor = function () {
    const soporteGenerado = document.getElementById('soporteGenerado');

    if (soporteGenerado) {
        // Add input event listener to monitor changes
        soporteGenerado.addEventListener('input', function () {
            const templateInfoContainer = document.getElementById('templateInfoContainer');
            const templateInfoContent = document.getElementById('templateInfoContent');

            // If the field is empty, hide the template info
            if (this.value.trim() === '') {
                if (templateInfoContainer) {
                    templateInfoContainer.style.display = 'none';
                }
                if (templateInfoContent) {
                    templateInfoContent.innerHTML = '';
                }
            }
        });

        console.log('Monitor de soporte generado inicializado');
    }
};

// Initialize the monitor when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initSoporteGeneradoMonitor);
} else {
    // DOM is already ready, initialize immediately
    window.initSoporteGeneradoMonitor();
}
