// Template Search Popup Module
let templateSearchPopup = null;
let currentSearchQuery = '';
let selectedIndex = -1;
let filteredResults = [];

// Create the search popup HTML
export function createTemplateSearchPopup() {
    const popupHTML = `
        <div id="templateSearchPopup" class="template-search-popup" style="display: none;">
            <div class="template-search-container">
                <div class="template-search-header">
                    <i class="material-icons" style="font-size: 18px; color: var(--accent-primary);">search</i>
                    <input 
                        type="text" 
                        id="templateSearchInput" 
                        placeholder="Buscar plantillas y atajos..."
                        autocomplete="off"
                    />
                    <span class="template-search-close" onclick="window.closeTemplateSearchPopup()">
                        <i class="material-icons">close</i>
                    </span>
                </div>
                <div class="template-search-results" id="templateSearchResults">
                    <div class="template-search-empty">
                        <i class="material-icons">keyboard</i>
                        <p>Escribe para buscar plantillas y atajos</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = popupHTML;
    document.body.appendChild(container.firstElementChild);

    // Add styles
    addTemplateSearchStyles();

    // Setup event listeners
    setupTemplateSearchListeners();
}

// Add CSS styles for the popup
function addTemplateSearchStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .template-search-popup {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 100px;
            animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .template-search-container {
            background: var(--bg-primary);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 600px;
            max-height: 70vh;
            display: flex;
            flex-direction: column;
            animation: slideDown 0.3s ease;
            border: 1px solid var(--input-border);
        }

        @keyframes slideDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .template-search-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid var(--input-border);
        }

        .template-search-header input {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--text-primary);
            font-size: 16px;
            outline: none;
        }

        .template-search-header input::placeholder {
            color: var(--text-secondary);
        }

        .template-search-close {
            cursor: pointer;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            transition: color 0.2s;
        }

        .template-search-close:hover {
            color: var(--danger-color);
        }

        .template-search-results {
            overflow-y: auto;
            max-height: calc(70vh - 70px);
            padding: 8px;
        }

        .template-search-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-secondary);
        }

        .template-search-empty i {
            font-size: 48px;
            opacity: 0.5;
            margin-bottom: 12px;
        }

        .template-search-empty p {
            margin: 0;
            font-size: 14px;
        }

        .template-result-item {
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
            margin-bottom: 6px;
        }

        .template-result-item.selected {
            background: var(--bg-tertiary);
            border-color: var(--accent-primary);
        }

        .template-result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }

        .template-result-title {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 14px;
        }

        .template-result-category {
            background: var(--accent-primary);
            color: var(--button-text-color);
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }

        .template-result-tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 6px;
        }

        .template-result-tag {
            background: var(--bg-secondary);
            color: var(--text-secondary);
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
        }

        .template-result-preview {
            color: var(--text-secondary);
            font-size: 12px;
            line-height: 1.4;
            max-height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .template-search-footer {
            padding: 12px 20px;
            border-top: 1px solid var(--input-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .template-search-hint {
            display: flex;
            gap: 16px;
        }

        .template-search-hint span {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .template-search-hint kbd {
            background: var(--bg-tertiary);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            border: 1px solid var(--input-border);
        }
    `;
    document.head.appendChild(style);
}

// Setup event listeners
function setupTemplateSearchListeners() {
    const searchInput = document.getElementById('templateSearchInput');
    const popup = document.getElementById('templateSearchPopup');

    if (searchInput) {
        // Search input
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            performSearch(currentSearchQuery);
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
                updateSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
                    applySelectedTemplate(filteredResults[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeTemplateSearchPopup();
            }
        });
    }

    // Close on background click
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closeTemplateSearchPopup();
            }
        });
    }
}

// Perform search
function performSearch(query) {
    if (!window.templateManager) {
        return;
    }

    filteredResults = window.templateManager.searchTemplates(query);

    // Check for forced category filter in popup
    const popup = document.getElementById('templateSearchPopup');
    if (popup && popup.dataset.forcedCategory) {
        const category = popup.dataset.forcedCategory;
        filteredResults = filteredResults.filter(t => t.categoria === category);
    }

    selectedIndex = -1;
    renderSearchResults(filteredResults, query);
}

// Render search results
function renderSearchResults(results, query) {
    const resultsContainer = document.getElementById('templateSearchResults');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="template-search-empty">
                <i class="material-icons">search_off</i>
                <p>No se encontraron resultados</p>
            </div>
        `;
        return;
    }

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--accent-primary); color: var(--button-text-color); padding: 2px 4px; border-radius: 3px;">$1</mark>');
    };

    resultsContainer.innerHTML = results.map((template, index) => `
        <div class="template-result-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
            <div class="template-result-header">
                <div class="template-result-title">${highlightText(template.nombre, query)}</div>
                <div class="template-result-category">${template.categoria}</div>
            </div>
            <div class="template-result-tags">
                ${template.tags.slice(0, 4).map(tag => `
                    <span class="template-result-tag">${highlightText(tag, query)}</span>
                `).join('')}
            </div>
            <div class="template-result-preview">${highlightText(template.observacion, query)}</div>
        </div>
    `).join('');

    // Add click listeners to results
    document.querySelectorAll('.template-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            applySelectedTemplate(results[index]);
        });
        item.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateSelection();
        });
    });
}

// Update selection highlighting
function updateSelection() {
    document.querySelectorAll('.template-result-item').forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Apply selected template
function applySelectedTemplate(template) {
    if (!template) return;

    const soporteGenerado = document.getElementById('soporteGenerado');
    const observacionForm = document.getElementById('observacionForm');

    if (soporteGenerado && soporteGenerado.offsetParent !== null) {
        soporteGenerado.value = template.observacion;
        soporteGenerado.focus();

        // Show template info if it's a saved template or if tags option is enabled
        const showTemplateInfo = !template.isShortcut || localStorage.getItem('showTemplateInfoForTags') === 'true';

        if (showTemplateInfo && template.tipificacion) {
            displayTemplateInfo(template);
        }
    } else if (observacionForm) {
        observacionForm.value = template.observacion;
        observacionForm.focus();
    }

    const type = template.isShortcut ? 'atajo' : 'plantilla';
    window.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} "${template.nombre}" aplicada`, 'success');

    closeTemplateSearchPopup();
}

// Display template information above Soporte Generado
function displayTemplateInfo(template) {
    const container = document.getElementById('templateInfoContainer');
    const content = document.getElementById('templateInfoContent');

    if (!container || !content) return;

    const tipificacion = template.tipificacion;

    content.innerHTML = `
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <span style="background: var(--accent-primary); color: var(--button-text-color); padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                Tipo de Tarea: ${tipificacion.tipoTarea}
            </span>
            <span style="background: var(--bg-tertiary); color: var(--text-primary); padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                Motivo: ${tipificacion.motivo}
            </span>
            <span style="background: var(--bg-tertiary); color: var(--text-primary); padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                Subvaloración: ${tipificacion.subvaloracion}
            </span>
            <span style="background: #ef4444; color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                Estado: ${tipificacion.estado}
            </span>
        </div>
    `;

    container.style.display = 'block';
}

// Clear template info
window.clearTemplateInfo = function () {
    const container = document.getElementById('templateInfoContainer');
    if (container) {
        container.style.display = 'none';
    }
};


// Open the search popup
export function openTemplateSearchPopup(categoryFilter = null) {
    if (!document.getElementById('templateSearchPopup')) {
        createTemplateSearchPopup();
    }

    // Ensure template manager is initialized
    if (!window.templateManager) {
        // Import and initialize TemplateManager dynamically
        import('./templates.js').then(module => {
            window.templateManager = new module.TemplateManager();
            // Wait for templates to load
            setTimeout(() => {
                performSearch('');
            }, 500);
        });
    } else {
        // Reload shortcuts
        window.templateManager.loadShortcuts();
    }

    const popup = document.getElementById('templateSearchPopup');
    const searchInput = document.getElementById('templateSearchInput');

    if (popup) {
        popup.style.display = 'flex';
        currentSearchQuery = '';
        selectedIndex = -1;

        // Set category filter if provided
        if (categoryFilter) {
            // We need to simulate the filter button click or set the state manually
            // Since the popup uses its own internal state or DOM for filtering (which isn't fully exposed here),
            // we'll add a data attribute to the popup to store the forced filter
            popup.dataset.forcedCategory = categoryFilter;

            // Also, if we want to reuse the filter logic from performSearch, we need to make sure it respects this.
            // However, performSearch looks at .template-filter-btn.active.
            // The popup doesn't seem to have filter buttons inside it based on createTemplateSearchPopup HTML.
            // Wait, createTemplateSearchPopup (lines 8-32) DOES NOT have filter buttons.
            // createTemplatesModal (in templates.js) DOES have filter buttons.
            // js/templateSearch.js is for the POPUP (F2), which seems to be a simpler search.

            // If the popup doesn't have filter buttons, we need to implement the filtering in performSearch
            // based on the argument passed to openTemplateSearchPopup.
            // Let's modify performSearch to check for this dataset attribute or a global variable.
        } else {
            delete popup.dataset.forcedCategory;
        }

        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }

        // Show all templates initially (if manager is ready)
        if (window.templateManager) {
            performSearch('');
        }
    }
}

// Close the search popup
export function closeTemplateSearchPopup() {
    const popup = document.getElementById('templateSearchPopup');
    if (popup) {
        popup.style.display = 'none';
    }

    // Return focus to the textarea
    const soporteGenerado = document.getElementById('soporteGenerado');
    if (soporteGenerado && soporteGenerado.offsetParent !== null) {
        soporteGenerado.focus();
    }
}

// Add keydown listener to soporteGenerado and observacionForm textareas
export function initializeTemplateSearchShortcut() {
    const textareas = [
        document.getElementById('soporteGenerado'),
        document.getElementById('observacionForm')
    ];

    textareas.forEach(textarea => {
        if (textarea && !textarea.dataset.templateSearchInitialized) {
            textarea.addEventListener('keydown', (e) => {
                // Check if 'F2' is pressed (without modifiers)
                if (e.key === 'F2' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
                    e.preventDefault();

                    // Check if we need to filter by category
                    let categoryFilter = null;
                    const savedTypification = localStorage.getItem("selectedTypification");
                    if (savedTypification === "Transferencia (Soporte)" && textarea.id === 'observacionForm') {
                        categoryFilter = 'Transferencia';
                    }

                    openTemplateSearchPopup(categoryFilter);
                }
            });

            // Add input listener to hide template info when field is empty (only for soporteGenerado)
            if (textarea.id === 'soporteGenerado') {
                textarea.addEventListener('input', (e) => {
                    const container = document.getElementById('templateInfoContainer');
                    if (container && e.target.value.trim() === '') {
                        container.style.display = 'none';
                    }
                });
            }

            textarea.dataset.templateSearchInitialized = 'true';
        }
    });
}

// Expose functions to window
window.openTemplateSearchPopup = openTemplateSearchPopup;
window.closeTemplateSearchPopup = closeTemplateSearchPopup;
window.initializeTemplateSearchShortcut = initializeTemplateSearchShortcut;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the textarea to be rendered
    setTimeout(() => {
        initializeTemplateSearchShortcut();
    }, 1000);
});
