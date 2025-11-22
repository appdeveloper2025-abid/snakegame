class NeonSnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // Game objects
        this.snake = null;
        this.food = null;
        this.weapons = [];
        this.particles = [];
        
        // Game settings
        this.gridSize = 20;
        this.gameSpeed = 150;
        this.lastUpdateTime = 0;
        this.keys = {};
        
        // Neon effects
        this.neonParticles = [];
        this.matrixChars = [];
        
        // Initialize game
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Initialize game objects
        this.snake = new Snake(this);
        this.food = new Food(this);
        this.weaponSystem = new WeaponSystem(this);
        
        // Generate initial matrix characters
        this.generateMatrixChars();
        
        // Event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent arrow key scrolling
            if(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            
            // Handle game state transitions
            this.handleGameInput(e.key.toLowerCase());
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // UI button events
        document.getElementById('startGame').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartGame').addEventListener('click', () => {
            this.restartGame();
        });

        // Weapon selection
        document.querySelectorAll('.weapon-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                this.selectWeapon(slot.dataset.weapon);
            });
        });
    }

    handleGameInput(key) {
        switch(key) {
            case 'p':
                this.togglePause();
                break;
            case ' ':
                if (this.gameState === 'playing') {
                    this.weaponSystem.fireWeapon();
                }
                break;
            case 'escape':
                if (this.gameState === 'playing') {
                    this.gameState = 'menu';
                    this.showScreen('startScreen');
                }
                break;
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameSpeed = 150;
        
        this.snake.reset();
        this.food.spawn();
        this.weaponSystem.reset();
        
        this.hideAllScreens();
        this.updateUI();
    }

    restartGame() {
        this.startGame();
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }

    gameLoop(currentTime = 0) {
        requestAnimationFrame((time) => this.gameLoop(time));
        
        const deltaTime = currentTime - this.lastUpdateTime;
        
        if (this.gameState === 'playing' && deltaTime > this.gameSpeed) {
            this.update();
            this.lastUpdateTime = currentTime;
        }
        
        this.render();
    }

    update() {
        // Handle input
        this.handleSnakeInput();
        
        // Update game objects
        this.snake.update();
        this.weaponSystem.update();
        this.updateParticles();
        this.updateMatrixChars();
        
        // Check collisions
        this.checkCollisions();
        
        // Check level progression
        this.checkLevelProgress();
    }

    handleSnakeInput() {
        if (this.keys['w'] || this.keys['arrowup']) {
            this.snake.changeDirection('up');
        } else if (this.keys['s'] || this.keys['arrowdown']) {
            this.snake.changeDirection('down');
        } else if (this.keys['a'] || this.keys['arrowleft']) {
            this.snake.changeDirection('left');
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.snake.changeDirection('right');
        }
    }

    checkCollisions() {
        // Snake with food
        if (this.snake.head.x === this.food.x && this.snake.head.y === this.food.y) {
            this.snake.grow();
            this.food.spawn();
            this.score += 10 * this.level;
            this.createParticles(this.food.x, this.food.y, 'food');
            this.updateUI();
        }

        // Snake with itself
        if (this.snake.checkSelfCollision()) {
            this.handleSnakeDeath();
        }

        // Snake with walls
        if (this.snake.head.x < 0 || this.snake.head.x >= this.canvas.width / this.gridSize ||
            this.snake.head.y < 0 || this.snake.head.y >= this.canvas.height / this.gridSize) {
            this.handleSnakeDeath();
        }

        // Weapons with food (special effects)
        this.weaponSystem.checkCollisions(this.food);
    }

    handleSnakeDeath() {
        this.lives--;
        this.createParticles(this.snake.head.x, this.snake.head.y, 'death');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.snake.reset();
            this.updateUI();
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score.toString().padStart(5, '0');
        document.getElementById('finalLevel').textContent = this.level.toString().padStart(3, '0');
        document.getElementById('finalWeapons').textContent = 
            `${this.weaponSystem.unlockedWeapons.length.toString().padStart(2, '0')}/100`;
        
        this.showScreen('gameOverScreen');
    }

    checkLevelProgress() {
        const scoreForNextLevel = this.level * 100;
        if (this.score >= scoreForNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.gameSpeed = Math.max(50, 150 - (this.level * 2)); // Increase speed
        this.lives++; // Reward with extra life
        
        // Unlock new weapon every 5 levels
        if (this.level % 5 === 0) {
            this.weaponSystem.unlockRandomWeapon();
        }
        
        this.createLevelUpEffects();
        this.updateUI();
    }

    createLevelUpEffects() {
        // Create explosion of particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: this.getRandomNeonColor(),
                size: Math.random() * 3 + 1
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.1; // gravity
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    createParticles(x, y, type) {
        const count = type === 'food' ? 10 : 20;
        const color = type === 'food' ? '#0ff' : '#f00';
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: color,
                size: Math.random() * 2 + 1
            });
        }
    }

    generateMatrixChars() {
        this.matrixChars = [];
        const charCount = 100;
        
        for (let i = 0; i < charCount; i++) {
            this.matrixChars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 2 + 1,
                char: this.getRandomMatrixChar(),
                brightness: Math.random()
            });
        }
    }

    updateMatrixChars() {
        this.matrixChars.forEach(char => {
            char.y += char.speed;
            char.brightness = 0.3 + Math.sin(Date.now() * 0.001 + char.x) * 0.7;
            
            if (char.y > this.canvas.height) {
                char.y = 0;
                char.x = Math.random() * this.canvas.width;
            }
        });
    }

    getRandomMatrixChar() {
        const chars = '01アイウエオカキクケコサシスセソタチツテト';
        return chars[Math.floor(Math.random() * chars.length)];
    }

    getRandomNeonColor() {
        const colors = ['#0f0', '#0ff', '#f0f', '#ff0', '#f00'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    selectWeapon(weaponType) {
        this.weaponSystem.selectWeapon(weaponType);
        
        // Update UI
        document.querySelectorAll('.weapon-slot').forEach(slot => {
            slot.classList.remove('active');
        });
        document.querySelector(`[data-weapon="${weaponType}"]`).classList.add('active');
    }

    render() {
        // Clear canvas with dark background
        this.ctx.fillStyle = 'rgba(0, 8, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw matrix background
        this.drawMatrixBackground();
        
        // Draw grid (subtle)
        this.drawGrid();
        
        // Draw game objects
        if (this.gameState !== 'menu') {
            this.food.draw(this.ctx);
            this.snake.draw(this.ctx);
            this.weaponSystem.draw(this.ctx);
            this.drawParticles();
        }
        
        // Draw UI overlays
        this.drawUIOverlay();
    }

    drawMatrixBackground() {
        this.ctx.font = '14px "Courier New", monospace';
        this.matrixChars.forEach(char => {
            this.ctx.fillStyle = `rgba(0, 255, 0, ${char.brightness * 0.3})`;
            this.ctx.fillText(char.char, char.x, char.y);
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawUIOverlay() {
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#0f0';
            this.ctx.font = 'bold 48px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = '#0f0';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('SYSTEM PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;
        }
    }

    updateUI() {
        document.getElementById('level-display').textContent = this.level.toString().padStart(3, '0');
        document.getElementById('score-display').textContent = this.score.toString().padStart(5, '0');
        document.getElementById('weapon-display').textContent = this.weaponSystem.currentWeapon.name.toUpperCase();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
}

// Utility functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Initialize game when page loads
window.addEventListener('load', () => {
    window.game = new NeonSnakeGame();
});

// Prevent context menu on right click
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});