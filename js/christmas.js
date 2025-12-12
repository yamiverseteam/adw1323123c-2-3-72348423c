export const initializeChristmasEffects = () => {
    const today = new Date();
    // Check if it's December (Month is 0-indexed, so 11 is December)
    if (today.getMonth() === 11) {
        addChristmasStyles();
        createSnow();
        addHatToLogo();
    }
};

const addChristmasStyles = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'christmas.css';
    document.head.appendChild(link);
};

const createSnow = () => {
    const snowflakeCount = 50;
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.textContent = '❄';

        // Random positioning and animation
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
        snowflake.style.opacity = Math.random();
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

        document.body.appendChild(snowflake);
    }
};

const addHatToLogo = () => {
    // Define the target logo containers and their specific options
    const targets = [
        { selector: '#mainLogoContainer', size: 'normal' },
        { selector: '#loginLogo', size: 'small' },
        { selector: '#aboutModalLogo', size: 'about' }
    ];

    targets.forEach(target => {
        const logoContainer = document.querySelector(target.selector);

        if (logoContainer) {
            // Check if hat already exists to avoid duplication
            if (logoContainer.querySelector('.christmas-hat')) {
                return;
            }

            // Create hat image element
            const hatImg = document.createElement('img');
            hatImg.src = 'decoraciones/gorro navidad.svg';
            hatImg.alt = 'Gorro de Navidad';
            hatImg.classList.add('christmas-hat');

            if (target.size === 'small') {
                hatImg.classList.add('small');
            } else if (target.size === 'about') {
                hatImg.classList.add('about');
            }

            // Ensure container is relative so the absolute hat is positioned correctly
            logoContainer.style.position = 'relative';

            // Append hat
            logoContainer.appendChild(hatImg);
        }
    });
};
