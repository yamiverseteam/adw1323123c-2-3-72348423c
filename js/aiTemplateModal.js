// AI Template Modal Module - Fills entire form with template data
export class AITemplateManager {
  constructor() {
    this.templates = [];
    this.loadTemplates();
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
      console.log('AI Templates loaded:', this.templates.length);
    } catch (error) {
      console.error('Error loading AI templates:', error);
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

      // Transform data to expected format
      const templates = rawData.map(row => ({
        id: row.id,
        nombre: row.nombre,
        categoria: row.categoria,
        tags: typeof row.tags === 'string' ? row.tags.split(',').map(tag => tag.trim()) : [],
        tipificacion: {
          tipoTarea: row.tipoTarea,
          motivo: row.motivo,
          subvaloracion: row.subvaloracion,
          estado: row.estado
        },
        observacion: row.observacion
      }));

      console.log(`Loaded ${templates.length} templates from ${filePath}`);
      return templates;
    } catch (error) {
      console.error(`Error loading Excel file ${filePath}:`, error);
      return [];
    }
  }

  searchTemplates(query) {
    if (!query || query.trim() === '') {
      return this.templates;
    }

    const searchTerm = query.toLowerCase();
    return this.templates.filter(template => {
      const matchesNombre = template.nombre.toLowerCase().includes(searchTerm);
      const matchesCategoria = template.categoria.toLowerCase().includes(searchTerm);
      const matchesTags = template.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      const matchesObservacion = template.observacion.toLowerCase().includes(searchTerm);

      return matchesNombre || matchesCategoria || matchesTags || matchesObservacion;
    });
  }

  getTemplateById(id) {
    return this.templates.find(template => template.id === id);
  }

  applyTemplateToForm(templateId) {
    const template = this.getTemplateById(templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return false;
    }

    // Fill observation field (always available)
    const observacionForm = document.getElementById('observacionForm');
    if (observacionForm) {
      observacionForm.value = template.observacion;
    }

    // Fill form fields if they exist in the template
    if (template.formData) {
      // Fill RUT
      if (template.formData.rut) {
        const rutInput = document.getElementById('rutCliente');
        if (rutInput) rutInput.value = template.formData.rut;
      }

      // Fill service with failure
      if (template.formData.servicioFalla) {
        const servicioInput = document.getElementById('servicioFalla');
        if (servicioInput) servicioInput.value = template.formData.servicioFalla;
      }

      // Fill phone
      if (template.formData.telefono) {
        const telefonoInput = document.getElementById('telefonoCliente');
        if (telefonoInput) telefonoInput.value = template.formData.telefono;
      }

      // Fill address
      if (template.formData.direccion) {
        const direccionInput = document.getElementById('direccionCliente');
        if (direccionInput) direccionInput.value = template.formData.direccion;
      }

      // Fill ONT
      if (template.formData.ont) {
        const ontInput = document.getElementById('ontCliente');
        if (ontInput) ontInput.value = template.formData.ont;
      }

      // Fill OLT
      if (template.formData.olt) {
        const oltInput = document.getElementById('oltCliente');
        if (oltInput) oltInput.value = template.formData.olt;
      }

      // Fill card
      if (template.formData.tarjeta) {
        const tarjetaInput = document.getElementById('tarjetaCliente');
        if (tarjetaInput) tarjetaInput.value = template.formData.tarjeta;
      }

      // Fill port
      if (template.formData.puerto) {
        const puertoInput = document.getElementById('puertoCliente');
        if (puertoInput) puertoInput.value = template.formData.puerto;
      }

      // Fill node
      if (template.formData.nodo) {
        const nodoInput = document.getElementById('nodoCliente');
        if (nodoInput) nodoInput.value = template.formData.nodo;
      }

      // Show notification with full form fill
      window.showNotification(`Plantilla "${template.nombre}" aplicada al formulario completo`, 'success');
    } else {
      // Show notification for observation only
      window.showNotification(`Plantilla "${template.nombre}" aplicada a la observación`, 'success');
    }

    return true;
  }

  getCategorias() {
    const categorias = new Set();
    this.templates.forEach(template => {
      categorias.add(template.categoria);
    });
    return Array.from(categorias).sort();
  }
}

// Create AI modal HTML
export function createAITemplateModal() {
  const modalHTML = `
    <div id="aiTemplateModal" class="modal">
      <div class="modal-content ai-modal-enhanced" style="max-width: 1000px; max-height: 92vh; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.98)); backdrop-filter: blur(20px); border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.3); overflow: hidden;">
        
        <!-- Header with gradient background -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 28px 32px; margin: -20px -20px 24px -20px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h20v20H0z\" fill=\"none\"/%3E%3Cpath d=\"M0 0h10v10H0zM10 10h10v10H10z\" fill=\"rgba(255,255,255,0.03)\"/%3E%3C/svg%3E'); opacity: 0.3;"></div>
          
          <span class="close-button material-icons" onclick="cerrarModal('aiTemplateModal')" style="position: absolute; top: 16px; right: 16px; color: white; cursor: pointer; font-size: 28px; z-index: 10; background: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all 0.3s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='rotate(90deg)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='rotate(0deg)';">close</span>
          
          <div style="position: relative; z-index: 1;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
              <div style="background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(10px); border-radius: 16px; padding: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                <span class="material-icons" style="font-size: 36px; color: white;">psychology</span>
              </div>
              <div>
                <h2 style="margin: 0; color: white; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  Asistente IA
                </h2>
                <p style="margin: 4px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; font-weight: 400;">
                  Autocompletar formulario con plantillas inteligentes
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Search section -->
        <div class="ai-search-container" style="margin-bottom: 24px; padding: 0 4px;">
          <div style="position: relative;">
            <span class="material-icons" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #667eea; font-size: 24px; z-index: 1;">search</span>
            <input 
              type="text" 
              id="aiTemplatesSearchInput" 
              placeholder="Busca por nombre, categoría, palabras clave..."
              style="width: 100%; padding: 16px 16px 16px 52px; border: 2px solid #e5e7eb; border-radius: 16px; font-size: 15px; background: white; color: var(--input-text); transition: all 0.3s; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);"
            />
          </div>
          <div style="margin-top: 12px; padding: 12px 16px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08)); border-radius: 12px; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-size: 13px; color: #4b5563; display: flex; align-items: center; gap: 8px; line-height: 1.6;">
              <span class="material-icons" style="font-size: 18px; color: #667eea;">info</span>
              <span><strong>Tip:</strong> Selecciona una plantilla para llenar automáticamente todos los campos del formulario</span>
            </p>
          </div>
        </div>

        <!-- Filter buttons -->
        <div class="ai-filter-container" style="margin-bottom: 24px; display: flex; gap: 10px; flex-wrap: wrap; padding: 0 4px;">
          <button class="ai-filter-btn active" data-category="all" style="padding: 11px 20px; border-radius: 12px; border: 2px solid #667eea; background: linear-gradient(135deg, #667eea, #764ba2); color: white; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25); display: inline-flex; align-items: center; gap: 6px;">
            <span class="material-icons" style="font-size: 18px;">apps</span>
            <span>Todas</span>
          </button>
        </div>

        <!-- Templates list -->
        <div id="aiTemplatesListContainer" style="max-height: 480px; overflow-y: auto; padding: 0 4px 4px 4px; margin: 0 -4px;">
          <div id="aiTemplatesList"></div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: right; display: flex; justify-content: space-between; align-items: center;">
          <p style="margin: 0; font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px;">
            <span class="material-icons" style="font-size: 16px;">auto_awesome</span>
            <span>Plantillas cargadas dinámicamente</span>
          </p>
          <button class="button" onclick="cerrarModal('aiTemplateModal')" style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 12px 24px; border-radius: 12px; border: none; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0, 0, 0, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)';">
            <span class="material-icons" style="vertical-align: middle; margin-right: 6px; font-size: 18px;">close</span>
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

// Render AI templates list
export function renderAITemplatesList(templates, searchQuery = '') {
  const templatesList = document.getElementById('aiTemplatesList');
  if (!templatesList) return;

  if (templates.length === 0) {
    templatesList.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <span class="material-icons" style="font-size: 64px; opacity: 0.3; margin-bottom: 16px;">search_off</span>
        <p style="margin-top: 16px; font-size: 16px;">No se encontraron plantillas</p>
        <p style="margin-top: 8px; font-size: 13px;">Intenta con otros términos de búsqueda</p>
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
    <div class="ai-template-card" data-template-id="${template.id}" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
      
      <!-- Gradient accent bar -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);"></div>
      
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 16px;">
        <div style="flex: 1;">
          <!-- Title with icon -->
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; padding: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);">
              <span class="material-icons" style="font-size: 20px; color: white;">description</span>
            </div>
            <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 700; line-height: 1.3;">
              ${highlightText(template.nombre, searchQuery)}
            </h3>
          </div>
          
          <!-- Tags -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
            <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);">
              <span class="material-icons" style="font-size: 14px;">category</span>
              ${template.categoria}
            </span>
            ${template.tags.slice(0, 3).map(tag => `
              <span style="background: #f3f4f6; color: #4b5563; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; border: 1px solid #e5e7eb;">
                ${highlightText(tag, searchQuery)}
              </span>
            `).join('')}
          </div>
        </div>
        
        <!-- Apply button -->
        <button class="apply-ai-template-btn" data-template-id="${template.id}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 14px 24px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3); transition: all 0.3s; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          <span class="material-icons" style="font-size: 20px;">auto_fix_high</span>
          <span>Aplicar</span>
        </button>
      </div>
      
      <!-- Tipification details -->
      <div class="ai-template-details" style="background: linear-gradient(135deg, #f9fafb, #f3f4f6); padding: 16px; border-radius: 12px; margin-bottom: 14px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 4px;">
          <strong style="color: #374151; font-size: 13px; display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
            <span class="material-icons" style="font-size: 18px; color: #667eea;">assignment</span>
            Información de Tipificación
          </strong>
          <div style="font-size: 12px; color: #6b7280; line-height: 1.8; padding-left: 24px;">
            <div style="display: grid; grid-template-columns: 140px 1fr; gap: 8px 12px; margin-top: 8px;">
              <span style="color: #374151; font-weight: 600;">Tipo de Tarea:</span>
              <span style="color: #1f2937;">${template.tipificacion.tipoTarea}</span>
              
              <span style="color: #374151; font-weight: 600;">Motivo:</span>
              <span style="color: #1f2937;">${template.tipificacion.motivo}</span>
              
              <span style="color: #374151; font-weight: 600;">Subvaloración:</span>
              <span style="color: #1f2937;">${template.tipificacion.subvaloracion}</span>
              
              <span style="color: #374151; font-weight: 600;">Estado:</span>
              <span style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 4px 12px; border-radius: 6px; font-weight: 700; display: inline-block; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);">${template.tipificacion.estado}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Observation -->
      <div>
        <strong style="color: #374151; font-size: 13px; display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
          <span class="material-icons" style="font-size: 18px; color: #667eea;">notes</span>
          Observación
        </strong>
        <div style="background: white; padding: 14px; border-radius: 10px; border: 2px solid #e5e7eb; border-left: 4px solid #667eea;">
          <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.7; max-height: 90px; overflow: hidden; text-overflow: ellipsis;">
            ${highlightText(template.observacion, searchQuery)}
          </p>
        </div>
      </div>
    </div>
  `).join('');

  // Add click event listeners to apply buttons
  document.querySelectorAll('.apply-ai-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const templateId = btn.dataset.templateId;
      if (window.aiTemplateManager) {
        window.aiTemplateManager.applyTemplateToForm(templateId);
        window.cerrarModal('aiTemplateModal');
      }
    });

    // Add hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
    });
  });

  // Add click event to expand/collapse template cards
  document.querySelectorAll('.ai-template-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--accent-primary)';
      card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'var(--input-border)';
      card.style.boxShadow = 'none';
      card.style.transform = 'translateY(0)';
    });
  });
}

// Initialize AI templates modal
export function initializeAITemplateModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById('aiTemplateModal')) {
    createAITemplateModal();
  }

  // Initialize AI template manager
  if (!window.aiTemplateManager) {
    window.aiTemplateManager = new AITemplateManager();
  }

  // Wait for templates to load, then render
  setTimeout(() => {
    const categorias = window.aiTemplateManager.getCategorias();
    const filterContainer = document.querySelector('.ai-filter-container');

    if (filterContainer) {
      // Add category filter buttons
      categorias.forEach(categoria => {
        const btn = document.createElement('button');
        btn.className = 'ai-filter-btn';
        btn.dataset.category = categoria;
        btn.innerHTML = `<span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">folder</span>${categoria}`;
        btn.style.cssText = 'padding: 10px 18px; border-radius: 24px; border: 2px solid var(--accent-primary); background: transparent; color: var(--accent-primary); cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s;';
        filterContainer.appendChild(btn);
      });

      // Add filter button event listeners
      document.querySelectorAll('.ai-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.ai-filter-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = 'var(--accent-primary)';
          });
          btn.classList.add('active');
          btn.style.background = 'var(--accent-primary)';
          btn.style.color = 'var(--button-text-color)';

          const category = btn.dataset.category;
          const searchQuery = document.getElementById('aiTemplatesSearchInput')?.value || '';
          let filtered = window.aiTemplateManager.searchTemplates(searchQuery);

          if (category !== 'all') {
            filtered = filtered.filter(t => t.categoria === category);
          }

          renderAITemplatesList(filtered, searchQuery);
        });
      });
    }

    // Search functionality
    const searchInput = document.getElementById('aiTemplatesSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const activeCategory = document.querySelector('.ai-filter-btn.active')?.dataset.category || 'all';
        let filtered = window.aiTemplateManager.searchTemplates(query);

        if (activeCategory !== 'all') {
          filtered = filtered.filter(t => t.categoria === activeCategory);
        }

        renderAITemplatesList(filtered, query);
      });

      // Add focus effect
      searchInput.addEventListener('focus', () => {
        searchInput.style.borderColor = 'var(--accent-primary)';
        searchInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
      });
      searchInput.addEventListener('blur', () => {
        searchInput.style.borderColor = 'var(--accent-primary)';
        searchInput.style.boxShadow = 'none';
      });
    }

    // Initial render
    renderAITemplatesList(window.aiTemplateManager.templates);
  }, 500);
}

// Function to open AI templates modal
export function openAITemplateModal() {
  initializeAITemplateModal();
  window.abrirModal('aiTemplateModal');
}

// Expose to window
window.openAITemplateModal = openAITemplateModal;
