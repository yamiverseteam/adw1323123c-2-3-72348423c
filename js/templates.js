// Template Manager Module
export class TemplateManager {
  constructor() {
    this.templates = [];
    this.shortcuts = [];
    this.loadTemplates();
    this.loadShortcuts();
  }

  async loadTemplates() {
    try {
      // Load the JSON file containing Excel file paths
      const response = await fetch('templates/templates.json');
      const excelPaths = await response.json();

      // Load all Excel files and combine templates
      const allTemplates = [];
      for (const excelPath of excelPaths) {
        const templates = await this.loadExcelFile(excelPath);
        allTemplates.push(...templates);
      }

      this.templates = allTemplates;
      console.log('Templates loaded:', this.templates.length);
    } catch (error) {
      console.error('Error loading templates:', error);
      this.templates = [];
    }
  }

  async loadExcelFile(filePath) {
    try {
      // Fetch the Excel file
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();

      // Read the Excel file using XLSX library
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert sheet to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      // Transform data to expected format and filter out invalid entries
      const templates = rawData
        .map(row => ({
          id: row.id,
          nombre: row.nombre,
          // Transform "Otros" category to "General" for display
          categoria: row.categoria === 'Otros' ? 'General' : row.categoria,
          tags: typeof row.tags === 'string' ? row.tags.split(',').map(tag => tag.trim()) : [],
          tipificacion: {
            tipoTarea: row.tipoTarea,
            motivo: row.motivo,
            subvaloracion: row.subvaloracion,
            estado: row.estado
          },
          observacion: row.observacion
        }))
        .filter(template => {
          // Filter out templates with undefined or empty essential fields
          return template.nombre &&
            template.nombre !== 'undefined' &&
            template.categoria &&
            template.categoria !== 'undefined' &&
            template.observacion &&
            template.observacion !== 'undefined' &&
            template.nombre.trim() !== '' &&
            template.categoria.trim() !== '' &&
            template.observacion.trim() !== '';
        });

      console.log(`Loaded ${templates.length} templates from ${filePath}`);
      return templates;
    } catch (error) {
      console.error(`Error loading Excel file ${filePath}:`, error);
      return [];
    }
  }

  loadShortcuts() {
    try {
      const shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
      // Convert shortcuts to template format
      this.shortcuts = shortcuts.map(shortcut => ({
        id: `shortcut-${shortcut.id || shortcut.key}`,
        nombre: shortcut.name || shortcut.key,
        categoria: shortcut.category || 'General',
        tags: [shortcut.key, shortcut.category || 'General'],
        tipificacion: {
          tipoTarea: 'Atajo personalizado',
          motivo: 'Tag rápido',
          subvaloracion: 'N/A',
          estado: 'Activo'
        },
        observacion: shortcut.template,
        isShortcut: true
      }));
      console.log('Shortcuts loaded:', this.shortcuts.length);
    } catch (error) {
      console.error('Error loading shortcuts:', error);
      this.shortcuts = [];
    }
  }

  getAllItems() {
    // Combine templates and shortcuts
    return [...this.templates, ...this.shortcuts];
  }

  searchTemplates(query) {
    const allItems = this.getAllItems();

    if (!query || query.trim() === '') {
      return allItems;
    }

    const searchTerm = query.toLowerCase();
    return allItems.filter(template => {
      const matchesNombre = template.nombre.toLowerCase().includes(searchTerm);
      const matchesCategoria = template.categoria.toLowerCase().includes(searchTerm);
      const matchesTags = template.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      const matchesObservacion = template.observacion.toLowerCase().includes(searchTerm);

      return matchesNombre || matchesCategoria || matchesTags || matchesObservacion;
    });
  }

  getTemplateById(id) {
    const allItems = this.getAllItems();
    return allItems.find(template => template.id === id);
  }

  applyTemplate(templateId) {
    const template = this.getTemplateById(templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return false;
    }

    // Fill observation field - try soporteGenerado first, then observacionForm
    const soporteGenerado = document.getElementById('soporteGenerado');
    const observacionForm = document.getElementById('observacionForm');

    if (soporteGenerado && soporteGenerado.offsetParent !== null) {
      // soporteGenerado is visible, use it
      soporteGenerado.value = template.observacion;

      // Show template info if it's a saved template or if tags option is enabled
      const showTemplateInfo = !template.isShortcut || localStorage.getItem('showTemplateInfoForTags') === 'true';

      if (showTemplateInfo && template.tipificacion) {
        this.displayTemplateInfo(template);
      }
    } else if (observacionForm) {
      // Fall back to observacionForm
      observacionForm.value = template.observacion;
    }

    // Show notification
    const type = template.isShortcut ? 'atajo' : 'plantilla';
    window.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} "${template.nombre}" aplicada correctamente`, 'success');

    return true;
  }

  displayTemplateInfo(template) {
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


  getCategorias() {
    const allItems = this.getAllItems();
    const categorias = new Set();
    allItems.forEach(template => {
      categorias.add(template.categoria);
    });
    return Array.from(categorias).sort();
  }
}

// Create modal HTML
export function createTemplatesModal() {
  const modalHTML = `
    <div id="templatesModal" class="modal">
      <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
        <span class="close-button material-icons" onclick="cerrarModal('templatesModal')">close</span>
        <h2>
          <span class="material-icons" style="vertical-align: middle; margin-right: 8px;">description</span>
          Plantillas de Tipificación
        </h2>
        
        <div class="templates-search-container" style="margin-bottom: 20px;">
          <div style="position: relative;">
            <span class="material-icons" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary);">search</span>
            <input 
              type="text" 
              id="templatesSearchInput" 
              placeholder="Buscar plantillas por nombre, categoría o palabras clave..."
              style="width: 100%; padding: 12px 12px 12px 45px; border: 1px solid var(--input-border); border-radius: 8px; font-size: 14px; background: var(--input-bg); color: var(--input-text);"
            />
          </div>
        </div>

        <div class="templates-filter-container" style="margin-bottom: 20px; display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="template-filter-btn active" data-category="all" style="padding: 8px 16px; border-radius: 20px; border: 1px solid var(--accent-primary); background: var(--accent-primary); color: var(--button-text-color); cursor: pointer; font-size: 13px; transition: all 0.3s;">
            Todas
          </button>
        </div>

        <div id="templatesListContainer" style="max-height: 400px; overflow-y: auto; padding-right: 8px;">
          <div id="templatesList"></div>
        </div>

        <div style="margin-top: 20px; text-align: right; padding-top: 15px; border-top: 1px solid var(--input-border);">
          <button class="button" onclick="cerrarModal('templatesModal')" style="background: var(--bg-tertiary); margin-right: 10px;">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHTML;
  document.body.appendChild(container.firstElementChild);
}

// Render templates list
export function renderTemplatesList(templates, searchQuery = '') {
  const templatesList = document.getElementById('templatesList');
  if (!templatesList) return;

  if (templates.length === 0) {
    templatesList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <span class="material-icons" style="font-size: 48px; opacity: 0.5;">search_off</span>
        <p style="margin-top: 16px;">No se encontraron plantillas</p>
      </div>
    `;
    return;
  }

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: #ffeb3b; padding: 2px 4px; border-radius: 3px;">$1</mark>');
  };

  templatesList.innerHTML = templates.map(template => `
    <div class="template-card" data-template-id="${template.id}" style="border: 1px solid var(--input-border); border-radius: 8px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s; background: var(--input-bg);">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; color: var(--accent-primary); font-size: 16px;">
            ${highlightText(template.nombre, searchQuery)}
          </h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
            <span style="background: var(--accent-primary); color: var(--button-text-color); padding: 4px 12px; border-radius: 12px; font-size: 12px;">
              ${template.categoria}
            </span>
            ${template.tags.slice(0, 3).map(tag => `
              <span style="background: var(--bg-tertiary); color: var(--text-primary); padding: 4px 10px; border-radius: 12px; font-size: 11px;">
                ${highlightText(tag, searchQuery)}
              </span>
            `).join('')}
          </div>
        </div>
        <button class="apply-template-btn" data-template-id="${template.id}" style="background: var(--success-color); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; white-space: nowrap; margin-left: 12px;">
          <span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">check_circle</span>
          Usar
        </button>
      </div>
      
      <div class="template-details" style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
        <div style="margin-bottom: 8px;">
          <strong style="color: var(--text-primary); font-size: 12px;">Tipificación:</strong>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.6;">
            <div><span style="color: var(--text-primary);">Tipo de Tarea:</span> ${template.tipificacion.tipoTarea}</div>
            <div><span style="color: var(--text-primary);">Motivo:</span> ${template.tipificacion.motivo}</div>
            <div><span style="color: var(--text-primary);">Subvaloración:</span> ${template.tipificacion.subvaloracion}</div>
            <div><span style="color: var(--text-primary);">Estado:</span> <span style="color: #ef4444; font-weight: bold;">${template.tipificacion.estado}</span></div>
          </div>
        </div>
      </div>
      
      <div>
        <strong style="color: var(--text-primary); font-size: 12px;">Observación:</strong>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
          ${highlightText(template.observacion, searchQuery)}
        </p>
      </div>
    </div>
  `).join('');

  // Add click event listeners to apply buttons
  document.querySelectorAll('.apply-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const templateId = btn.dataset.templateId;
      if (window.templateManager) {
        window.templateManager.applyTemplate(templateId);
        window.cerrarModal('templatesModal');
      }
    });
  });

  // Add click event to expand/collapse template cards
  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('apply-template-btn')) {
        const details = card.querySelector('.template-details p');
        if (details) {
          details.style.maxHeight = details.style.maxHeight === '60px' ? 'none' : '60px';
        }
      }
    });
  });
}

// Initialize templates modal
export function initializeTemplatesModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById('templatesModal')) {
    createTemplatesModal();
  }

  // Initialize template manager
  if (!window.templateManager) {
    window.templateManager = new TemplateManager();
  } else {
    // Reload shortcuts and templates when modal is opened
    window.templateManager.loadShortcuts();
  }

  // Wait for templates to load, then render
  setTimeout(() => {
    const categorias = window.templateManager.getCategorias();
    const filterContainer = document.querySelector('.templates-filter-container');

    if (filterContainer) {
      // Clear existing filter buttons except "Todas"
      const allButtons = filterContainer.querySelectorAll('.template-filter-btn');
      allButtons.forEach((btn, index) => {
        if (index > 0) btn.remove();
      });

      // Add category filter buttons
      categorias.forEach(categoria => {
        const btn = document.createElement('button');
        btn.className = 'template-filter-btn';
        btn.dataset.category = categoria;
        btn.textContent = categoria;
        btn.style.cssText = 'padding: 8px 16px; border-radius: 20px; border: 1px solid var(--accent-primary); background: transparent; color: var(--accent-primary); cursor: pointer; font-size: 13px; transition: all 0.3s;';
        filterContainer.appendChild(btn);
      });

      // Add filter button event listeners
      document.querySelectorAll('.template-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.template-filter-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = 'var(--accent-primary)';
          });
          btn.classList.add('active');
          btn.style.background = 'var(--accent-primary)';
          btn.style.color = 'var(--button-text-color)';

          const category = btn.dataset.category;
          const searchQuery = document.getElementById('templatesSearchInput')?.value || '';
          let filtered = window.templateManager.searchTemplates(searchQuery);

          if (category !== 'all') {
            filtered = filtered.filter(t => t.categoria === category);
          }

          renderTemplatesList(filtered, searchQuery);
        });
      });
    }

    // Search functionality
    const searchInput = document.getElementById('templatesSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const activeCategory = document.querySelector('.template-filter-btn.active')?.dataset.category || 'all';
        let filtered = window.templateManager.searchTemplates(query);

        if (activeCategory !== 'all') {
          filtered = filtered.filter(t => t.categoria === activeCategory);
        }

        renderTemplatesList(filtered, query);
      });
    }

    // Initial render with all items
    renderTemplatesList(window.templateManager.getAllItems());
  }, 500);
}

// Listen for shortcuts updates
document.addEventListener('shortcutsUpdated', () => {
  if (window.templateManager) {
    window.templateManager.loadShortcuts();
    // Re-render if modal is open
    if (document.getElementById('templatesModal')?.style.display === 'flex') {
      renderTemplatesList(window.templateManager.getAllItems());
    }
  }
});

// Function to open templates modal
export function openTemplatesModal() {
  initializeTemplatesModal();
  window.abrirModal('templatesModal');
}

// Expose to window
window.openTemplatesModal = openTemplatesModal;
