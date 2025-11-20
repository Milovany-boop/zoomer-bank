// game/game.js
class ZomBucksGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'idle';
        this.score = 0;
        this.zomBucks = 0;
        this.highScore = localStorage.getItem('zombucks_highscore') || 0;
        this.particles = [];
        this.animations = [];
        
        // Размеры canvas
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Игровые объекты
        this.zombie = {
            x: 80,
            y: this.canvas.height - 100,
            width: 50,
            height: 70,
            velocityY: 0,
            isJumping: false,
            jumpPower: 16,
            gravity: 0.8,
            frame: 0,
            color: '#00ff00'
        };
        
        this.obstacles = [];
        this.bonuses = [];
        this.backgroundElements = [];
        this.gameSpeed = 6;
        this.frameCount = 0;
        this.lastObstacleTime = 0;
        this.obstacleInterval = 90;
        
        this.init();
    }
    
    init() {
        this.createBackground();
        this.bindEvents();
        this.updateStats();
        this.gameLoop();
        
        // Добавляем начальную анимацию
        this.createTitleAnimation();
    }
    
    createTitleAnimation() {
        // Анимация появления заголовка
        const title = document.querySelector('.game-title');
        if (title) {
            title.style.animation = 'titleGlow 2s ease-in-out infinite alternate';
        }
    }
    
    createBackground() {
        // Создаем киберпанк здания на заднем фоне
        for (let i = 0; i < 8; i++) {
            this.backgroundElements.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height - 50 - Math.random() * 120,
                width: 30 + Math.random() * 60,
                height: 60 + Math.random() * 180,
                color: `hsl(${Math.random() * 60 + 240}, 70%, ${20 + Math.random() * 20}%)`,
                speed: 0.5 + Math.random() * 2,
                windows: []
            });
            
            // Добавляем окна к зданиям
            const building = this.backgroundElements[this.backgroundElements.length - 1];
            for (let j = 0; j < Math.floor(building.height / 20); j++) {
                for (let k = 0; k < Math.floor(building.width / 15); k++) {
                    if (Math.random() > 0.3) {
                        building.windows.push({
                            x: k * 15 + 5,
                            y: j * 20 + 5,
                            lit: Math.random() > 0.5
                        });
                    }
                }
            }
        }
    }
    
    bindEvents() {
        console.log('🎮 Привязка событий игры');
        
        // Обработка клавиши пробела
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleAction();
            }
        });
        
        // Обработка клика по canvas
        this.canvas.addEventListener('click', () => {
            this.handleAction();
        });
        
        // Кнопка старта игры
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('🚀 Кнопка "Начать игру" нажата');
                this.handleAction();
            });
        } else {
            console.error('❌ Кнопка "Начать игру" не найдена');
        }
        
        // Кнопка рестарта в game over - ИСПРАВЛЕНО
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-button') && 
                e.target.closest('#gameOver')) {
                console.log('🔄 Кнопка "Играть снова" нажата');
                e.preventDefault();
                this.handleAction();
            }
        });
        
        // Альтернативный способ привязки кнопки рестарта
        this.bindRestartButton();
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    // Новый метод для привязки кнопки рестарта
    bindRestartButton() {
        // Периодически проверяем наличие кнопки рестарта
        const checkRestartButton = () => {
            const restartButton = document.querySelector('#gameOver .start-button');
            if (restartButton && !restartButton._bound) {
                console.log('✅ Найдена кнопка рестарта, привязываем событие');
                restartButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🎮 Кнопка "Играть снова" нажата (прямая привязка)');
                    this.handleAction();
                });
                restartButton._bound = true;
            }
        };
        
        // Проверяем при инициализации
        setTimeout(checkRestartButton, 100);
        
        // И периодически проверяем
        setInterval(checkRestartButton, 1000);
    }
    
    handleAction() {
        console.log('🎯 Действие игры, состояние:', this.gameState);
        
        switch (this.gameState) {
            case 'idle':
                this.startGame();
                break;
            case 'playing':
                this.jump();
                break;
            case 'gameover':
                this.restartGame();
                break;
        }
    }
    
    startGame() {
        console.log('🎮 Начало новой игры');
        this.gameState = 'playing';
        this.score = 0;
        this.zomBucks = 0;
        this.obstacles = [];
        this.bonuses = [];
        this.particles = [];
        this.animations = [];
        this.frameCount = 0;
        this.gameSpeed = 6;
        this.lastObstacleTime = 0;
        
        // Сброс позиции зомби
        this.zombie.y = this.canvas.height - 100;
        this.zombie.velocityY = 0;
        this.zombie.isJumping = false;
        this.zombie.frame = 0;
        
        // Обновление UI
        this.updateStats();
        this.hideStartButton();
        this.hideGameOver();
        
        // Добавляем анимацию начала игры
        this.createStartAnimation();
    }
    
    createStartAnimation() {
        // Создаем частицы для анимации старта
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: ['#ff00ff', '#00ff00', '#00ffff'][Math.floor(Math.random() * 3)],
                size: 2 + Math.random() * 4
            });
        }
    }
    
    jump() {
        if (!this.zombie.isJumping && this.gameState === 'playing') {
            this.zombie.velocityY = -this.zombie.jumpPower;
            this.zombie.isJumping = true;
            
            // Создаем частицы при прыжке
            this.createParticles(this.zombie.x + 25, this.zombie.y + 70, 8, '#00ff00');
            
            // Добавляем звуковой эффект (если бы был)
            this.playJumpSound();
        }
    }
    
    playJumpSound() {
        // В реальном проекте здесь был бы звук прыжка
        console.log('🔊 Звук прыжка');
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 1,
                color: color,
                size: 1 + Math.random() * 3
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateZombie() {
        // Обновляем физику зомби
        this.zombie.velocityY += this.zombie.gravity;
        this.zombie.y += this.zombie.velocityY;
        this.zombie.frame++;
        
        // Проверка земли
        if (this.zombie.y >= this.canvas.height - 100) {
            this.zombie.y = this.canvas.height - 100;
            this.zombie.velocityY = 0;
            this.zombie.isJumping = false;
        }
        
        // Ограничение по верхней границе
        if (this.zombie.y < 0) {
            this.zombie.y = 0;
            this.zombie.velocityY = 0;
        }
    }
    
    createObstacle() {
        const types = [
            { width: 25, height: 45, color: '#ff4444', type: 'cactus', score: 2 },
            { width: 35, height: 35, color: '#ffaa00', type: 'rock', score: 3 },
            { width: 20, height: 60, color: '#ff00ff', type: 'pole', score: 2 },
            { width: 40, height: 25, color: '#ffff00', type: 'low', score: 4 }
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        const y = type.type === 'low' ? this.canvas.height - 55 : this.canvas.height - type.height - 30;
        
        this.obstacles.push({
            x: this.canvas.width,
            y: y,
            ...type,
            passed: false
        });
    }
    
    createBonus() {
        if (Math.random() < 0.03 && this.gameState === 'playing') {
            this.bonuses.push({
                x: this.canvas.width,
                y: this.canvas.height - 120 - Math.random() * 80,
                width: 25,
                height: 25,
                color: '#00ff00',
                value: 1,
                rotation: 0,
                collected: false,
                animation: 0
            });
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameSpeed;
            
            // Проверка прохождения препятствия
            if (!obstacle.passed && obstacle.x + obstacle.width < this.zombie.x) {
                obstacle.passed = true;
                this.score += obstacle.score;
                this.updateStats();
                this.createScoreAnimation(obstacle.x + obstacle.width / 2, obstacle.y, `+${obstacle.score}`);
            }
            
            // Удаление вышедших за границы препятствий
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateBonuses() {
        for (let i = this.bonuses.length - 1; i >= 0; i--) {
            const bonus = this.bonuses[i];
            bonus.x -= this.gameSpeed;
            bonus.rotation += 0.1;
            bonus.animation = Math.sin(this.frameCount * 0.1) * 5;
            
            if (bonus.x + bonus.width < 0) {
                this.bonuses.splice(i, 1);
            }
        }
    }
    
    updateBackground() {
        this.backgroundElements.forEach(building => {
            building.x -= building.speed;
            if (building.x + building.width < 0) {
                building.x = this.canvas.width;
            }
        });
    }
    
    checkCollisions() {
        // Столкновения с препятствиями
        for (const obstacle of this.obstacles) {
            if (this.isColliding(this.zombie, obstacle)) {
                this.createParticles(this.zombie.x + 25, this.zombie.y + 35, 15, '#ff4444');
                this.createExplosionAnimation(this.zombie.x + 25, this.zombie.y + 35);
                this.gameOver();
                return;
            }
        }
        
        // Сбор бонусов
        for (let i = this.bonuses.length - 1; i >= 0; i--) {
            const bonus = this.bonuses[i];
            if (!bonus.collected && this.isColliding(this.zombie, bonus)) {
                bonus.collected = true;
                this.zomBucks += bonus.value;
                this.createParticles(bonus.x + 12, bonus.y + 12, 12, '#00ff00');
                this.createBonusAnimation(bonus.x + 12, bonus.y + 12);
                this.bonuses.splice(i, 1);
                this.updateStats();
                this.playBonusSound();
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createScoreAnimation(x, y, text) {
        this.animations.push({
            type: 'score',
            x: x,
            y: y,
            text: text,
            life: 1,
            velocityY: -2
        });
    }
    
    createBonusAnimation(x, y) {
        this.animations.push({
            type: 'bonus',
            x: x,
            y: y,
            text: '+1 ZomBuck!',
            life: 1,
            velocityY: -1.5,
            color: '#00ff00'
        });
    }
    
    createExplosionAnimation(x, y) {
        for (let i = 0; i < 8; i++) {
            this.animations.push({
                type: 'explosion',
                x: x,
                y: y,
                angle: (i / 8) * Math.PI * 2,
                distance: 0,
                maxDistance: 30,
                speed: 2 + Math.random() * 2,
                life: 1
            });
        }
    }
    
    updateAnimations() {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            
            switch (anim.type) {
                case 'score':
                case 'bonus':
                    anim.y += anim.velocityY;
                    anim.life -= 0.02;
                    if (anim.life <= 0) {
                        this.animations.splice(i, 1);
                    }
                    break;
                    
                case 'explosion':
                    anim.distance += anim.speed;
                    anim.life = 1 - (anim.distance / anim.maxDistance);
                    if (anim.distance >= anim.maxDistance) {
                        this.animations.splice(i, 1);
                    }
                    break;
            }
        }
    }
    
    increaseDifficulty() {
        this.frameCount++;
        
        // Увеличиваем счет каждые 100 кадров
        if (this.frameCount % 100 === 0) {
            this.score += 1;
            this.updateStats();
        }
        
        // Увеличиваем скорость каждые 500 очков
        if (this.score > 0 && this.score % 500 === 0) {
            this.gameSpeed += 0.5;
            this.createSpeedUpAnimation();
        }
        
        // Создаем препятствия
        if (this.frameCount - this.lastObstacleTime > this.obstacleInterval) {
            this.createObstacle();
            this.lastObstacleTime = this.frameCount;
            
            // Постепенно уменьшаем интервал между препятствиями
            if (this.obstacleInterval > 45) {
                this.obstacleInterval -= 0.1;
            }
        }
        
        // Создаем бонусы
        this.createBonus();
    }
    
    createSpeedUpAnimation() {
        this.animations.push({
            type: 'speed',
            text: 'СКОРОСТЬ ↑',
            life: 2,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        });
    }
    
    playBonusSound() {
        // В реальном проекте здесь был бы звук сбора бонуса
        console.log('💰 Звук сбора бонуса');
    }
    
    gameOver() {
        console.log('💀 Конец игры');
        this.gameState = 'gameover';
        
        // Обновление рекорда
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('zombucks_highscore', this.highScore);
        }
        
        // Показываем экран game over с задержкой
        setTimeout(() => {
            this.showGameOver();
        }, 1000);
    }
    
    showGameOver() {
        const gameOverDiv = document.getElementById('gameOver');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'block';
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('finalZomBucks').textContent = this.zomBucks;
            document.getElementById('highScore').textContent = this.highScore;
            console.log('📊 Показан экран Game Over');
        }
    }
    
    hideGameOver() {
        const gameOverDiv = document.getElementById('gameOver');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'none';
            console.log('🎮 Скрыт экран Game Over');
        }
    }
    
    hideStartButton() {
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.style.display = 'none';
        }
    }
    
    showStartButton() {
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.style.display = 'inline-block';
        }
    }
    
    restartGame() {
        console.log('🔄 Перезапуск игры');
        this.startGame();
    }
    
    handleResize() {
        // Сохраняем соотношение сторон при изменении размера окна
        const container = this.canvas.parentElement;
        if (container) {
            const containerWidth = container.clientWidth;
            if (containerWidth < this.canvas.width) {
                this.canvas.style.width = '95%';
                this.canvas.style.height = 'auto';
            } else {
                this.canvas.style.width = '800px';
                this.canvas.style.height = '400px';
            }
        }
    }
    
    drawBackground() {
        // Фон
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Звезды
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = (i * 47) % this.canvas.height;
            const size = Math.random() * 1.5;
            this.ctx.globalAlpha = 0.3 + Math.random() * 0.7;
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1;
        
        // Киберпанк здания
        this.backgroundElements.forEach(building => {
            this.ctx.fillStyle = building.color;
            this.ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // Окна
            building.windows.forEach(window => {
                this.ctx.fillStyle = window.lit ? 
                    `hsla(60, 100%, 70%, ${0.3 + Math.random() * 0.3})` : 
                    'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(building.x + window.x, building.y + window.y, 8, 12);
            });
        });
        
        // Земля
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);
        
        // Неоновые линии на земле
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([15, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(-this.frameCount % 30, this.canvas.height - 15);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 15);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawZombie() {
        this.ctx.save();
        this.ctx.translate(this.zombie.x + 25, this.zombie.y + 35);
        
        // Анимация прыжка/бега
        if (this.zombie.isJumping) {
            this.ctx.rotate(-0.2);
        } else {
            const bounce = Math.sin(this.zombie.frame * 0.2) * 3;
            this.ctx.translate(0, bounce);
        }
        
        // Тело зомби
        this.ctx.fillStyle = this.zombie.color;
        this.ctx.fillRect(-20, -30, 40, 60);
        
        // Голова
        this.ctx.fillStyle = '#00cc00';
        this.ctx.fillRect(-15, -45, 30, 25);
        
        // Глаза
        this.ctx.fillStyle = '#ff0000';
        const eyeBlink = Math.sin(this.zombie.frame * 0.1) > 0.5 ? 4 : 8;
        this.ctx.fillRect(-8, -40, 6, eyeBlink);
        this.ctx.fillRect(2, -40, 6, eyeBlink);
        
        // Рот
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-5, -30, 10, 3);
        
        // Руки
        this.ctx.fillStyle = '#00cc00';
        const armSwing = Math.sin(this.zombie.frame * 0.3) * 5;
        this.ctx.fillRect(-25, -20 + armSwing, 10, 30);
        this.ctx.fillRect(15, -20 - armSwing, 10, 30);
        
        this.ctx.restore();
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.save();
            
            switch (obstacle.type) {
                case 'cactus':
                    this.ctx.fillStyle = obstacle.color;
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    // Иголки кактуса
                    this.ctx.fillStyle = '#00ff00';
                    for (let i = 0; i < 3; i++) {
                        this.ctx.fillRect(obstacle.x - 3, obstacle.y + 10 + i * 15, 3, 2);
                        this.ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + 10 + i * 15, 3, 2);
                    }
                    break;
                    
                case 'rock':
                    this.ctx.fillStyle = obstacle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(obstacle.x + 17, obstacle.y + 17, 17, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                    
                default:
                    this.ctx.fillStyle = obstacle.color;
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
            }
            
            // Неоновое свечение
            this.ctx.shadowColor = obstacle.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            this.ctx.restore();
        });
    }
    
    drawBonuses() {
        this.bonuses.forEach(bonus => {
            this.ctx.save();
            this.ctx.translate(bonus.x + 12, bonus.y + 12 + bonus.animation);
            this.ctx.rotate(bonus.rotation);
            
            // Свечение бонуса
            this.ctx.shadowColor = bonus.color;
            this.ctx.shadowBlur = 20;
            
            // Бонус в форме кристалла
            this.ctx.fillStyle = bonus.color;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -10);
            this.ctx.lineTo(8, 0);
            this.ctx.lineTo(0, 10);
            this.ctx.lineTo(-8, 0);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
            this.ctx.restore();
            
            // Буква Z
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Z', bonus.x + 12, bonus.y + 12 + bonus.animation);
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'alphabetic';
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawAnimations() {
        this.animations.forEach(anim => {
            this.ctx.globalAlpha = anim.life;
            
            switch (anim.type) {
                case 'score':
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = 'bold 20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(anim.text, anim.x, anim.y);
                    break;
                    
                case 'bonus':
                    this.ctx.fillStyle = anim.color || '#00ff00';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(anim.text, anim.x, anim.y);
                    break;
                    
                case 'explosion':
                    this.ctx.fillStyle = '#ff4444';
                    const expX = anim.x + Math.cos(anim.angle) * anim.distance;
                    const expY = anim.y + Math.sin(anim.angle) * anim.distance;
                    this.ctx.fillRect(expX, expY, 3, 3);
                    break;
                    
                case 'speed':
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.font = 'bold 30px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(anim.text, anim.x, anim.y);
                    break;
            }
            
            this.ctx.textAlign = 'left';
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawUI() {
        // Счет
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`СЧЕТ: ${this.score}`, 20, 30);
        this.ctx.fillText(`ZOMBUCKS: ${this.zomBucks}`, 20, 60);
        
        // Скорость
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillText(`СКОРОСТЬ: ${this.gameSpeed.toFixed(1)}`, this.canvas.width - 180, 30);
        
        // Состояние игры
        if (this.gameState === 'idle') {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('НАЖМИТЕ ПРОБЕЛ ДЛЯ СТАРТА', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        }
    }
    
    draw() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawZombie();
        this.drawObstacles();
        this.drawBonuses();
        this.drawParticles();
        this.drawAnimations();
        this.drawUI();
    }
    
    updateStats() {
        const currentScore = document.getElementById('currentScore');
        const currentZomBucks = document.getElementById('currentZomBucks');
        const bestScore = document.getElementById('bestScore');
        
        if (currentScore) currentScore.textContent = this.score;
        if (currentZomBucks) currentZomBucks.textContent = this.zomBucks;
        if (bestScore) bestScore.textContent = this.highScore;
        
        // Анимация при изменении счета
        if (currentScore) {
            currentScore.classList.add('score-pop');
            setTimeout(() => currentScore.classList.remove('score-pop'), 300);
        }
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.updateZombie();
            this.updateObstacles();
            this.updateBonuses();
            this.updateBackground();
            this.updateParticles();
            this.updateAnimations();
            this.checkCollisions();
            this.increaseDifficulty();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Инициализация игры при загрузке страницы
let gameInstance;

function initGame() {
    console.log('🎮 Инициализация игры');
    gameInstance = new ZomBucksGame();
}

// Запуск при полной загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Дополнительная привязка для кнопки рестарта
document.addEventListener('DOMContentLoaded', function() {
    // Привязываем обработчик для кнопки "Играть снова" после загрузки DOM
    setTimeout(() => {
        const restartButton = document.querySelector('#gameOver .start-button');
        if (restartButton) {
            console.log('✅ Привязка кнопки рестарта после загрузки DOM');
            restartButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎮 Кнопка "Играть снова" нажата (DOMContentLoaded)');
                if (gameInstance) {
                    gameInstance.restartGame();
                }
            });
        }
    }, 1000);
});

// Экспортируем для глобального использования
window.ZomBucksGame = ZomBucksGame;
window.gameInstance = gameInstance;
window.initGame = initGame;

console.log('✅ game.js загружен');