/**
 * Config Loader - Módulo para cargar y desencriptar configuración
 * 
 * Este módulo maneja la carga segura de URLs de formularios desde
 * un archivo de configuración encriptado.
 */

/**
 * Decodifica una cadena Base64
 * @param {string} encodedBase64 - Cadena codificada en Base64
 * @returns {string} - Cadena decodificada
 */
function base64Decode(encodedBase64) {
    try {
        // Decodificar de Base64
        return atob(encodedBase64);
    } catch (error) {
        console.error('Error al decodificar configuración:', error);
        return null;
    }
}

/**
 * Carga la configuración encriptada y la desencripta
 * @returns {Object} - Objeto con las URLs desencriptadas
 */
export function loadEncryptedConfig() {
    try {
        // Importar la configuración encriptada
        if (!window.ENCRYPTED_CONFIG) {
            throw new Error('Configuración encriptada no encontrada');
        }

        // Decodificar las URLs (Base64)
        const surveyBaseUrl = base64Decode(window.ENCRYPTED_CONFIG.SURVEY_BASE_URL);
        const surveyPersisteBaseUrl = base64Decode(window.ENCRYPTED_CONFIG.SURVEY_PERSISTE_BASE_URL);

        if (!surveyBaseUrl || !surveyPersisteBaseUrl) {
            throw new Error('Error al decodificar las URLs');
        }

        console.log('URLs decodificadas correctamente');
        console.log('Survey URL:', surveyBaseUrl);
        console.log('Persiste URL:', surveyPersisteBaseUrl);

        return {
            SURVEY_BASE_URL: surveyBaseUrl,
            SURVEY_PERSISTE_BASE_URL: surveyPersisteBaseUrl
        };
    } catch (error) {
        console.error('Error al cargar configuración:', error);

        // Valores por defecto en caso de error (URLs de placeholder)
        return {
            SURVEY_BASE_URL: 'https://docs.google.com/forms/d/e/ERROR/viewform?usp=pp_url',
            SURVEY_PERSISTE_BASE_URL: 'https://docs.google.com/forms/d/e/ERROR/viewform?usp=pp_url'
        };
    }
}

/**
 * Inicializa la configuración en el objeto window
 */
export function initializeConfig() {
    const config = loadEncryptedConfig();
    window.SURVEY_BASE_URL = config.SURVEY_BASE_URL;
    window.SURVEY_PERSISTE_BASE_URL = config.SURVEY_PERSISTE_BASE_URL;

    console.log('✓ Configuración de URLs cargada correctamente');
    console.log('✓ SURVEY_BASE_URL:', window.SURVEY_BASE_URL);
    console.log('✓ SURVEY_PERSISTE_BASE_URL:', window.SURVEY_PERSISTE_BASE_URL);
}
