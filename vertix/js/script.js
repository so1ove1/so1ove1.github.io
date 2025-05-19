document.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('main-header');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const head = document.head;

    const faviconLinks = `
        <link rel="apple-touch-icon" sizes="57x57" href="/vertix/favicon/favicon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="/vertix/favicon/favicon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="/vertix/favicon/favicon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="/vertix/favicon/favicon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/vertix/favicon/favicon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/vertix/favicon/favicon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/vertix/favicon/favicon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/vertix/favicon/favicon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/vertix/favicon/favicon-180x180.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/vertix/favicon/favicon-16x16.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/vertix/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="/vertix/favicon/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/vertix/favicon/favicon-192x192.png">
        <link rel="shortcut icon" type="image/x-icon" href="/vertix/favicon/favicon.ico">
        <link rel="icon" type="image/x-icon" href="/vertix/favicon/favicon.ico">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="/vertix/favicon/favicon-144x144.png">
        <meta name="msapplication-config" content="/vertix/favicon/browserconfig.xml">
    `;

    head.insertAdjacentHTML('beforeend', faviconLinks);

    // эффект прокрутки для заголовка
    window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // мобильное меню
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');

            const menuIcon = mobileMenuToggle.querySelector('svg');

            if (!mobileMenu.classList.contains('hidden')) {
                // Иконка Х
                menuIcon.innerHTML = `
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        `;
            } else {
                // Иконка гамбургер
                menuIcon.innerHTML = `
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        `;
            }
        });
    }

    // закрываем мобильное меню при клике на ссылку
    if (mobileMenu) {
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.add('hidden');

                // возвращаем иконку гамбургер
                const menuIcon = mobileMenuToggle.querySelector('svg');
                menuIcon.innerHTML = `
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        `;
            });
        });
    }

    // добавляем плавную прокрутку для ссылок с якорем
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70, // смещение для фиксированного заголовка
                    behavior: 'smooth'
                });
            }
        });
    });

    // Анимация на фоне
    const graphBackground = document.getElementById('graph-background');
    if (graphBackground) {
        // Инициализируем анимацию сразу при загрузке страницы
        createGraphAnimation(graphBackground);
    }

    // Массив SVG-графов
    function getRandomGraph() {
        const graphs = [
            // Простой связанный граф
            `<svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="20" cy="20" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="60" cy="20" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="20" cy="60" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="60" cy="60" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <line x1="20" y1="20" x2="60" y2="20" stroke="#1e40af" stroke-width="2"/>
        <line x1="20" y1="20" x2="20" y2="60" stroke="#1e40af" stroke-width="2"/>
        <line x1="60" y1="20" x2="60" y2="60" stroke="#1e40af" stroke-width="2"/>
        <line x1="20" y1="60" x2="60" y2="60" stroke="#1e40af" stroke-width="2"/>
        <line x1="20" y1="20" x2="60" y2="60" stroke="#1e40af" stroke-width="2"/>
      </svg>`,

            // Звездный граф
            `<svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="40" cy="10" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="70" cy="40" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="40" cy="70" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="10" cy="40" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <line x1="40" y1="40" x2="40" y2="10" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="40" x2="70" y2="40" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="40" x2="40" y2="70" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="40" x2="10" y2="40" stroke="#1e40af" stroke-width="2"/>
      </svg>`,

            // Циклический граф
            `<svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="10" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="70" cy="40" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="40" cy="70" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="10" cy="40" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <line x1="40" y1="10" x2="70" y2="40" stroke="#1e40af" stroke-width="2"/>
        <line x1="70" y1="40" x2="40" y2="70" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="70" x2="10" y2="40" stroke="#1e40af" stroke-width="2"/>
        <line x1="10" y1="40" x2="40" y2="10" stroke="#1e40af" stroke-width="2"/>
      </svg>`,

            // Дерево
            `<svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="10" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="20" cy="30" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="60" cy="30" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="10" cy="50" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="30" cy="50" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="50" cy="50" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="70" cy="50" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <line x1="40" y1="10" x2="20" y2="30" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="10" x2="60" y2="30" stroke="#1e40af" stroke-width="2"/>
        <line x1="20" y1="30" x2="10" y2="50" stroke="#1e40af" stroke-width="2"/>
        <line x1="20" y1="30" x2="30" y2="50" stroke="#1e40af" stroke-width="2"/>
        <line x1="60" y1="30" x2="50" y2="50" stroke="#1e40af" stroke-width="2"/>
        <line x1="60" y1="30" x2="70" y2="50" stroke="#1e40af" stroke-width="2"/>
      </svg>`,

            // Полный граф
            `<svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="10" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="70" cy="30" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="60" cy="65" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="20" cy="65" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <circle cx="10" cy="30" r="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
        <line x1="40" y1="10" x2="70" y2="30" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="10" x2="60" y2="65" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="10" x2="20" y2="65" stroke="#1e40af" stroke-width="2"/>
        <line x1="40" y1="10" x2="10" y2="30" stroke="#1e40af" stroke-width="2"/>
        <line x1="70" y1="30" x2="60" y2="65" stroke="#1e40af" stroke-width="2"/>
        <line x1="70" y1="30" x2="20" y2="65" stroke="#1e40af" stroke-width="2"/>
        <line x1="70" y1="30" x2="10" y2="30" stroke="#1e40af" stroke-width="2"/>
        <line x1="60" y1="65" x2="20" y2="65" stroke="#1e40af" stroke-width="2"/>
        <line x1="60" y1="65" x2="10" y2="30" stroke="#1e40af" stroke-width="2"/>
        <line x1="20" y1="65" x2="10" y2="30" stroke="#1e40af" stroke-width="2"/>
      </svg>`
        ];

        return graphs[Math.floor(Math.random() * graphs.length)];
    }

    // Создаем анимацию графов
    function createGraphAnimation(container) {
        const graphCount = 12; // Увеличено количество начальных элементов

        // Распределяем начальные элементы по всей высоте контейнера
        for (let i = 0; i < graphCount; i++) {
            createGraphElement(container, i < 6); // Для первых элементов используем специальные настройки
        }

        // Периодически создаем новые элементы
        setInterval(() => {
            if (document.visibilityState === "visible") {
                createGraphElement(container, false);
            }
        }, 700);
    }

    // Создаем элемент графа
    function createGraphElement(container, isInitial) {
        // Создаем новый div для графа
        const element = document.createElement("div");
        element.className = "graph-element";

        // Устанавливаем содержимое SVG
        element.innerHTML = getRandomGraph();

        // Случайная позиция, размер и продолжительность анимации
        const scale = Math.random() * 1.5 + 0.5; // 0.5-2x масштаб
        const left = Math.random() * 100; // 0-100%

        let initialPosition;
        let animationDuration;
        let delay;

        if (isInitial) {
            // Для начальных элементов: распределяем по высоте контейнера
            initialPosition = Math.random() * 80; // От 0% до 80% высоты контейнера
            animationDuration = Math.random() * 10 + 15; // 15-25 секунд
            delay = Math.random() * 0.5; // Минимальная задержка для начальных элементов
        } else {
            // Для последующих элементов: начинаем снизу
            initialPosition = -10; // Немного ниже видимой части
            animationDuration = Math.random() * 15 + 15; // 15-30 секунд
            delay = Math.random() * 5; // 0-5 секунд
        }

        const rotate = Math.random() * 360; // 0-360 градусов

        // Применяем стили
        element.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
        element.style.left = `${left}%`;
        element.style.bottom = `${initialPosition}%`; // Используем процентное значение от высоты контейнера
        element.style.animationDuration = `${animationDuration}s`;
        element.style.animationDelay = `${delay}s`;

        // Для начальных элементов сразу устанавливаем непрозрачность
        if (isInitial) {
            element.style.opacity = "0.8";
            // Применяем собственную анимацию движения
            element.animate([
                { transform: `scale(${scale}) rotate(${rotate}deg) translateY(0)`, opacity: 0.8 },
                { transform: `scale(${scale}) rotate(${rotate + 180}deg) translateY(-${100 + initialPosition}vh)`, opacity: 0.8, offset: 0.9 },
                { transform: `scale(${scale}) rotate(${rotate + 360}deg) translateY(-${100 + initialPosition}vh)`, opacity: 0 }
            ], {
                duration: animationDuration * 1000,
                easing: 'linear',
                fill: 'forwards'
            });
        }

        // Добавляем в контейнер
        container.appendChild(element);

        // Удаляем после завершения анимации
        setTimeout(
            () => {
                if (container.contains(element)) {
                    container.removeChild(element);
                }
            },
            (animationDuration + delay) * 1000
        );
    }
});