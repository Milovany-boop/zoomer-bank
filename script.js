// script.js

// Объявляем функции ДО их использования
function showNotification(message, type = 'info') {
    try {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00ff00' : '#0099ff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 0 20px ${type === 'error' ? 'rgba(255, 0, 0, 0.5)' : type === 'success' ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 255, 0.5)'};
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
            font-family: inherit;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(0)';
            }
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка при создании уведомления:', error);
    }
}

function openCardForm() {
    console.log('Кнопка нажата - открытие формы карты');
    
    // Используем глобальную функцию
    if (typeof window.openCardForm === 'function') {
        window.openCardForm();
    } else {
        showNotification('Форма карты временно недоступна', 'error');
    }
}

function initGameParallax() {
    const gameSection = document.querySelector('.game-section');
    if (!gameSection) return;

    gameSection.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
        
        const parallaxLayer = gameSection.querySelector('.parallax-layer');
        if (parallaxLayer) {
            parallaxLayer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
}

function initMobileMenu() {
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '☰';
    mobileMenuButton.style.cssText = `
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        display: none;
    `;

    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.appendChild(mobileMenuButton);
        
        mobileMenuButton.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
        });
    }
}

function initApp() {
    console.log('🚀 Инициализация приложения');
    
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Инициализация формы карты
    if (typeof initCardForm === 'function') {
        initCardForm();
    }
    
    // Добавляем обработчик для пункта "Карты" в навигации
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        if (link.textContent.trim() === 'Карты') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Навигация "Карты" нажата');
                openCardForm();
            });
        }
    });
    
    // Параллакс эффект для героя
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
        }
    });

    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Добавляем анимацию для карточек фич
                if (entry.target.classList.contains('feature-card')) {
                    const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 0.2;
                    entry.target.style.animationDelay = `${delay}s`;
                    entry.target.classList.add('slide-up');
                }
            }
        });
    }, observerOptions);

    // Наблюдаем за всеми секциями и карточками
    document.querySelectorAll('section, .feature-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Плавная прокрутка для навигации
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Пропускаем ссылки которые уже обрабатываются отдельно
        if (anchor.textContent.trim() === 'Карты') return;
        
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Динамическое обновление года в футере
    const yearElement = document.querySelector('.footer-info p');
    if (yearElement && yearElement.textContent.includes('2024')) {
        yearElement.textContent = yearElement.textContent.replace('2024', new Date().getFullYear());
    }

    // Добавляем класс для анимации при загрузке
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('loaded');
    });

    // Инициализация параллакса для игровой секции
    initGameParallax();
    
    console.log('✅ Приложение инициализировано');
}

// Запуск при полной загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Обработчик ошибок с защитой от повторяющихся уведомлений
let errorNotificationShown = false;
window.addEventListener('error', (e) => {
    // Игнорируем ошибки связанные с notification если они уже обрабатываются
    if (e.message && e.message.includes('notification')) {
        return;
    }
    console.error('Произошла ошибка:', e.error);
    
    if (!errorNotificationShown) {
        errorNotificationShown = true;
        // Используем setTimeout чтобы убедиться что функция уже определена
        setTimeout(() => {
            if (typeof showNotification === 'function') {
                showNotification('Произошла непредвиденная ошибка', 'error');
            }
        }, 100);
    }
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанный промис:', e.reason);
    
    if (!errorNotificationShown) {
        errorNotificationShown = true;
        setTimeout(() => {
            if (typeof showNotification === 'function') {
                showNotification('Произошла ошибка при загрузке', 'error');
            }
        }, 100);
    }
});

// Экспортируем функции для глобального использования
window.initApp = initApp;
window.showNotification = showNotification;
window.openCardForm = openCardForm;