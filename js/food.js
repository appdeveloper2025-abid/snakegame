class Food {
    constructor(game) {
        this.game = game;
        this.gridSize = game.gridSize;
        this.x = 0;
        this.y = 0;
        this.type = 'basic'; // basic, powerup, weapon, special
        this.spawnTime = 0;
        this.lifespan = 30000; // 30 seconds default
        this.isActive = false;
        
        // Food types and their properties
        this.types = {
            basic: {
                color: '#0ff',
                glow: '#0ff',
                points: 10,
                spawnWeight: 70,
                effect: null
            },
            powerup: {
                color: '#ff0',
                glow: '#ff0',
                points: 25,
                spawnWeight: 15,
                effect: 'speed'
            },
            weapon: {
                color: '#f0f',
                glow: '#f0f',
                points: 15,
                spawnWeight: 10,
                effect: 'ammo'
            },
            special: {
                color: '#f00',
                glow: '#f00',
                points: 50,
                spawnWeight: 5,
                effect: 'shield'
            },
            mega: {
                color: '#0f0',
                glow: '#0f0',
                points: 100,
                spawnWeight: 1,
                effect: 'levelup'
            }
        };

        // Animation properties
        this.pulsePhase = 0;
        this.rotation = 0;
        this.scale = 1;
        this.particles = [];
        
        this.spawn();
    }

    spawn() {
        // Find valid position (not on snake)
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 100) {
            this.x = Math.floor(Math.random() * (this.game.canvas.width / this.gridSize));
            this.y = Math.floor(Math.random() * (this.game.canvas.height / this.gridSize));
            
            validPosition = !this.game.snake.checkCollisionWithPoint(this.x, this.y);
            attempts++;
        }

        // If no valid position found, try more aggressively
        if (!validPosition) {
            this.findEmergencyPosition();
        }

        // Determine food type based on weights and level
        this.determineType();
        
        this.spawnTime = Date.now();
        this.isActive = true;
        this.pulsePhase = 0;
        this.rotation = 0;
        this.scale = 0;
        
        // Spawn animation
        this.createSpawnEffect();
    }

    findEmergencyPosition() {
        // Emergency position finding - scan grid systematically
        const cols = this.game.canvas.width / this.gridSize;
        const rows = this.game.canvas.height / this.gridSize;
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (!this.game.snake.checkCollisionWithPoint(x, y)) {
                    this.x = x;
                    this.y = y;
                    return;
                }
            }
        }
        
        // Last resort - spawn at 0,0
        this.x = 0;
        this.y = 0;
    }

    determineType() {
        const level = this.game.level;
        const weights = { ...this.types };
        
        // Adjust weights based on level
        if (level > 5) {
            weights.basic.spawnWeight = Math.max(40, 70 - level);
            weights.powerup.spawnWeight = Math.min(25, 15 + level);
        }
        
        if (level > 10) {
            weights.weapon.spawnWeight = Math.min(20, 10 + level * 0.5);
        }
        
        if (level > 20) {
            weights.special.spawnWeight = Math.min(15, 5 + level * 0.3);
        }
        
        if (level % 10 === 0) {
            // Boss level - higher chance of special food
            weights.mega.spawnWeight = 10;
        }

        // Calculate total weight
        let totalWeight = 0;
        Object.values(weights).forEach(type => {
            totalWeight += type.spawnWeight;
        });

        // Random selection based on weights
        let random = Math.random() * totalWeight;
        let currentWeight = 0;

        for (const [typeName, typeProps] of Object.entries(weights)) {
            currentWeight += typeProps.spawnWeight;
            if (random <= currentWeight) {
                this.type = typeName;
                break;
            }
        }
    }

    update() {
        if (!this.isActive) return;

        const currentTime = Date.now();
        const aliveTime = currentTime - this.spawnTime;

        // Check if food should expire
        if (aliveTime > this.lifespan) {
            this.createExpirationEffect();
            this.spawn();
            return;
        }

        // Update animations
        this.pulsePhase += 0.05;
        this.rotation += this.getRotationSpeed();
        this.scale = 0.8 + Math.sin(this.pulsePhase) * 0.2;

        // Update particles
        this.updateParticles();

        // Flicker when about to expire
        if (aliveTime > this.lifespan * 0.8) {
            this.updateExpirationWarning(aliveTime);
        }
    }

    getRotationSpeed() {
        switch (this.type) {
            case 'basic': return 0.02;
            case 'powerup': return 0.05;
            case 'weapon': return 0.03;
            case 'special': return 0.04;
            case 'mega': return 0.08;
            default: return 0.02;
        }
    }

    updateExpirationWarning(aliveTime) {
        const timeLeft = this.lifespan - aliveTime;
        const warningPhase = timeLeft / (this.lifespan * 0.2);
        
        // Create warning particles
        if (Math.random() < 0.3) {
            this.createWarningParticle();
        }
    }

    updateParticles() {
        // Add new particles occasionally
        if (Math.random() < 0.4) {
            this.createOrbitalParticle();
        }

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.angle += particle.speed;
            particle.radius += particle.expansion;
            particle.life -= 0.01;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    createSpawnEffect() {
        // Create explosion of particles
        for (let i = 0; i < 20; i++) {
            this.game.particles.push({
                x: this.x * this.gridSize + this.gridSize / 2,
                y: this.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                size: Math.random() * 3 + 1,
                color: this.types[this.type].color
            });
        }

        // Create orbital particles
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                angle: (i / 8) * Math.PI * 2,
                radius: this.gridSize * 0.3,
                speed: 0.05 + Math.random() * 0.03,
                expansion: 0.2,
                life: 1,
                size: Math.random() * 2 + 1
            });
        }
    }

    createExpirationEffect() {
        // Create implosion effect
        for (let i = 0; i < 15; i++) {
            this.game.particles.push({
                x: this.x * this.gridSize + this.gridSize / 2,
                y: this.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 0.5,
                size: Math.random() * 2 + 1,
                color: '#f00'
            });
        }
    }

    createOrbitalParticle() {
        this.particles.push({
            angle: Math.random() * Math.PI * 2,
            radius: this.gridSize * 0.2,
            speed: 0.02 + Math.random() * 0.02,
            expansion: -0.05,
            life: 1,
            size: Math.random() * 1.5 + 0.5
        });
    }

    createWarningParticle() {
        this.game.particles.push({
            x: this.x * this.gridSize + this.gridSize / 2,
            y: this.y * this.gridSize + this.gridSize / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 0.7,
            size: Math.random() * 1.5 + 0.5,
            color: '#f00'
        });
    }

    draw(ctx) {
        if (!this.isActive) return;

        const centerX = this.x * this.gridSize + this.gridSize / 2;
        const centerY = this.y * this.gridSize + this.gridSize / 2;
        const typeProps = this.types[this.type];

        ctx.save();

        // Draw orbital particles
        this.drawOrbitalParticles(ctx, centerX, centerY);

        // Draw main food item with transformations
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        // Draw glow effect
        this.drawGlow(ctx, typeProps);

        // Draw main shape based on type
        this.drawShape(ctx, typeProps);

        // Draw inner details
        this.drawInnerDetails(ctx, typeProps);

        ctx.restore();

        // Draw expiration warning if needed
        this.drawExpirationWarning(ctx, centerX, centerY);
    }

    drawOrbitalParticles(ctx, centerX, centerY) {
        this.particles.forEach(particle => {
            const x = centerX + Math.cos(particle.angle) * particle.radius;
            const y = centerY + Math.sin(particle.angle) * particle.radius;
            
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = this.types[this.type].color;
            ctx.shadowColor = this.types[this.type].glow;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    drawGlow(ctx, typeProps) {
        // Outer glow
        ctx.shadowColor = typeProps.glow;
        ctx.shadowBlur = 20;
        ctx.fillStyle = typeProps.color;
        
        // Pulse the glow
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.3;
        ctx.shadowBlur = 20 * pulse;
    }

    drawShape(ctx, typeProps) {
        const size = this.gridSize * 0.6;
        
        switch (this.type) {
            case 'basic':
                // Diamond shape
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size, 0);
                ctx.closePath();
                ctx.fill();
                break;

            case 'powerup':
                // Star shape
                this.drawStar(ctx, 0, 0, size * 0.8, size * 1.2, 5);
                ctx.fill();
                break;

            case 'weapon':
                // Gear shape
                this.drawGear(ctx, 0, 0, size, 8);
                ctx.fill();
                break;

            case 'special':
                // Crystal shape
                this.drawCrystal(ctx, 0, 0, size);
                ctx.fill();
                break;

            case 'mega':
                // Complex multi-layer shape
                this.drawMegaShape(ctx, 0, 0, size);
                break;

            default:
                // Circle as fallback
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();
        }
    }

    drawStar(ctx, cx, cy, innerRadius, outerRadius, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
    }

    drawGear(ctx, cx, cy, radius, teeth) {
        ctx.beginPath();
        const toothDepth = radius * 0.3;
        
        for (let i = 0; i < teeth; i++) {
            const angle1 = (i * 2 * Math.PI) / teeth;
            const angle2 = ((i + 0.5) * 2 * Math.PI) / teeth;
            const angle3 = ((i + 1) * 2 * Math.PI) / teeth;
            
            // Outer point
            const x1 = cx + Math.cos(angle1) * (radius + toothDepth);
            const y1 = cy + Math.sin(angle1) * (radius + toothDepth);
            
            // Inner point
            const x2 = cx + Math.cos(angle2) * (radius - toothDepth);
            const y2 = cy + Math.sin(angle2) * (radius - toothDepth);
            
            // Next outer point
            const x3 = cx + Math.cos(angle3) * (radius + toothDepth);
            const y3 = cy + Math.sin(angle3) * (radius + toothDepth);
            
            if (i === 0) {
                ctx.moveTo(x1, y1);
            }
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
        }
        ctx.closePath();
    }

    drawCrystal(ctx, cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size * 0.7, cy + size * 0.3);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - size * 0.7, cy + size * 0.3);
        ctx.closePath();
    }

    drawMegaShape(ctx, cx, cy, size) {
        // Outer ring
        ctx.fillStyle = this.types[this.type].color;
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = this.types[this.type].glow;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawInnerDetails(ctx, typeProps) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        const detailSize = this.gridSize * 0.15;
        
        switch (this.type) {
            case 'basic':
                // Simple dot
                ctx.beginPath();
                ctx.arc(0, 0, detailSize, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'powerup':
                // Lightning bolt
                ctx.beginPath();
                ctx.moveTo(-detailSize, -detailSize);
                ctx.lineTo(detailSize, detailSize);
                ctx.lineTo(-detailSize, detailSize);
                ctx.lineTo(detailSize, -detailSize);
                ctx.closePath();
                ctx.fill();
                break;

            case 'weapon':
                // Crosshair
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-detailSize * 2, 0);
                ctx.lineTo(detailSize * 2, 0);
                ctx.moveTo(0, -detailSize * 2);
                ctx.lineTo(0, detailSize * 2);
                ctx.stroke();
                break;
        }
    }

    drawExpirationWarning(ctx, centerX, centerY) {
        const currentTime = Date.now();
        const aliveTime = currentTime - this.spawnTime;
        
        if (aliveTime > this.lifespan * 0.8) {
            const timeLeft = this.lifespan - aliveTime;
            const warningIntensity = (timeLeft / (this.lifespan * 0.2));
            const pulse = Math.sin(currentTime * 0.01) * 0.5 + 0.5;
            
            ctx.save();
            ctx.globalAlpha = (1 - warningIntensity) * pulse * 0.3;
            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#f00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.gridSize * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Called when food is collected
    collect() {
        const typeProps = this.types[this.type];
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Apply effects based on food type
        this.applyEffect(typeProps);
        
        // Respawn new food
        this.spawn();
        
        return typeProps.points * this.game.level;
    }

    createCollectionEffect() {
        // Big explosion of particles
        for (let i = 0; i < 30; i++) {
            this.game.particles.push({
                x: this.x * this.gridSize + this.gridSize / 2,
                y: this.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                size: Math.random() * 4 + 1,
                color: this.types[this.type].color
            });
        }
    }

    applyEffect(typeProps) {
        switch (typeProps.effect) {
            case 'speed':
                this.game.snake.activateSpeedBoost();
                break;
            case 'shield':
                this.game.snake.activateShield();
                break;
            case 'ammo':
                this.game.weaponSystem.addAmmo(10);
                break;
            case 'levelup':
                this.game.levelUp();
                break;
        }
    }

    // Utility methods
    getPosition() {
        return { x: this.x, y: this.y };
    }

    isExpired() {
        return Date.now() - this.spawnTime > this.lifespan;
    }

    getRemainingTime() {
        return Math.max(0, this.lifespan - (Date.now() - this.spawnTime));
    }
}