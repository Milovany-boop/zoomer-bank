// cards/card-form.js
class CardForm {
    constructor() {
        console.log('✅ CardForm конструктор вызван');
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {
            cardDesign: '',
            personalInfo: {},
            passportInfo: {},
            confirmation: false
        };
        
        this.init();
    }
    
    init() {
        console.log('✅ CardForm init вызван');
        this.bindEvents();
        this.showStep(1);
    }
    
    bindEvents() {
        console.log('✅ CardForm bindEvents вызван');
        
        // Закрытие формы
        const closeBtn = document.querySelector('.close-form');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('❌ Кнопка закрытия нажата');
                this.closeForm();
            });
        }
        
        // Клик по overlay
        const formOverlay = document.getElementById('cardForm');
        if (formOverlay) {
            formOverlay.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    console.log('❌ Клик по overlay');
                    this.closeForm();
                }
            });
        }
        
        // Выбор дизайна карты
        document.querySelectorAll('.card-option').forEach(option => {
            option.addEventListener('click', (e) => {
                console.log('🎨 Выбран дизайн карты');
                this.selectCardDesign(e.currentTarget);
            });
        });
        
        // Кнопки навигации
        document.querySelectorAll('[data-action="next"]').forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('➡️ Кнопка "Далее" нажата');
                this.nextStep();
            });
        });
        
        document.querySelectorAll('[data-action="prev"]').forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('⬅️ Кнопка "Назад" нажата');
                this.prevStep();
            });
        });
        
        // Отправка формы
        const submitBtn = document.querySelector('[data-action="submit"]');
        console.log('✅ Кнопка подтвердить найдена:', submitBtn);
        
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Кнопка "ПОДТВЕРДИТЬ" нажата!');
                this.submitForm();
            });
        } else {
            console.error('❌ Кнопка "ПОДТВЕРДИТЬ" не найдена!');
        }
        
        // Валидация в реальном времени
        this.setupRealTimeValidation();
        
        // Обработка клавиш
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('cardForm').style.display === 'flex') {
                this.closeForm();
            }
        });
    }
    
    setupRealTimeValidation() {
        // Валидация телефона
        document.getElementById('phone')?.addEventListener('input', (e) => {
            this.formatPhoneNumber(e.target);
        });
        
        // Валидация паспортных данных
        document.getElementById('passportSeries')?.addEventListener('input', (e) => {
            this.formatPassportSeries(e.target);
        });
        
        document.getElementById('passportNumber')?.addEventListener('input', (e) => {
            this.formatPassportNumber(e.target);
        });
    }
    
    selectCardDesign(element) {
        document.querySelectorAll('.card-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        element.classList.add('selected');
        this.formData.cardDesign = element.dataset.design;
        
        // Добавляем анимацию выбора
        element.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }
    
    showStep(stepNumber) {
        console.log('📄 Показываем шаг:', stepNumber);
        
        // Скрыть все шаги
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Показать текущий шаг
        const currentStepElement = document.getElementById(`step${stepNumber}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
            console.log('✅ Шаг', stepNumber, 'активирован');
        } else {
            console.error('❌ Шаг', stepNumber, 'не найден');
        }
        
        // Обновить прогресс бар
        this.updateProgressBar(stepNumber);
        
        this.currentStep = stepNumber;
        
        // Прокрутка к верху формы
        const formContainer = document.querySelector('.card-form-container');
        if (formContainer) {
            formContainer.scrollTop = 0;
        }
    }
    
    updateProgressBar(step) {
        document.querySelectorAll('.progress-step').forEach((progressStep, index) => {
            progressStep.classList.remove('active', 'completed');
            
            if (index + 1 === step) {
                progressStep.classList.add('active');
            } else if (index + 1 < step) {
                progressStep.classList.add('completed');
            }
        });
    }
    
    nextStep() {
        console.log('🔄 Переход к следующему шагу, текущий:', this.currentStep);
        if (this.validateStep(this.currentStep)) {
            if (this.currentStep < this.totalSteps) {
                this.showStep(this.currentStep + 1);
            }
        }
    }
    
    prevStep() {
        console.log('🔄 Возврат к предыдущему шагу, текущий:', this.currentStep);
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    validateStep(step) {
        console.log('🔍 validateStep для шага:', step);
        let isValid = true;
        
        switch(step) {
            case 1:
                if (!this.formData.cardDesign) {
                    console.log('❌ Шаг 1: не выбран дизайн карты');
                    this.showError('Пожалуйста, выберите дизайн карты');
                    isValid = false;
                } else {
                    console.log('✅ Шаг 1: дизайн выбран -', this.formData.cardDesign);
                }
                break;
                
            case 2:
                const personalData = this.collectPersonalData();
                if (!personalData.valid) {
                    console.log('❌ Шаг 2: ошибка личных данных');
                    isValid = false;
                } else {
                    console.log('✅ Шаг 2: личные данные валидны');
                    this.formData.personalInfo = personalData.data;
                }
                break;
                
            case 3:
                const passportData = this.collectPassportData();
                if (!passportData.valid) {
                    console.log('❌ Шаг 3: ошибка паспортных данных');
                    isValid = false;
                } else {
                    console.log('✅ Шаг 3: паспортные данные валидны');
                    this.formData.passportInfo = passportData.data;
                }
                break;
                
            case 4:
                console.log('✅ Шаг 4: подтверждение - всегда валидно');
                isValid = true;
                break;
        }
        
        console.log('📊 validateStep результат:', isValid);
        return isValid;
    }
    
    collectPersonalData() {
        const fullName = document.getElementById('fullName').value.trim();
        const birthDate = document.getElementById('birthDate').value;
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        
        console.log('👤 Проверка личных данных:', { fullName, birthDate, phone, email });
        
        // Валидация ФИО
        if (!fullName) {
            console.log('❌ ФИО: пустое поле');
            this.markFieldInvalid('fullName', 'Введите ФИО');
            return { valid: false };
        }
        
        if (fullName.length < 5) {
            console.log('❌ ФИО: слишком короткое');
            this.markFieldInvalid('fullName', 'ФИО должно содержать не менее 5 символов');
            return { valid: false };
        }
        
        if (!birthDate) {
            console.log('❌ Дата рождения: не указана');
            this.markFieldInvalid('birthDate', 'Укажите дату рождения');
            return { valid: false };
        }
        
        if (!this.isValidPhone(phone)) {
            console.log('❌ Телефон: невалидный формат');
            this.markFieldInvalid('phone', 'Введите корректный номер телефона');
            return { valid: false };
        }
        
        if (!this.isValidEmail(email)) {
            console.log('❌ Email: невалидный формат');
            this.markFieldInvalid('email', 'Введите корректный email');
            return { valid: false };
        }
        
        // Очищаем ошибки
        this.clearFieldErrors(['fullName', 'birthDate', 'phone', 'email']);
        
        console.log('✅ Все личные данные валидны');
        return {
            valid: true,
            data: { fullName, birthDate, phone, email }
        };
    }
    
    collectPassportData() {
        const passportSeries = document.getElementById('passportSeries').value.trim();
        const passportNumber = document.getElementById('passportNumber').value.trim();
        const issueDate = document.getElementById('issueDate').value;
        
        console.log('📋 Проверка паспортных данных:', { passportSeries, passportNumber, issueDate });
        
        if (!passportSeries || passportSeries.length !== 4) {
            console.log('❌ Серия паспорта: должна содержать 4 цифры');
            this.markFieldInvalid('passportSeries', 'Серия должна содержать 4 цифры');
            return { valid: false };
        }
        
        if (!passportNumber || passportNumber.length !== 6) {
            console.log('❌ Номер паспорта: должен содержать 6 цифр');
            this.markFieldInvalid('passportNumber', 'Номер должен содержать 6 цифр');
            return { valid: false };
        }
        
        if (!issueDate) {
            console.log('❌ Дата выдачи: не указана');
            this.markFieldInvalid('issueDate', 'Укажите дату выдачи');
            return { valid: false };
        }
        
        // Очищаем ошибки
        this.clearFieldErrors(['passportSeries', 'passportNumber', 'issueDate']);
        
        console.log('✅ Все паспортные данные валидны');
        return {
            valid: true,
            data: { passportSeries, passportNumber, issueDate }
        };
    }
    
    isValidPhone(phone) {
        const phoneRegex = /^(\+7|8)[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.substring(1);
        }
        
        if (value.length > 0) {
            value = '+7 (' + value;
        }
        if (value.length > 7) {
            value = value.substring(0, 7) + ') ' + value.substring(7);
        }
        if (value.length > 12) {
            value = value.substring(0, 12) + '-' + value.substring(12);
        }
        if (value.length > 15) {
            value = value.substring(0, 15) + '-' + value.substring(15);
        }
        
        input.value = value;
    }
    
    formatPassportSeries(input) {
        input.value = input.value.replace(/\D/g, '').substring(0, 4);
    }
    
    formatPassportNumber(input) {
        input.value = input.value.replace(/\D/g, '').substring(0, 6);
    }
    
    markFieldInvalid(fieldName, message) {
        const field = document.getElementById(fieldName);
        const formGroup = field.closest('.form-group');
        
        // Удаляем старые ошибки
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Добавляем новую ошибку
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
        
        // Подсвечиваем поле
        field.style.borderColor = '#ff4444';
        field.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
    }
    
    clearFieldErrors(fieldNames) {
        fieldNames.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                const formGroup = field.closest('.form-group');
                const errorMessage = formGroup.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
                
                field.style.borderColor = '';
                field.style.boxShadow = '';
            }
        });
    }
    
    showError(message) {
        console.log('🚨 Показываем ошибку:', message);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
            z-index: 1001;
            font-family: inherit;
            max-width: 300px;
            word-wrap: break-word;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    submitForm() {
        console.log('🚀 submitForm вызван, текущий шаг:', this.currentStep);
        
        if (this.validateStep(this.currentStep)) {
            console.log('✅ Валидация шага', this.currentStep, 'пройдена');
            
            const fullName = document.getElementById('fullName').value.trim();
            
            console.log('🔍 Проверка ФИО:', fullName);
            
            if (!fullName) {
                console.log('❌ Ошибка ФИО: поле пустое');
                this.showError('Пожалуйста, введите ФИО');
                return;
            }
            
            if (fullName.length < 5) {
                console.log('❌ Ошибка ФИО: слишком короткое');
                this.showError('ФИО должно содержать не менее 5 символов');
                return;
            }
            
            console.log('✅ ФИО проверено успешно');
            this.formData.confirmation = true;
            
            // Показываем индикатор загрузки
            const submitBtn = document.querySelector('[data-action="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'ОТПРАВКА...';
                submitBtn.disabled = true;
                console.log('🔄 Кнопка переведена в состояние отправки');
            }
            
            console.log('⏰ Запускаем таймер отправки...');
            // Имитация отправки на сервер
            setTimeout(() => {
                console.log('🕒 Таймер сработал, показываем успех');
                this.showSuccess();
                if (submitBtn) {
                    submitBtn.textContent = 'ПОДТВЕРДИТЬ';
                    submitBtn.disabled = false;
                }
            }, 2000);
        } else {
            console.log('❌ Валидация шага', this.currentStep, 'не пройдена');
        }
    }
    
    showSuccess() {
        console.log('🎉 showSuccess вызван');
        const applicationNumber = `ZB-${Date.now().toString().slice(-8)}`;
        
        console.log('📝 Создаем сообщение об успехе');
        document.getElementById('step4').innerHTML = `
            <div class="success-message">
                <h3>✅ ЗАЯВКА ПРИНЯТА!</h3>
                <p>
                    Ваша карта Zoomer Bank будет доставлена в течение 3 рабочих дней.<br><br>
                    <strong>Номер заявки: ${applicationNumber}</strong><br><br>
                    Менеджер свяжется с вами для подтверждения деталей.
                </p>
                <button class="form-btn neon-button" id="successCloseButton">ОТЛИЧНО!</button>
            </div>
        `;
        
        // Добавляем обработчик для кнопки "ОТЛИЧНО!"
        setTimeout(() => {
            const closeButton = document.getElementById('successCloseButton');
            if (closeButton) {
                console.log('✅ Кнопка "ОТЛИЧНО!" найдена, добавляем обработчик');
                closeButton.addEventListener('click', () => {
                    console.log('🎯 Кнопка "ОТЛИЧНО!" нажата');
                    this.closeForm();
                });
            } else {
                console.error('❌ Кнопка "ОТЛИЧНО!" не найдена');
            }
        }, 100);
        
        // Сохраняем данные
        this.saveApplication(applicationNumber);
        console.log('💾 Заявка сохранена:', applicationNumber);
    }
    
    saveApplication(appNumber) {
        const applications = JSON.parse(localStorage.getItem('zoomber_applications') || '[]');
        applications.push({
            number: appNumber,
            data: this.formData,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('zoomber_applications', JSON.stringify(applications));
    }
    
    openForm() {
        console.log('📋 Открытие формы карты');
        document.getElementById('cardForm').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.showStep(1);
        
        // Добавляем анимацию появления
        const formContainer = document.querySelector('.card-form-container');
        if (formContainer) {
            formContainer.style.animation = 'formAppear 0.5s ease-out';
        }
    }
    
    closeForm() {
        console.log('❌ Закрытие формы карты...');
        document.getElementById('cardForm').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetForm();
    }
    
    resetForm() {
        console.log('🔄 Сброс формы');
        this.currentStep = 1;
        this.formData = {
            cardDesign: '',
            personalInfo: {},
            passportInfo: {},
            confirmation: false
        };
        
        document.querySelectorAll('.card-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        document.querySelectorAll('.form-input').forEach(input => {
            input.value = '';
        });
        
        this.clearFieldErrors([
            'fullName', 'birthDate', 'phone', 'email',
            'passportSeries', 'passportNumber', 'issueDate'
        ]);
    }
}

// Инициализация формы
let cardForm;

function initCardForm() {
    console.log('🔄 Инициализация формы карты');
    cardForm = new CardForm();
}

function openCardForm() {
    console.log('🎯 Вызов openCardForm');
    if (!cardForm) {
        console.log('🔄 Карта форма не инициализирована, инициализируем...');
        initCardForm();
    }
    cardForm.openForm();
}

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 DOM загружен, инициализируем форму карты');
    if (typeof initCardForm === 'function') {
        initCardForm();
    }
});

// Экспортируем для глобального использования
window.cardForm = cardForm;
window.initCardForm = initCardForm;
window.openCardForm = openCardForm;

console.log('✅ cards/card-form.js загружен');