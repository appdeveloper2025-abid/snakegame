class Snake {
    constructor(game) {
        this.game = game;
        this.gridSize = game.gridSize;
        this.reset();
    }

    reset() {
        // Start in the middle of the canvas
        const startX = Math.floor(this.game.canvas.width / this.gridSize / 2);
        const startY = Math.floor(this.game.canvas.height / this.gridSize / 2);
        
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        
        this.direction = 'right';
        this.nextDirection = 'right';
        this.growthPending = 0;
        this.isAlive = true;
        
        // Snake appearance
        this.colors = {
            head: '#0f0',
            body: '#0f8',
            tail: '#0c6',
            glow: '#0f0',
            eyes: '#000'
        };
        
        // Special effects
        this.trailParticles = [];
        this.glowIntensity = 1;
        this.glowPulseDirection = 1;
    }

    get head() {
        return this.body[0];
    }

    changeDirection(newDirection) {
        // Prevent 180-degree turns
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    update() {
        if (!this.isAlive) return;

        // Update direction
        this.direction = this.nextDirection;

        // Create trail particles from current head position
        this.createTrailParticles();

        // Calculate new head position
        const newHead = { ...this.head };

        switch (this.direction) {
            case 'up':
                newHead.y--;
                break;
            case 'down':
                newHead.y++;
                break;
            case 'left':
                newHead.x--;
                break;
            case 'right':
                newHead.x++;
                break;
        }

        // Add new head to beginning of body
        this.body.unshift(newHead);

        // Remove tail if no growth pending
        if (this.growthPending > 0) {
            this.growthPending--;
            
            // Create growth effect particles
            this.createGrowthParticles(this.body[this.body.length - 1]);
        } else {
            const removedSegment = this.body.pop();
            this.createRemovalParticles(removedSegment);
        }

        // Update glow effect
        this.updateGlowEffect();

        // Update trail particles
        this.updateTrailParticles();
    }

    grow(amount = 1) {
        this.growthPending += amount;
        
        // Create special growth effect
        this.createGrowthEffect();
    }

    shrink(amount = 1) {
        if (this.body.length > 3) {
            for (let i = 0; i < amount && this.body.length > 3; i++) {
                const removedSegment = this.body.pop();
                this.createRemovalParticles(removedSegment, true);
            }
        }
    }

    checkSelfCollision() {
        // Check if head collides with any body segment (skip head itself)
        for (let i = 1; i < this.body.length; i++) {
            if (this.head.x === this.body[i].x && this.head.y === this.body[i].y) {
                this.isAlive = false;
                return true;
            }
        }
        return false;
    }

    checkCollisionWithPoint(x, y) {
        return this.body.some(segment => segment.x === x && segment.y === y);
    }

    updateGlowEffect() {
        // Pulse glow intensity
        this.glowIntensity += 0.05 * this.glowPulseDirection;
        
        if (this.glowIntensity >= 1.5) {
            this.glowIntensity = 1.5;
            this.glowPulseDirection = -1;
        } else if (this.glowIntensity <= 0.8) {
            this.glowIntensity = 0.8;
            this.glowPulseDirection = 1;
        }
    }

    createTrailParticles() {
        // Add trail particles from head movement
        if (Math.random() < 0.7) {
            this.trailParticles.push({
                x: this.head.x * this.gridSize + this.gridSize / 2,
                y: this.head.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                size: Math.random() * 2 + 1,
                color: this.getSegmentColor(0)
            });
        }
    }

    updateTrailParticles() {
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.05;
            particle.size *= 0.95;

            if (particle.life <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }
    }

    createGrowthParticles(segment) {
        for (let i = 0; i < 5; i++) {
            this.game.particles.push({
                x: segment.x * this.gridSize + this.gridSize / 2,
                y: segment.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                size: Math.random() * 2 + 1,
                color: '#0ff'
            });
        }
    }

    createRemovalParticles(segment, isShrink = false) {
        const color = isShrink ? '#f00' : '#f0f';
        for (let i = 0; i < 8; i++) {
            this.game.particles.push({
                x: segment.x * this.gridSize + this.gridSize / 2,
                y: segment.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                size: Math.random() * 2 + 1,
                color: color
            });
        }
    }

    createGrowthEffect() {
        // Create a burst of particles from the tail
        const tail = this.body[this.body.length - 1];
        for (let i = 0; i < 15; i++) {
            this.game.particles.push({
                x: tail.x * this.gridSize + this.gridSize / 2,
                y: tail.y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                size: Math.random() * 3 + 1,
                color: '#0ff'
            });
        }
    }

    getSegmentColor(index) {
        if (index === 0) return this.colors.head; // Head
        
        const segmentCount = this.body.length;
        const progress = index / segmentCount;
        
        if (progress < 0.3) return this.colors.body; // Body
        return this.colors.tail; // Tail
    }

    draw(ctx) {
        // Draw trail particles first (behind snake)
        this.drawTrailParticles(ctx);

        // Draw body segments
        this.body.forEach((segment, index) => {
            this.drawSegment(ctx, segment, index);
        });

        // Draw special effects on head
        this.drawHeadEffects(ctx);
    }

    drawSegment(ctx, segment, index) {
        const x = segment.x * this.gridSize;
        const y = segment.y * this.gridSize;
        const isHead = index === 0;
        
        ctx.save();
        
        // Main segment body with glow
        ctx.fillStyle = this.getSegmentColor(index);
        ctx.shadowColor = this.colors.glow;
        ctx.shadowBlur = isHead ? 15 * this.glowIntensity : 8;
        
        // Draw rounded rectangle for segment
        this.drawRoundedSegment(ctx, x, y, this.gridSize, this.gridSize, 4);
        
        // Draw eyes on head
        if (isHead) {
            this.drawEyes(ctx, x, y);
        }
        
        // Draw segment highlight
        this.drawSegmentHighlight(ctx, x, y, isHead);
        
        ctx.restore();
    }

    drawRoundedSegment(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    drawEyes(ctx, x, y) {
        const eyeSize = this.gridSize * 0.2;
        const pupilSize = eyeSize * 0.6;
        
        // Calculate eye positions based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        switch (this.direction) {
            case 'right':
                leftEyeX = x + this.gridSize - eyeSize - 2;
                leftEyeY = y + this.gridSize * 0.3;
                rightEyeX = x + this.gridSize - eyeSize - 2;
                rightEyeY = y + this.gridSize * 0.7;
                break;
            case 'left':
                leftEyeX = x + 2;
                leftEyeY = y + this.gridSize * 0.3;
                rightEyeX = x + 2;
                rightEyeY = y + this.gridSize * 0.7;
                break;
            case 'up':
                leftEyeX = x + this.gridSize * 0.3;
                leftEyeY = y + 2;
                rightEyeX = x + this.gridSize * 0.7;
                rightEyeY = y + 2;
                break;
            case 'down':
                leftEyeX = x + this.gridSize * 0.3;
                leftEyeY = y + this.gridSize - eyeSize - 2;
                rightEyeX = x + this.gridSize * 0.7;
                rightEyeY = y + this.gridSize - eyeSize - 2;
                break;
        }
        
        // Draw eyes
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(leftEyeX + eyeSize/2, leftEyeY + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
        ctx.arc(rightEyeX + eyeSize/2, rightEyeY + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = this.colors.eyes;
        ctx.beginPath();
        ctx.arc(leftEyeX + eyeSize/2, leftEyeY + eyeSize/2, pupilSize/2, 0, Math.PI * 2);
        ctx.arc(rightEyeX + eyeSize/2, rightEyeY + eyeSize/2, pupilSize/2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSegmentHighlight(ctx, x, y, isHead) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 0;
        
        const highlightSize = this.gridSize * 0.3;
        ctx.beginPath();
        ctx.arc(x + highlightSize, y + highlightSize, highlightSize/2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHeadEffects(ctx) {
        if (!this.isAlive) return;
        
        const head = this.head;
        const x = head.x * this.gridSize + this.gridSize / 2;
        const y = head.y * this.gridSize + this.gridSize / 2;
        
        ctx.save();
        
        // Direction indicator
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 10;
        
        let endX = x, endY = y;
        const indicatorLength = this.gridSize * 0.8;
        
        switch (this.direction) {
            case 'right':
                endX += indicatorLength;
                break;
            case 'left':
                endX -= indicatorLength;
                break;
            case 'up':
                endY -= indicatorLength;
                break;
            case 'down':
                endY += indicatorLength;
                break;
        }
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Energy aura around head
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#0f0';
        ctx.shadowBlur = 15;
        
        const auraSize = this.gridSize * (1.2 + Math.sin(Date.now() * 0.01) * 0.1);
        ctx.beginPath();
        ctx.arc(x, y, auraSize, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    drawTrailParticles(ctx) {
        this.trailParticles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // Special abilities
    activateSpeedBoost(duration = 5000) {
        const originalSpeed = this.game.gameSpeed;
        this.game.gameSpeed = Math.max(30, originalSpeed * 0.5);
        
        // Change snake color during speed boost
        this.colors.head = '#ff0';
        this.colors.glow = '#ff0';
        
        setTimeout(() => {
            this.game.gameSpeed = originalSpeed;
            this.colors.head = '#0f0';
            this.colors.glow = '#0f0';
        }, duration);
    }

    activateShield(duration = 3000) {
        this.isInvulnerable = true;
        this.colors.head = '#0ff';
        this.colors.glow = '#0ff';
        
        setTimeout(() => {
            this.isInvulnerable = false;
            this.colors.head = '#0f0';
            this.colors.glow = '#0f0';
        }, duration);
    }

    // Get snake length for scoring
    get length() {
        return this.body.length;
    }

    // Get snake bounds for camera/UI
    get bounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        this.body.forEach(segment => {
            minX = Math.min(minX, segment.x);
            minY = Math.min(minY, segment.y);
            maxX = Math.max(maxX, segment.x);
            maxY = Math.max(maxY, segment.y);
        });
        
        return {
            x: minX * this.gridSize,
            y: minY * this.gridSize,
            width: (maxX - minX + 1) * this.gridSize,
            height: (maxY - minY + 1) * this.gridSize
        };
    }
}