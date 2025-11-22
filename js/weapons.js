class WeaponSystem {
    constructor(game) {
        this.game = game;
        this.weapons = [];
        this.currentWeapon = null;
        this.projectiles = [];
        this.unlockedWeapons = ['basic'];
        this.weaponLevels = {};
        this.ammo = 100;
        this.maxAmmo = 100;
        this.reloadRate = 1;
        
        this.initializeWeapons();
        this.selectWeapon('basic');
    }

    initializeWeapons() {
        // Define all 100+ weapons
        this.weapons = {
            // Tier 1: Basic Weapons
            basic: {
                name: 'Basic Laser',
                damage: 10,
                fireRate: 500,
                projectileSpeed: 8,
                ammoCost: 1,
                color: '#0f0',
                glow: '#0f0',
                pattern: 'single',
                level: 1,
                maxLevel: 5,
                description: 'Standard issue laser weapon'
            },
            laser: {
                name: 'Pulse Laser',
                damage: 15,
                fireRate: 400,
                projectileSpeed: 10,
                ammoCost: 2,
                color: '#0ff',
                glow: '#0ff',
                pattern: 'single',
                level: 1,
                maxLevel: 8,
                description: 'Rapid fire laser pulses'
            },
            plasma: {
                name: 'Plasma Blaster',
                damage: 25,
                fireRate: 600,
                projectileSpeed: 6,
                ammoCost: 3,
                color: '#f0f',
                glow: '#f0f',
                pattern: 'single',
                level: 1,
                maxLevel: 6,
                description: 'High damage plasma bolts'
            },

            // Tier 2: Advanced Weapons
            spread: {
                name: 'Spread Gun',
                damage: 8,
                fireRate: 700,
                projectileSpeed: 7,
                ammoCost: 3,
                color: '#ff0',
                glow: '#ff0',
                pattern: 'spread',
                spreadAngle: 45,
                projectiles: 3,
                level: 1,
                maxLevel: 7,
                description: 'Fires multiple projectiles in a spread'
            },
            homing: {
                name: 'Homing Missiles',
                damage: 20,
                fireRate: 1000,
                projectileSpeed: 5,
                ammoCost: 4,
                color: '#f80',
                glow: '#f80',
                pattern: 'homing',
                homingStrength: 0.1,
                level: 1,
                maxLevel: 5,
                description: 'Seeking missiles that track targets'
            },
            beam: {
                name: 'Beam Rifle',
                damage: 5,
                fireRate: 100,
                projectileSpeed: 12,
                ammoCost: 1,
                color: '#8f0',
                glow: '#8f0',
                pattern: 'beam',
                beamDuration: 300,
                level: 1,
                maxLevel: 10,
                description: 'Continuous beam weapon'
            },

            // Tier 3: Special Weapons
            railgun: {
                name: 'Railgun',
                damage: 100,
                fireRate: 1500,
                projectileSpeed: 15,
                ammoCost: 10,
                color: '#08f',
                glow: '#08f',
                pattern: 'piercing',
                pierceCount: 3,
                level: 1,
                maxLevel: 4,
                description: 'High velocity piercing rounds'
            },
            flamethrower: {
                name: 'Flamethrower',
                damage: 2,
                fireRate: 50,
                projectileSpeed: 4,
                ammoCost: 1,
                color: '#f00',
                glow: '#f00',
                pattern: 'flame',
                duration: 1000,
                level: 1,
                maxLevel: 8,
                description: 'Continuous stream of fire'
            },
            shotgun: {
                name: 'Combat Shotgun',
                damage: 12,
                fireRate: 800,
                projectileSpeed: 9,
                ammoCost: 4,
                color: '#f88',
                glow: '#f88',
                pattern: 'shotgun',
                projectiles: 7,
                spreadAngle: 60,
                level: 1,
                maxLevel: 6,
                description: 'Wide spread close-range weapon'
            },

            // Tier 4: Elite Weapons
            lightning: {
                name: 'Lightning Gun',
                damage: 8,
                fireRate: 150,
                projectileSpeed: 20,
                ammoCost: 2,
                color: '#af0',
                glow: '#af0',
                pattern: 'chain',
                chainCount: 5,
                chainRange: 100,
                level: 1,
                maxLevel: 5,
                description: 'Electricity that chains between targets'
            },
            grenade: {
                name: 'Grenade Launcher',
                damage: 80,
                fireRate: 1200,
                projectileSpeed: 5,
                ammoCost: 8,
                color: '#840',
                glow: '#840',
                pattern: 'explosive',
                explosionRadius: 80,
                level: 1,
                maxLevel: 4,
                description: 'Explosive projectiles with area damage'
            },
            freeze: {
                name: 'Cryo Blaster',
                damage: 1,
                fireRate: 300,
                projectileSpeed: 7,
                ammoCost: 2,
                color: '#0cf',
                glow: '#0cf',
                pattern: 'freeze',
                freezeDuration: 2000,
                level: 1,
                maxLevel: 6,
                description: 'Freezes targets in place'
            },

            // Tier 5: Ultimate Weapons
            blackhole: {
                name: 'Singularity Generator',
                damage: 50,
                fireRate: 3000,
                projectileSpeed: 3,
                ammoCost: 25,
                color: '#404',
                glow: '#404',
                pattern: 'blackhole',
                duration: 5000,
                pullStrength: 0.5,
                level: 1,
                maxLevel: 3,
                description: 'Creates a temporary black hole'
            },
            laserbeam: {
                name: 'Mega Laser',
                damage: 200,
                fireRate: 2000,
                projectileSpeed: 20,
                ammoCost: 30,
                color: '#f0f',
                glow: '#f0f',
                pattern: 'laserbeam',
                beamWidth: 20,
                level: 1,
                maxLevel: 3,
                description: 'Massive laser beam destruction'
            },
            nuke: {
                name: 'Tactical Nuke',
                damage: 999,
                fireRate: 5000,
                projectileSpeed: 4,
                ammoCost: 50,
                color: '#ff0',
                glow: '#ff0',
                pattern: 'nuke',
                explosionRadius: 200,
                level: 1,
                maxLevel: 2,
                description: 'Obliterates everything on screen'
            }
        };

        // Initialize weapon levels
        Object.keys(this.weapons).forEach(weaponName => {
            this.weaponLevels[weaponName] = 1;
        });
    }

    selectWeapon(weaponType) {
        if (this.unlockedWeapons.includes(weaponType)) {
            this.currentWeapon = { ...this.weapons[weaponType] };
            this.currentWeapon.level = this.weaponLevels[weaponType];
            this.applyWeaponUpgrades(this.currentWeapon);
        }
    }

    applyWeaponUpgrades(weapon) {
        const level = weapon.level;
        
        // Apply level-based upgrades
        switch(weapon.pattern) {
            case 'single':
                weapon.damage *= (1 + (level - 1) * 0.2);
                weapon.fireRate = Math.max(50, weapon.fireRate * (1 - (level - 1) * 0.1));
                break;
            case 'spread':
            case 'shotgun':
                weapon.damage *= (1 + (level - 1) * 0.15);
                weapon.projectiles += Math.floor((level - 1) / 2);
                break;
            case 'homing':
                weapon.damage *= (1 + (level - 1) * 0.25);
                weapon.homingStrength *= (1 + (level - 1) * 0.3);
                break;
            case 'beam':
                weapon.damage *= (1 + (level - 1) * 0.3);
                weapon.beamDuration *= (1 + (level - 1) * 0.2);
                break;
            case 'chain':
                weapon.chainCount += level - 1;
                break;
            case 'explosive':
                weapon.explosionRadius *= (1 + (level - 1) * 0.25);
                break;
        }
    }

    fireWeapon() {
        if (!this.currentWeapon || this.ammo < this.currentWeapon.ammoCost) {
            return;
        }

        const snakeHead = this.game.snake.head;
        const direction = this.game.snake.direction;
        
        // Consume ammo
        this.ammo -= this.currentWeapon.ammoCost;
        
        // Create projectiles based on weapon pattern
        switch(this.currentWeapon.pattern) {
            case 'single':
                this.createProjectile(snakeHead, direction);
                break;
            case 'spread':
                this.createSpread(snakeHead, direction);
                break;
            case 'homing':
                this.createHomingProjectile(snakeHead, direction);
                break;
            case 'beam':
                this.createBeam(snakeHead, direction);
                break;
            case 'shotgun':
                this.createShotgun(snakeHead, direction);
                break;
            case 'chain':
                this.createChainProjectile(snakeHead, direction);
                break;
            case 'explosive':
                this.createExplosiveProjectile(snakeHead, direction);
                break;
            case 'flame':
                this.createFlameParticle(snakeHead, direction);
                break;
            case 'piercing':
                this.createPiercingProjectile(snakeHead, direction);
                break;
            case 'blackhole':
                this.createBlackHole(snakeHead, direction);
                break;
            case 'laserbeam':
                this.createLaserBeam(snakeHead, direction);
                break;
            case 'nuke':
                this.createNuke(snakeHead, direction);
                break;
        }

        // Create muzzle flash
        this.createMuzzleFlash(snakeHead, direction);
        
        // Update UI
        this.game.updateUI();
    }

    createProjectile(position, direction, offset = {x: 0, y: 0}) {
        const projectile = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2 + offset.x,
            y: position.y * this.game.gridSize + this.game.gridSize / 2 + offset.y,
            vx: 0,
            vy: 0,
            damage: this.currentWeapon.damage,
            speed: this.currentWeapon.projectileSpeed,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: 4,
            life: 100,
            pattern: this.currentWeapon.pattern,
            weapon: this.currentWeapon.name
        };

        // Set velocity based on direction
        switch(direction) {
            case 'up': projectile.vy = -projectile.speed; break;
            case 'down': projectile.vy = projectile.speed; break;
            case 'left': projectile.vx = -projectile.speed; break;
            case 'right': projectile.vx = projectile.speed; break;
        }

        this.projectiles.push(projectile);
    }

    createSpread(position, direction) {
        const baseAngle = this.getDirectionAngle(direction);
        const angleStep = (this.currentWeapon.spreadAngle * Math.PI / 180) / (this.currentWeapon.projectiles - 1);
        const startAngle = baseAngle - (this.currentWeapon.spreadAngle * Math.PI / 180) / 2;

        for (let i = 0; i < this.currentWeapon.projectiles; i++) {
            const angle = startAngle + i * angleStep;
            const projectile = {
                x: position.x * this.game.gridSize + this.game.gridSize / 2,
                y: position.y * this.game.gridSize + this.game.gridSize / 2,
                vx: Math.cos(angle) * this.currentWeapon.projectileSpeed,
                vy: Math.sin(angle) * this.currentWeapon.projectileSpeed,
                damage: this.currentWeapon.damage,
                color: this.currentWeapon.color,
                glow: this.currentWeapon.glow,
                size: 3,
                life: 100,
                pattern: 'spread'
            };
            this.projectiles.push(projectile);
        }
    }

    createHomingProjectile(position, direction) {
        const projectile = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            vx: 0,
            vy: 0,
            damage: this.currentWeapon.damage,
            speed: this.currentWeapon.projectileSpeed,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: 5,
            life: 200,
            pattern: 'homing',
            homingStrength: this.currentWeapon.homingStrength,
            target: this.findNearestTarget(position)
        };

        // Initial direction
        switch(direction) {
            case 'up': projectile.vy = -projectile.speed; break;
            case 'down': projectile.vy = projectile.speed; break;
            case 'left': projectile.vx = -projectile.speed; break;
            case 'right': projectile.vx = projectile.speed; break;
        }

        this.projectiles.push(projectile);
    }

    createBeam(position, direction) {
        const beam = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            direction: direction,
            damage: this.currentWeapon.damage,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            width: 8,
            life: this.currentWeapon.beamDuration,
            pattern: 'beam',
            active: true
        };

        this.projectiles.push(beam);
    }

    createShotgun(position, direction) {
        const baseAngle = this.getDirectionAngle(direction);
        const spread = this.currentWeapon.spreadAngle * Math.PI / 180;
        
        for (let i = 0; i < this.currentWeapon.projectiles; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * spread;
            const speedVariation = 0.8 + Math.random() * 0.4;
            
            const projectile = {
                x: position.x * this.game.gridSize + this.game.gridSize / 2,
                y: position.y * this.game.gridSize + this.game.gridSize / 2,
                vx: Math.cos(angle) * this.currentWeapon.projectileSpeed * speedVariation,
                vy: Math.sin(angle) * this.currentWeapon.projectileSpeed * speedVariation,
                damage: this.currentWeapon.damage,
                color: this.currentWeapon.color,
                glow: this.currentWeapon.glow,
                size: 2,
                life: 80,
                pattern: 'shotgun'
            };
            this.projectiles.push(projectile);
        }
    }

    createChainProjectile(position, direction) {
        const projectile = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            vx: 0,
            vy: 0,
            damage: this.currentWeapon.damage,
            speed: this.currentWeapon.projectileSpeed,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: 6,
            life: 150,
            pattern: 'chain',
            chainCount: this.currentWeapon.chainCount,
            chainedTargets: [],
            chainRange: this.currentWeapon.chainRange
        };

        switch(direction) {
            case 'up': projectile.vy = -projectile.speed; break;
            case 'down': projectile.vy = projectile.speed; break;
            case 'left': projectile.vx = -projectile.speed; break;
            case 'right': projectile.vx = projectile.speed; break;
        }

        this.projectiles.push(projectile);
    }

    createExplosiveProjectile(position, direction) {
        const projectile = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            vx: 0,
            vy: 0,
            damage: this.currentWeapon.damage,
            speed: this.currentWeapon.projectileSpeed,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: 8,
            life: 120,
            pattern: 'explosive',
            explosionRadius: this.currentWeapon.explosionRadius
        };

        switch(direction) {
            case 'up': projectile.vy = -projectile.speed; break;
            case 'down': projectile.vy = projectile.speed; break;
            case 'left': projectile.vx = -projectile.speed; break;
            case 'right': projectile.vx = projectile.speed; break;
        }

        this.projectiles.push(projectile);
    }

    createFlameParticle(position, direction) {
        const angle = this.getDirectionAngle(direction) + (Math.random() - 0.5) * 0.5;
        const speedVariation = 0.5 + Math.random() * 0.5;
        
        const particle = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            vx: Math.cos(angle) * this.currentWeapon.projectileSpeed * speedVariation,
            vy: Math.sin(angle) * this.currentWeapon.projectileSpeed * speedVariation,
            damage: this.currentWeapon.damage,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: Math.random() * 3 + 2,
            life: 0.5 + Math.random() * 0.5,
            pattern: 'flame'
        };

        this.projectiles.push(particle);
    }

    createPiercingProjectile(position, direction) {
        const projectile = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            vx: 0,
            vy: 0,
            damage: this.currentWeapon.damage,
            speed: this.currentWeapon.projectileSpeed,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: 6,
            life: 200,
            pattern: 'piercing',
            pierceCount: this.currentWeapon.pierceCount,
            piercedTargets: []
        };

        switch(direction) {
            case 'up': projectile.vy = -projectile.speed; break;
            case 'down': projectile.vy = projectile.speed; break;
            case 'left': projectile.vx = -projectile.speed; break;
            case 'right': projectile.vx = projectile.speed; break;
        }

        this.projectiles.push(projectile);
    }

    createBlackHole(position, direction) {
        const blackHole = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            vx: 0,
            vy: 0,
            damage: this.currentWeapon.damage,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: 10,
            life: this.currentWeapon.duration,
            pattern: 'blackhole',
            radius: 100,
            pullStrength: this.currentWeapon.pullStrength,
            growth: 0
        };

        // Add initial velocity
        switch(direction) {
            case 'up': blackHole.vy = -3; break;
            case 'down': blackHole.vy = 3; break;
            case 'left': blackHole.vx = -3; break;
            case 'right': blackHole.vx = 3; break;
        }

        this.projectiles.push(blackHole);
    }

    createLaserBeam(position, direction) {
        const beam = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            direction: direction,
            damage: this.currentWeapon.damage,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            width: this.currentWeapon.beamWidth,
            life: 1000,
            pattern: 'laserbeam',
            active: true
        };

        this.projectiles.push(beam);
    }

    createNuke(position, direction) {
        const nuke = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            vx: 0,
            vy: 0,
            damage: this.currentWeapon.damage,
            color: this.currentWeapon.color,
            glow: this.currentWeapon.glow,
            size: 15,
            life: 120,
            pattern: 'nuke',
            explosionRadius: this.currentWeapon.explosionRadius,
            detonated: false
        };

        switch(direction) {
            case 'up': nuke.vy = -nuke.speed; break;
            case 'down': nuke.vy = nuke.speed; break;
            case 'left': nuke.vx = -nuke.speed; break;
            case 'right': nuke.vx = nuke.speed; break;
        }

        this.projectiles.push(nuke);
    }

    createMuzzleFlash(position, direction) {
        const flash = {
            x: position.x * this.game.gridSize + this.game.gridSize / 2,
            y: position.y * this.game.gridSize + this.game.gridSize / 2,
            direction: direction,
            life: 0.2,
            size: 15,
            color: this.currentWeapon.glow
        };

        this.projectiles.push(flash);
    }

    getDirectionAngle(direction) {
        switch(direction) {
            case 'up': return -Math.PI / 2;
            case 'down': return Math.PI / 2;
            case 'left': return Math.PI;
            case 'right': return 0;
            default: return 0;
        }
    }

    findNearestTarget(fromPosition) {
        // In a real game, this would find enemies
        // For now, return a random point for demonstration
        return {
            x: fromPosition.x + (Math.random() - 0.5) * 10,
            y: fromPosition.y + (Math.random() - 0.5) * 10
        };
    }

    update() {
        // Regenerate ammo
        this.ammo = Math.min(this.maxAmmo, this.ammo + this.reloadRate * 0.1);

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            if (projectile.life <= 0) {
                // Handle projectile expiration
                if (projectile.pattern === 'explosive' && !projectile.exploded) {
                    this.createExplosion(projectile);
                } else if (projectile.pattern === 'nuke' && !projectile.detonated) {
                    this.createNukeExplosion(projectile);
                }
                this.projectiles.splice(i, 1);
                continue;
            }

            // Update projectile based on pattern
            this.updateProjectile(projectile);
            projectile.life--;
        }
    }

    updateProjectile(projectile) {
        switch(projectile.pattern) {
            case 'homing':
                this.updateHomingProjectile(projectile);
                break;
            case 'chain':
                this.updateChainProjectile(projectile);
                break;
            case 'blackhole':
                this.updateBlackHole(projectile);
                break;
            case 'muzzleflash':
                // Muzzle flash just fades out
                projectile.size *= 0.8;
                break;
            default:
                // Standard movement
                projectile.x += projectile.vx;
                projectile.y += projectile.vy;
        }

        // Check bounds
        if (projectile.x < 0 || projectile.x > this.game.canvas.width ||
            projectile.y < 0 || projectile.y > this.game.canvas.height) {
            projectile.life = 0;
        }
    }

    updateHomingProjectile(projectile) {
        if (projectile.target) {
            const dx = projectile.target.x - projectile.x;
            const dy = projectile.target.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                // Adjust velocity towards target
                projectile.vx += (dx / distance) * projectile.homingStrength;
                projectile.vy += (dy / distance) * projectile.homingStrength;
                
                // Normalize speed
                const currentSpeed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
                projectile.vx = (projectile.vx / currentSpeed) * projectile.speed;
                projectile.vy = (projectile.vy / currentSpeed) * projectile.speed;
            }
        }
        
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
    }

    updateChainProjectile(projectile) {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
        
        // Chain lightning logic would go here
        // This would require having enemies to chain between
    }

    updateBlackHole(projectile) {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
        
        // Grow over time
        projectile.growth += 0.1;
        projectile.radius = 100 + projectile.growth * 50;
        projectile.size = 10 + projectile.growth * 5;
        
        // Pull in other projectiles (for visual effect)
        this.projectiles.forEach(p => {
            if (p !== projectile && p.pattern !== 'blackhole') {
                const dx = projectile.x - p.x;
                const dy = projectile.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < projectile.radius) {
                    const pull = projectile.pullStrength * (1 - distance / projectile.radius);
                    p.vx += (dx / distance) * pull;
                    p.vy += (dy / distance) * pull;
                }
            }
        });
    }

    createExplosion(projectile) {
        projectile.exploded = true;
        
        // Create explosion particles
        for (let i = 0; i < 30; i++) {
            this.game.particles.push({
                x: projectile.x,
                y: projectile.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                size: Math.random() * 4 + 2,
                color: projectile.color
            });
        }
    }

    createNukeExplosion(projectile) {
        projectile.detonated = true;
        
        // Create massive explosion
        for (let i = 0; i < 100; i++) {
            this.game.particles.push({
                x: projectile.x,
                y: projectile.y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 2,
                size: Math.random() * 8 + 4,
                color: ['#ff0', '#f80', '#f00'][Math.floor(Math.random() * 3)]
            });
        }
    }

    checkCollisions(food) {
        // Check projectile collisions with food
        this.projectiles.forEach(projectile => {
            if (projectile.pattern === 'beam' || projectile.pattern === 'laserbeam') {
                // Beam weapons have special collision detection
                this.checkBeamCollision(projectile, food);
            } else {
                const dx = projectile.x - (food.x * this.game.gridSize + this.game.gridSize / 2);
                const dy = projectile.y - (food.y * this.game.gridSize + this.game.gridSize / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < projectile.size + this.game.gridSize / 2) {
                    this.handleProjectileHit(projectile, food);
                }
            }
        });
    }

    checkBeamCollision(beam, food) {
        const foodX = food.x * this.game.gridSize + this.game.gridSize / 2;
        const foodY = food.y * this.game.gridSize + this.game.gridSize / 2;
        
        let collision = false;
        
        switch(beam.direction) {
            case 'up':
            case 'down':
                collision = Math.abs(foodX - beam.x) < beam.width / 2;
                break;
            case 'left':
            case 'right':
                collision = Math.abs(foodY - beam.y) < beam.width / 2;
                break;
        }
        
        if (collision) {
            this.handleProjectileHit(beam, food);
        }
    }

    handleProjectileHit(projectile, food) {
        // Apply damage or effects to food
        // For now, just create hit particles
        this.createHitParticles(projectile, food);
        
        // Special effects based on weapon type
        switch(projectile.pattern) {
            case 'explosive':
                this.createExplosion(projectile);
                projectile.life = 0;
                break;
            case 'freeze':
                // Freeze effect would go here
                break;
        }
    }

    createHitParticles(projectile, food) {
        for (let i = 0; i < 10; i++) {
            this.game.particles.push({
                x: food.x * this.game.gridSize + this.game.gridSize / 2,
                y: food.y * this.game.gridSize + this.game.gridSize / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 0.7,
                size: Math.random() * 2 + 1,
                color: projectile.color
            });
        }
    }

    draw(ctx) {
        this.projectiles.forEach(projectile => {
            this.drawProjectile(ctx, projectile);
        });
    }

    drawProjectile(ctx, projectile) {
        ctx.save();
        
        switch(projectile.pattern) {
            case 'beam':
                this.drawBeam(ctx, projectile);
                break;
            case 'laserbeam':
                this.drawLaserBeam(ctx, projectile);
                break;
            case 'blackhole':
                this.drawBlackHole(ctx, projectile);
                break;
            case 'muzzleflash':
                this.drawMuzzleFlash(ctx, projectile);
                break;
            default:
                this.drawStandardProjectile(ctx, projectile);
        }
        
        ctx.restore();
    }

    drawStandardProjectile(ctx, projectile) {
        ctx.globalAlpha = Math.min(1, projectile.life / 20);
        ctx.fillStyle = projectile.color;
        ctx.shadowColor = projectile.glow;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw trail
        if (projectile.vx !== 0 || projectile.vy !== 0) {
            ctx.strokeStyle = projectile.color;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.moveTo(projectile.x, projectile.y);
            ctx.lineTo(projectile.x - projectile.vx * 0.5, projectile.y - projectile.vy * 0.5);
            ctx.stroke();
        }
    }

    drawBeam(ctx, beam) {
        if (!beam.active) return;
        
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = beam.width;
        ctx.shadowColor = beam.glow;
        ctx.shadowBlur = 20;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        
        switch(beam.direction) {
            case 'up':
                ctx.moveTo(beam.x, beam.y);
                ctx.lineTo(beam.x, 0);
                break;
            case 'down':
                ctx.moveTo(beam.x, beam.y);
                ctx.lineTo(beam.x, this.game.canvas.height);
                break;
            case 'left':
                ctx.moveTo(beam.x, beam.y);
                ctx.lineTo(0, beam.y);
                break;
            case 'right':
                ctx.moveTo(beam.x, beam.y);
                ctx.lineTo(this.game.canvas.width, beam.y);
                break;
        }
        
        ctx.stroke();
    }

    drawLaserBeam(ctx, beam) {
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = beam.width;
        ctx.shadowColor = beam.glow;
        ctx.shadowBlur = 30;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        
        switch(beam.direction) {
            case 'up':
                ctx.moveTo(beam.x - beam.width/2, beam.y);
                ctx.lineTo(beam.x - beam.width/2, 0);
                ctx.lineTo(beam.x + beam.width/2, 0);
                ctx.lineTo(beam.x + beam.width/2, beam.y);
                break;
            case 'down':
                ctx.moveTo(beam.x - beam.width/2, beam.y);
                ctx.lineTo(beam.x - beam.width/2, this.game.canvas.height);
                ctx.lineTo(beam.x + beam.width/2, this.game.canvas.height);
                ctx.lineTo(beam.x + beam.width/2, beam.y);
                break;
            case 'left':
                ctx.moveTo(beam.x, beam.y - beam.width/2);
                ctx.lineTo(0, beam.y - beam.width/2);
                ctx.lineTo(0, beam.y + beam.width/2);
                ctx.lineTo(beam.x, beam.y + beam.width/2);
                break;
            case 'right':
                ctx.moveTo(beam.x, beam.y - beam.width/2);
                ctx.lineTo(this.game.canvas.width, beam.y - beam.width/2);
                ctx.lineTo(this.game.canvas.width, beam.y + beam.width/2);
                ctx.lineTo(beam.x, beam.y + beam.width/2);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
    }

    drawBlackHole(ctx, blackHole) {
        // Main black hole
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(blackHole.x, blackHole.y, blackHole.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Event horizon glow
        const gradient = ctx.createRadialGradient(
            blackHole.x, blackHole.y, blackHole.size,
            blackHole.x, blackHole.y, blackHole.radius
        );
        gradient.addColorStop(0, blackHole.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Swirling particles
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = blackHole.glow;
        ctx.lineWidth = 1;
        ctx.shadowColor = blackHole.glow;
        ctx.shadowBlur = 10;
        
        for (let i = 0; i < 8; i++) {
            const angle = Date.now() * 0.001 + (i * Math.PI / 4);
            const radius = blackHole.size + 10;
            const endRadius = blackHole.radius - 10;
            
            ctx.beginPath();
            ctx.moveTo(
                blackHole.x + Math.cos(angle) * radius,
                blackHole.y + Math.sin(angle) * radius
            );
            ctx.lineTo(
                blackHole.x + Math.cos(angle) * endRadius,
                blackHole.y + Math.sin(angle) * endRadius
            );
            ctx.stroke();
        }
    }

    drawMuzzleFlash(ctx, flash) {
        ctx.globalAlpha = flash.life;
        ctx.fillStyle = flash.color;
        ctx.shadowColor = flash.color;
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Weapon progression system
    unlockRandomWeapon() {
        const lockedWeapons = Object.keys(this.weapons).filter(weapon => 
            !this.unlockedWeapons.includes(weapon)
        );
        
        if (lockedWeapons.length > 0) {
            const randomWeapon = lockedWeapons[Math.floor(Math.random() * lockedWeapons.length)];
            this.unlockedWeapons.push(randomWeapon);
            this.showUnlockMessage(randomWeapon);
        }
    }

    upgradeWeapon(weaponType) {
        if (this.weaponLevels[weaponType] < this.weapons[weaponType].maxLevel) {
            this.weaponLevels[weaponType]++;
            
            if (this.currentWeapon && this.currentWeapon.name === this.weapons[weaponType].name) {
                this.selectWeapon(weaponType); // Reload current weapon with upgrades
            }
            
            this.showUpgradeMessage(weaponType);
        }
    }

    showUnlockMessage(weaponType) {
        // Create unlock notification
        console.log(`UNLOCKED: ${this.weapons[weaponType].name}`);
        // In a full implementation, this would show a UI notification
    }

    showUpgradeMessage(weaponType) {
        // Create upgrade notification
        console.log(`UPGRADED: ${this.weapons[weaponType].name} to level ${this.weaponLevels[weaponType]}`);
        // In a full implementation, this would show a UI notification
    }

    addAmmo(amount) {
        this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    }

    reset() {
        this.projectiles = [];
        this.ammo = this.maxAmmo;
        this.unlockedWeapons = ['basic'];
        Object.keys(this.weaponLevels).forEach(weapon => {
            this.weaponLevels[weapon] = 1;
        });
        this.selectWeapon('basic');
    }

    getUnlockedWeapons() {
        return this.unlockedWeapons.map(weapon => ({
            name: this.weapons[weapon].name,
            type: weapon,
            level: this.weaponLevels[weapon],
            maxLevel: this.weapons[weapon].maxLevel
        }));
    }
}