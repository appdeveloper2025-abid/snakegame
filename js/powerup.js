// powerups.js - Power-ups and Special Abilities
class PowerUp {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.collected = false;
        this.animation = 0;
        this.color = this.getColor();
        this.duration = this.getDuration();
    }

    getColor() {
        const colors = {
            invincible: '#4ecdc4',
            magnet: '#ff6b6b',
            double: '#ffeaa7',
            nitro: '#f39c12',
            repair: '#2ecc71',
            slowmo: '#9b59b6',
            shield: '#3498db',
            multicoin: '#e74c3c'
        };
        return colors[this.type] || '#ffffff';
    }

    getDuration() {
        const durations = {
            invincible: 10000,    // 10 seconds
            magnet: 8000,         // 8 seconds
            double: 15000,        // 15 seconds
            nitro: 5000,          // 5 seconds
            repair: 0,            // Instant
            slowmo: 7000,         // 7 seconds
            shield: 10000,        // 10 seconds
            multicoin: 10000      // 10 seconds
        };
        return durations[this.type] || 5000;
    }

    update() {
        this.y += this.speed;
        this.animation += 0.1;
        
        // Float up and down
        this.y += Math.sin(this.animation) * 0.5;
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);

        // Pulsing effect
        const scale = 1 + Math.sin(this.animation * 2) * 0.2;
        ctx.scale(scale, scale);

        // Power-up body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        ctx.fillStyle = this.lightenColor(this.color, 40);
        ctx.beginPath();
        ctx.arc(0, 0, this.width/3, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        this.drawSymbol(ctx);

        // Outer glow
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2 + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        ctx.restore();
    }

    drawSymbol(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const symbols = {
            invincible: '🌟',
            magnet: '🧲',
            double: '💰',
            nitro: '⚡',
            repair: '🔧',
            slowmo: '⏱️',
            shield: '🛡️',
            multicoin: '💎'
        };

        ctx.fillText(symbols[this.type] || '?', 0, 0);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    collect() {
        this.collected = true;
        return {
            type: this.type,
            duration: this.duration
        };
    }
}

class PowerUpManager {
    constructor() {
        this.activePowerUps = new Map();
        this.powerUps = [];
        this.spawnRate = 0.003; // Probability per frame
        this.types = ['invincible', 'magnet', 'double', 'nitro', 'repair', 'slowmo', 'shield', 'multicoin'];
    }

    update(canvasHeight, playerX, playerY, playerWidth, playerHeight) {
        // Update existing power-ups
        this.powerUps.forEach((powerUp, index) => {
            powerUp.update();
            
            // Remove off-screen power-ups
            if (powerUp.y > canvasHeight) {
                this.powerUps.splice(index, 1);
            }
            
            // Check collection with magnet effect
            if (this.checkCollection(powerUp, playerX, playerY, playerWidth, playerHeight)) {
                this.collectPowerUp(powerUp, index);
            }
        });

        // Spawn new power-ups
        if (Math.random() < this.spawnRate) {
            this.spawnPowerUp();
        }

        // Update active power-up timers
        this.updateActivePowerUps();
    }

    checkCollection(powerUp, playerX, playerY, playerWidth, playerHeight) {
        if (powerUp.collected) return false;

        // Normal collision check
        const normalCollision = 
            powerUp.x < playerX + playerWidth &&
            powerUp.x + powerUp.width > playerX &&
            powerUp.y < playerY + playerHeight &&
            powerUp.y + powerUp.height > playerY;

        // Magnet effect for nearby power-ups
        const magnetActive = this.activePowerUps.has('magnet');
        let magnetCollision = false;

        if (magnetActive && !normalCollision) {
            const distance = Math.sqrt(
                Math.pow(powerUp.x + powerUp.width/2 - (playerX + playerWidth/2), 2) +
                Math.pow(powerUp.y + powerUp.height/2 - (playerY + playerHeight/2), 2)
            );
            
            if (distance < 150) { // Magnet radius
                // Move power-up toward player
                const angle = Math.atan2(
                    (playerY + playerHeight/2) - (powerUp.y + powerUp.height/2),
                    (playerX + playerWidth/2) - (powerUp.x + powerUp.width/2)
                );
                
                powerUp.x += Math.cos(angle) * 8;
                powerUp.y += Math.sin(angle) * 8;
                
                magnetCollision = distance < 30;
            }
        }

        return normalCollision || magnetCollision;
    }

    collectPowerUp(powerUp, index) {
        const powerUpData = powerUp.collect();
        this.activatePowerUp(powerUpData);
        this.powerUps.splice(index, 1);
        return powerUpData;
    }

    activatePowerUp(powerUpData) {
        const { type, duration } = powerUpData;
        
        // Instant effects
        if (type === 'repair') {
            // Repair logic would be handled by the main game
            return { type, instant: true };
        }

        // Timed effects
        this.activePowerUps.set(type, {
            startTime: Date.now(),
            duration: duration
        });

        return { type, duration };
    }

    updateActivePowerUps() {
        const now = Date.now();
        for (const [type, data] of this.activePowerUps.entries()) {
            if (now - data.startTime > data.duration) {
                this.activePowerUps.delete(type);
            }
        }
    }

    spawnPowerUp() {
        const type = this.types[Math.floor(Math.random() * this.types.length)];
        const x = 200 + Math.random() * 400; // Within road bounds
        const y = -50;
        
        this.powerUps.push(new PowerUp(type, x, y));
    }

    isPowerUpActive(type) {
        return this.activePowerUps.has(type);
    }

    getRemainingTime(type) {
        const data = this.activePowerUps.get(type);
        if (!data) return 0;
        
        const elapsed = Date.now() - data.startTime;
        return Math.max(0, data.duration - elapsed);
    }

    draw(ctx) {
        this.powerUps.forEach(powerUp => powerUp.draw(ctx));
        
        // Draw magnet effect radius when active
        if (this.isPowerUpActive('magnet')) {
            // This would be drawn around the player in the main game
        }
    }

    // Power-up effect methods
    applyInvincibility() {
        return this.isPowerUpActive('invincible');
    }

    applyMagnet() {
        return this.isPowerUpActive('magnet');
    }

    applyDoublePoints() {
        return this.isPowerUpActive('double');
    }

    applyNitro() {
        return this.isPowerUpActive('nitro');
    }

    applySlowMo() {
        return this.isPowerUpActive('slowmo');
    }

    applyShield() {
        return this.isPowerUpActive('shield');
    }

    applyMultiCoin() {
        return this.isPowerUpActive('multicoin');
    }

    getCoinMultiplier() {
        let multiplier = 1;
        if (this.isPowerUpActive('double')) multiplier *= 2;
        if (this.isPowerUpActive('multicoin')) multiplier *= 3;
        return multiplier;
    }

    getSpeedMultiplier() {
        if (this.isPowerUpActive('slowmo')) {
            return 0.5;
        }
        if (this.isPowerUpActive('nitro')) {
            return 1.5;
        }
        return 1;
    }
}

// Special Effects Manager
class EffectsManager {
    constructor() {
        this.effects = [];
    }

    addEffect(type, x, y, duration = 1000) {
        this.effects.push({
            type: type,
            x: x,
            y: y,
            createdAt: Date.now(),
            duration: duration,
            progress: 0
        });
    }

    update() {
        this.effects.forEach((effect, index) => {
            effect.progress = (Date.now() - effect.createdAt) / effect.duration;
            if (effect.progress >= 1) {
                this.effects.splice(index, 1);
            }
        });
    }

    draw(ctx) {
        this.effects.forEach(effect => {
            switch(effect.type) {
                case 'coin':
                    this.drawCoinEffect(ctx, effect);
                    break;
                case 'powerup':
                    this.drawPowerUpEffect(ctx, effect);
                    break;
                case 'explosion':
                    this.drawExplosionEffect(ctx, effect);
                    break;
                case 'boost':
                    this.drawBoostEffect(ctx, effect);
                    break;
            }
        });
    }

    drawCoinEffect(ctx, effect) {
        const alpha = 1 - effect.progress;
        const scale = 1 + effect.progress * 2;
        const y = effect.y - effect.progress * 50;

        ctx.save();
        ctx.translate(effect.x, y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffed4a';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawPowerUpEffect(ctx, effect) {
        const alpha = 1 - effect.progress;
        const scale = 1 + effect.progress;
        const rotation = effect.progress * Math.PI * 2;

        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();

        // Sparkles
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI/4) + effect.progress * Math.PI;
            const distance = 20 + Math.sin(effect.progress * Math.PI * 4) * 5;
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }

    drawExplosionEffect(ctx, effect) {
        const progress = effect.progress;
        const radius = progress * 30;
        const alpha = 1 - progress;

        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.globalAlpha = alpha;

        // Explosion circle
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Explosion particles
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI/6) + progress * Math.PI;
            const distance = radius * 1.5;
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                4 * (1 - progress), 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }

    drawBoostEffect(ctx, effect) {
        const progress = effect.progress;
        const alpha = 1 - progress;

        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.globalAlpha = alpha;

        // Boost trails
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 15;
            const length = 40 * (1 - progress);
            
            ctx.fillStyle = '#ffeaa7';
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.lineTo(offset - 5, length);
            ctx.lineTo(offset + 5, length);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PowerUp, PowerUpManager, EffectsManager };
}