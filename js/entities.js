// ============================================================================
// OINK OF ISAAC: BARNYARD BREAKOUT - ENTITIES & COMBAT SYSTEM
// Player (Piglet), Animal Predators (Enemies & Bosses), Projectiles,
// Merchant NPC, Familiars, and Pickups.
// ============================================================================

// ============================================================================
// PROJECTILE
// ============================================================================
class Projectile {
    constructor(x, y, vx, vy, config = {}) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = config.radius || 5;
        this.damage = config.damage || 3.5;
        this.rangeLeft = config.range || 300;
        this.owner = config.owner || 'player'; // 'player' or 'enemy'
        this.color = config.color || '#ff85a1';
        this.effects = config.effects || {};
        this.pierceLeft = this.effects.piercing ? 3 : 0;
        this.bouncesLeft = this.effects.bouncing ? 2 : 0;
        this.isDead = false;
        this.lifeTime = 0;
    }

    update(dt, game) {
        this.lifeTime += dt;
        const dist = Math.hypot(this.vx, this.vy) * dt;
        this.rangeLeft -= dist;

        if (this.rangeLeft <= 0) {
            this.destroy(game);
            return;
        }

        // Homing effect towards enemies
        if (this.owner === 'player' && this.effects.homing && game.currentRoom) {
            let closest = null;
            let minDist = 220;
            for (const enemy of game.currentRoom.enemies) {
                if (!enemy.isDead && !enemy.isInvulnerable) {
                    const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (d < minDist) {
                        minDist = d;
                        closest = enemy;
                    }
                }
            }
            if (closest) {
                const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
                const speed = Math.hypot(this.vx, this.vy);
                const curAngle = Math.atan2(this.vy, this.vx);
                const diff = Math.atan2(Math.sin(angle - curAngle), Math.cos(angle - curAngle));
                const turnRate = 6.0 * dt;
                const newAngle = curAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnRate);
                this.vx = Math.cos(newAngle) * speed;
                this.vy = Math.sin(newAngle) * speed;
            }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Wall collisions
        const room = game.currentRoom;
        if (room) {
            const minX = 40, maxX = 760, minY = 40, maxY = 560;
            if (this.x < minX || this.x > maxX || this.y < minY || this.y > maxY) {
                if (this.bouncesLeft > 0) {
                    this.bouncesLeft--;
                    if (this.x < minX || this.x > maxX) this.vx = -this.vx;
                    if (this.y < minY || this.y > maxY) this.vy = -this.vy;
                    this.x = Math.max(minX, Math.min(maxX, this.x));
                    this.y = Math.max(minY, Math.min(maxY, this.y));
                } else {
                    this.destroy(game);
                    return;
                }
            }

            // Rock obstacle collisions (unless spectral)
            if (!this.effects.spectral && room.obstacles) {
                for (const obs of room.obstacles) {
                    if (obs.type === 'rock' || obs.type === 'hay_bale') {
                        const d = Math.hypot(this.x - (obs.x + 16), this.y - (obs.y + 16));
                        if (d < 16 + this.radius) {
                            if (this.effects.wreckingBall) {
                                // Destroy obstacle!
                                obs.destroyed = true;
                                game.spawnParticles(obs.x + 16, obs.y + 16, '#6c757d', 10);
                            } else if (this.bouncesLeft > 0) {
                                this.bouncesLeft--;
                                this.vx = -this.vx;
                                this.vy = -this.vy;
                            } else {
                                this.destroy(game);
                                return;
                            }
                        }
                    }
                }
            }
        }

        // Particle trail
        if (Math.random() < 0.3) {
            const trailColor = this.effects.burning ? '#ff5400' :
                               (this.effects.electric ? '#ffd166' :
                               (this.effects.poison ? '#70e000' : this.color));
            game.spawnParticles(this.x, this.y, trailColor, 1, 10);
        }
    }

    destroy(game) {
        if (this.isDead) return;
        this.isDead = true;

        // Explosive blast
        if (this.effects.explosiveShots || this.effects.megaExplosions) {
            const radius = this.effects.megaExplosions ? 85 : 50;
            const expDmg = this.damage * 1.5;
            game.createExplosion(this.x, this.y, radius, expDmg, this.owner);
        }

        // Popcorn flak synergy
        if (this.effects.popcornFlak) {
            if (game.sound) game.sound.playShoot('fire');
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i + Math.random() * 0.5;
                const spd = 160 + Math.random() * 60;
                game.projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * spd, Math.sin(angle) * spd, {
                    damage: this.damage * 0.6,
                    range: 90,
                    radius: 4,
                    color: '#fff3b0',
                    effects: { burning: true }
                }));
            }
        }

        // Apple core shrapnel
        if (this.effects.burstShrapnel || this.effects.homingShrapnel) {
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i;
                const spd = 180;
                game.projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * spd, Math.sin(angle) * spd, {
                    damage: this.damage * 0.4,
                    range: 120,
                    radius: 3,
                    color: '#5c3d2e',
                    effects: { homing: !!this.effects.homingShrapnel }
                }));
            }
        }

        game.spawnParticles(this.x, this.y, this.color, 4);
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;

        // Custom visuals based on item
        if (this.effects.giantTears || this.effects.wreckingBall) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f77f00';
            ctx.beginPath();
            ctx.arc(this.x - 2, this.y - 2, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.effects.chainLightning) {
            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(this.x - 1, this.y - 1, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// ============================================================================
// PLAYER (THE CARTOON PIGLET)
// ============================================================================
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;

        // Core Stats
        this.maxHp = 6;       // 6 halves = 3 full hearts
        this.hp = 6;
        this.shields = 0;     // Mud armor
        this.coins = 5;       // Starting corn
        this.bombs = 2;       // Starting apple bombs
        this.keys = 1;        // Starting keys

        this.baseDamage = 3.5;
        this.baseTearRate = 2.4; // Shots per second
        this.baseSpeed = 190;
        this.baseRange = 320;
        this.baseShotSpeed = 380;
        this.luck = 1;

        // Dynamic Computed Stats
        this.damage = this.baseDamage;
        this.tearRate = this.baseTearRate;
        this.speed = this.baseSpeed;
        this.range = this.baseRange;
        this.shotSpeed = this.baseShotSpeed;

        // Inventory
        this.items = [];
        this.itemIds = new Set();
        this.synergies = new Set();
        this.activeItem = null;
        this.activeCharges = 0;
        this.familiars = [];

        // States
        this.direction = 'down';
        this.facingAngle = Math.PI / 2;
        this.animFrame = 0;
        this.animTimer = 0;
        this.shootCooldown = 0;
        this.invulnTimer = 0;
        this.isDead = false;
        this.slowFactor = 1.0;
        this.extraLives = 0;

        // Visual modifiers
        this.accessories = {};
    }

    getBounds() {
        return {
            x: this.x - this.width / 2 + 4,
            y: this.y - this.height / 2 + 4,
            w: this.width - 8,
            h: this.height - 8
        };
    }

    hasEffect(effectName) {
        if (this.accessories[effectName]) return true;
        for (const it of this.items) {
            if (it.effects && it.effects[effectName]) return true;
        }
        return false;
    }

    addItem(item, game) {
        if (item.type === 'active') {
            this.activeItem = item;
            this.activeCharges = item.maxCharges;
            if (game.sound) game.sound.playItemFanfare();
            return;
        }

        this.items.push(item);
        this.itemIds.add(item.id);

        // Familiars
        if (item.familiarType) {
            this.familiars.push(new Familiar(item.familiarType, this));
        }

        this.recalculateStats(game);

        // Check Synergies
        this.checkSynergies(game);

        if (game.sound) game.sound.playItemFanfare();
    }

    recalculateStats(game) {
        let dmg = this.baseDamage;
        let tears = this.baseTearRate;
        let spd = this.baseSpeed;
        let rng = this.baseRange;
        let shotSpd = this.baseShotSpeed;
        let lck = 1;

        this.accessories = {};

        for (const it of this.items) {
            if (it.stats) {
                if (it.stats.damage) dmg += it.stats.damage;
                if (it.stats.tearRate) tears += it.stats.tearRate;
                if (it.stats.speed) spd += it.stats.speed * 60;
                if (it.stats.range) rng += it.stats.range;
                if (it.stats.shotSpeed) shotSpd += it.stats.shotSpeed * 100;
                if (it.stats.luck) lck += it.stats.luck;
                if (it.stats.maxHp) {
                    this.maxHp = Math.min(16, this.maxHp + it.stats.maxHp);
                    this.hp = Math.min(this.maxHp, this.hp + it.stats.maxHp);
                    it.stats.maxHp = 0; // Applied once
                }
                if (it.stats.shields) {
                    this.shields += it.stats.shields;
                    it.stats.shields = 0;
                }
            }
            if (it.effects) {
                if (it.effects.mudCoat) this.accessories.mudCoat = true;
                if (it.effects.flying) this.accessories.wings = true;
                if (it.effects.holyBeams) this.accessories.halo = true;
                if (it.effects.headArmor) this.accessories.potHelmet = true;
                if (it.effects.skyShield) this.accessories.strawHat = true;
                if (it.effects.berserkRage) this.accessories.bandana = true;
                if (it.effects.bouncyDash) this.accessories.boots = true;
                if (it.effects.showEnemyHp) this.accessories.specs = true;
                if (it.effects.extraLife) {
                    this.extraLives += it.effects.extraLife;
                    it.effects.extraLife = 0;
                }
            }
        }

        // Apply synergy bonus stats
        if (window.PIG_SYNERGIES) {
            for (const syn of window.PIG_SYNERGIES) {
                if (this.synergies.has(syn.id) && syn.bonusStats) {
                    if (syn.bonusStats.damage) dmg += syn.bonusStats.damage;
                    if (syn.bonusStats.tearRate) tears += syn.bonusStats.tearRate;
                    if (syn.bonusStats.speed) spd += syn.bonusStats.speed * 60;
                }
            }
        }

        // Money is power
        if (this.hasEffect('moneyIsPower')) {
            dmg += (this.coins * 0.15);
        }

        // Berserk rage check (< 1 full heart = 2 hp)
        if (this.hasEffect('berserkRage') && this.hp <= 2) {
            dmg *= 2.2;
            tears *= 1.8;
            this.accessories.berserk = true;
        }

        this.damage = Math.max(1.0, dmg);
        this.tearRate = Math.max(0.5, tears);
        this.speed = Math.max(120, spd);
        this.range = Math.max(150, rng);
        this.shotSpeed = Math.max(200, shotSpd);
        this.luck = lck;
    }

    checkSynergies(game) {
        if (!window.PIG_SYNERGIES) return;
        let newSynergy = false;
        for (const syn of window.PIG_SYNERGIES) {
            if (!this.synergies.has(syn.id)) {
                const hasAll = syn.required.every(reqId => this.itemIds.has(reqId));
                if (hasAll) {
                    this.synergies.add(syn.id);
                    newSynergy = true;
                    if (game) {
                        game.showSynergyBanner(syn.name, syn.desc);
                        if (game.sound) game.sound.playSynergyJingle();
                    }
                }
            }
        }
        if (newSynergy) {
            this.recalculateStats(game);
        }
    }

    update(dt, input, game) {
        if (this.isDead) return;

        if (this.invulnTimer > 0) this.invulnTimer -= dt;
        if (this.shootCooldown > 0) this.shootCooldown -= dt;

        // Reset slow factor each frame (traps re-apply)
        const moveSpeed = this.speed * this.slowFactor;
        this.slowFactor = 1.0;

        // Movement input
        let dx = 0, dy = 0;
        if (input.keys['KeyW'] || input.keys['ArrowUp']) dy -= 1;
        if (input.keys['KeyS'] || input.keys['ArrowDown']) dy += 1;
        if (input.keys['KeyA'] || input.keys['ArrowLeft']) dx -= 1;
        if (input.keys['KeyD'] || input.keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.hypot(dx, dy);
            dx /= len;
            dy /= len;

            this.x += dx * moveSpeed * dt;
            this.y += dy * moveSpeed * dt;

            // Direction facing
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.direction = dy > 0 ? 'down' : 'up';
            }

            // Animation
            this.animTimer += dt * 8;
            this.animFrame = Math.floor(this.animTimer) % 2;

            // Mud trail effect
            if (this.hasEffect('mudTrail') && Math.random() < 0.25) {
                game.currentRoom.traps.push(new Trap(this.x - 16, this.y - 16, 'mud_pit'));
            }
        } else {
            this.animFrame = 0;
        }

        // Keep inside room bounds (allow doorways if open)
        const room = game.currentRoom;
        const canExitNorth = room && room.cleared && room.doors.north && this.x >= 350 && this.x <= 450;
        const canExitSouth = room && room.cleared && room.doors.south && this.x >= 350 && this.x <= 450;
        const canExitWest  = room && room.cleared && room.doors.west  && this.y >= 250 && this.y <= 350;
        const canExitEast  = room && room.cleared && room.doors.east  && this.y >= 250 && this.y <= 350;

        const minX = canExitWest  ? 24 : 52;
        const maxX = canExitEast  ? 776 : 748;
        const minY = canExitNorth ? 24 : 52;
        const maxY = canExitSouth ? 576 : 548;

        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.y = Math.max(minY, Math.min(maxY, this.y));

        // Shooting input (IJKL / Mouse Click / Shoot keys)
        let shootX = 0, shootY = 0;
        if (input.keys['KeyI']) shootY -= 1;
        if (input.keys['KeyK']) shootY += 1;
        if (input.keys['KeyJ']) shootX -= 1;
        if (input.keys['KeyL']) shootX += 1;

        if (input.mouse.down) {
            const mAngle = Math.atan2(input.mouse.y - this.y, input.mouse.x - this.x);
            shootX = Math.cos(mAngle);
            shootY = Math.sin(mAngle);
        }

        if ((shootX !== 0 || shootY !== 0) && this.shootCooldown <= 0) {
            this.shoot(shootX, shootY, game);
            this.shootCooldown = 1.0 / this.tearRate;
        }

        // Active item use (Spacebar)
        if (input.keys['Space'] && this.activeItem && this.activeCharges >= this.activeItem.maxCharges) {
            this.useActiveItem(game);
            input.keys['Space'] = false; // consume press
        }

        // Update Familiars
        for (const fam of this.familiars) {
            fam.update(dt, game);
        }

        // Holy halo smite check
        if (this.hasEffect('holyBeams') && Math.random() < 0.02 && game.currentRoom) {
            const aliveEnemies = game.currentRoom.enemies.filter(e => !e.isDead);
            if (aliveEnemies.length > 0) {
                const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                target.takeDamage(4.0, 'holy_beam', game);
                game.spawnParticles(target.x, target.y, '#ffd166', 15);
                if (game.sound) game.sound.playShoot('lightning');
            }
        }
    }

    shoot(dirX, dirY, game) {
        const angle = Math.atan2(dirY, dirX);
        const len = Math.hypot(dirX, dirY);
        const nx = dirX / len;
        const ny = dirY / len;

        const bulletEffects = {};
        for (const it of this.items) {
            if (it.effects) Object.assign(bulletEffects, it.effects);
        }
        for (const syn of this.synergies) {
            const sData = window.PIG_SYNERGIES.find(s => s.id === syn);
            if (sData && sData.effects) Object.assign(bulletEffects, sData.effects);
        }

        let bulletColor = '#ff85a1';
        let shootSound = 'normal';
        let bulletRadius = 5;

        if (bulletEffects.burning) { bulletColor = '#ff5400'; shootSound = 'fire'; }
        if (bulletEffects.freezing) { bulletColor = '#48cae4'; }
        if (bulletEffects.poison) { bulletColor = '#70e000'; }
        if (bulletEffects.chainLightning) { bulletColor = '#ffd166'; shootSound = 'lightning'; }
        if (bulletEffects.giantTears) { bulletRadius = 14; shootSound = 'heavy'; }
        if (bulletEffects.midasTouch) { bulletColor = '#ffd700'; }

        // Multiple shot check (Barn Slingshot)
        if (bulletEffects.tripleShot) {
            for (let offset of [-0.25, 0, 0.25]) {
                const a = angle + offset;
                const vx = Math.cos(a) * this.shotSpeed;
                const vy = Math.sin(a) * this.shotSpeed;
                game.projectiles.push(new Projectile(this.x, this.y, vx, vy, {
                    damage: this.damage,
                    range: this.range,
                    radius: bulletRadius,
                    color: bulletColor,
                    effects: bulletEffects,
                    owner: 'player'
                }));
            }
        } else {
            const vx = nx * this.shotSpeed;
            const vy = ny * this.shotSpeed;
            game.projectiles.push(new Projectile(this.x, this.y, vx, vy, {
                damage: this.damage,
                range: this.range,
                radius: bulletRadius,
                color: bulletColor,
                effects: bulletEffects,
                owner: 'player'
            }));
        }

        if (game.sound) game.sound.playShoot(shootSound);
    }

    useActiveItem(game) {
        if (!this.activeItem) return;
        this.activeCharges = 0;

        const id = this.activeItem.id;
        if (id === 'squeal_of_terror') {
            if (game.sound) game.sound.playRoar();
            if (game.currentRoom) {
                for (const enemy of game.currentRoom.enemies) {
                    if (!enemy.isDead) {
                        enemy.immobilize(2.5);
                        const pushAngle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                        enemy.x += Math.cos(pushAngle) * 80;
                        enemy.y += Math.sin(pushAngle) * 80;
                    }
                }
            }
            game.spawnParticles(this.x, this.y, '#e63946', 20);
        } else if (id === 'farmers_pocket_watch') {
            if (game.sound) game.sound.playShoot('lightning');
            if (game.currentRoom) {
                for (const enemy of game.currentRoom.enemies) {
                    enemy.immobilize(5.0);
                }
            }
            game.spawnParticles(this.x, this.y, '#48cae4', 30);
        } else if (id === 'silver_whistle') {
            if (game.sound) game.sound.playDoor();
            // Stampede of sheep
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    if (game.currentRoom) {
                        for (const enemy of game.currentRoom.enemies) {
                            enemy.takeDamage(6.0, 'stampede', game);
                        }
                    }
                    game.spawnParticles(400, 300, '#ffffff', 25);
                }, i * 300);
            }
        } else if (id === 'golden_egg') {
            // Drops random consumable
            this.hp = Math.min(this.maxHp, this.hp + 2);
            this.coins += 5;
            this.bombs += 1;
            if (game.sound) game.sound.playHealth();
            game.spawnParticles(this.x, this.y, '#ffd166', 20);
        }
    }

    takeDamage(amount, source, game) {
        if (this.invulnTimer > 0 || this.isDead) return;

        // Shields first
        if (this.shields > 0) {
            this.shields = Math.max(0, this.shields - amount);
            if (game.sound) game.sound.playPigHurt();
        } else {
            this.hp = Math.max(0, this.hp - amount);
            if (game.sound) game.sound.playPigHurt();
        }

        this.invulnTimer = 1.0; // 1s invulnerability
        game.spawnParticles(this.x, this.y, '#ff85a1', 8);

        // Check death & revives
        if (this.hp <= 0 && this.shields <= 0) {
            if (this.extraLives > 0) {
                this.extraLives--;
                this.hp = 2; // 1 full heart
                this.invulnTimer = 3.0;
                if (game.sound) game.sound.playHealth();
                game.spawnParticles(this.x, this.y, '#ffd166', 30);
                if (this.hasEffect('berserkRevival')) {
                    this.invulnTimer = 10.0;
                    this.damage *= 2;
                }
            } else {
                this.die(game);
            }
        }

        this.recalculateStats(game);
    }

    die(game) {
        this.isDead = true;
        if (game.sound) game.sound.playEnemyDeath();
        game.onPlayerDeath();
    }

    render(ctx, game) {
        if (this.isDead) return;

        // Flicker during invulnerability
        if (this.invulnTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
            return;
        }

        const sprite = game.sprites.getPigSprite(this.direction, this.animFrame, this.accessories);
        if (sprite) {
            ctx.drawImage(sprite, Math.floor(this.x - 16), Math.floor(this.y - 16));
        }

        // Render familiars
        for (const fam of this.familiars) {
            fam.render(ctx, game);
        }
    }
}

// ============================================================================
// FAMILIARS / COMPANIONS
// ============================================================================
class Familiar {
    constructor(type, player) {
        this.type = type;
        this.player = player;
        this.angle = Math.random() * Math.PI * 2;
        this.orbitRadius = 40;
        this.x = player.x;
        this.y = player.y;
        this.shootTimer = 0;
    }

    update(dt, game) {
        this.angle += dt * 2.5;

        if (this.type === 'hay_bale' || this.type === 'sonic_bell') {
            // Orbiting shield
            this.x = this.player.x + Math.cos(this.angle) * this.orbitRadius;
            this.y = this.player.y + Math.sin(this.angle) * this.orbitRadius;

            // Block enemy bullets
            for (const proj of game.projectiles) {
                if (proj.owner === 'enemy' && !proj.isDead) {
                    if (Math.hypot(proj.x - this.x, proj.y - this.y) < 16) {
                        proj.destroy(game);
                        game.spawnParticles(this.x, this.y, '#ffd166', 5);
                    }
                }
            }
        } else {
            // Following companion (piglet, rooster, cat)
            const targetX = this.player.x - Math.cos(this.angle) * 32;
            const targetY = this.player.y - Math.sin(this.angle) * 32;
            this.x += (targetX - this.x) * dt * 4;
            this.y += (targetY - this.y) * dt * 4;

            // Shoot at enemies
            this.shootTimer += dt;
            if (this.shootTimer > 1.2 && game.currentRoom) {
                this.shootTimer = 0;
                let target = null;
                let minDist = 250;
                for (const e of game.currentRoom.enemies) {
                    if (!e.isDead) {
                        const d = Math.hypot(e.x - this.x, e.y - this.y);
                        if (d < minDist) { minDist = d; target = e; }
                    }
                }
                if (target) {
                    const ang = Math.atan2(target.y - this.y, target.x - this.x);
                    const spd = 260;
                    game.projectiles.push(new Projectile(this.x, this.y, Math.cos(ang) * spd, Math.sin(ang) * spd, {
                        damage: 2.0,
                        range: 220,
                        color: this.type === 'rooster' ? '#e63946' : '#ffb3c6',
                        owner: 'player'
                    }));
                }
            }
        }
    }

    render(ctx, game) {
        ctx.save();
        if (this.type === 'hay_bale') {
            ctx.fillStyle = '#e9c46a';
            ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        } else if (this.type === 'rooster') {
            ctx.fillStyle = '#e63946';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffb703';
            ctx.fillRect(this.x + 4, this.y - 2, 4, 4); // beak
        } else {
            // Little Piglet
            ctx.fillStyle = '#ff85a1';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e05780';
            ctx.fillRect(this.x + 2, this.y - 2, 4, 4); // snout
        }
        ctx.restore();
    }
}

// ============================================================================
// ENEMIES & ANIMAL PREDATORS
// ============================================================================
class Enemy {
    constructor(x, y, type, config = {}) {
        this.x = x;
        this.y = y;
        this.type = type; // 'wolf', 'alpha_wolf', 'fox', 'hawk', 'coyote', 'badger', 'hound', 'boss_wolf', 'boss_hawk', 'boss_farmer'
        this.width = 30;
        this.height = 30;
        this.isBoss = !!config.isBoss;
        this.maxHp = config.maxHp || (this.isBoss ? 200 : 15);
        this.hp = this.maxHp;
        this.speed = config.speed || 100;
        this.damage = config.damage || 1;
        this.isFlying = type === 'hawk' || type === 'boss_hawk';
        this.isDead = false;
        this.isInvulnerable = false;
        this.slowFactor = 1.0;
        this.immobilizeTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.attackTimer = Math.random() * 2;
        this.state = 'chase'; // 'chase', 'lunge', 'swoop', 'dig'
        this.lungeVx = 0;
        this.lungeVy = 0;

        // Boss-specific
        if (this.isBoss) {
            this.width = (type === 'boss_farmer') ? 60 : 44;
            this.height = (type === 'boss_farmer') ? 60 : 44;
            this.bossPhase = 1;
        }
    }

    getBounds() {
        return {
            x: this.x - this.width / 2 + 4,
            y: this.y - this.height / 2 + 4,
            w: this.width - 8,
            h: this.height - 8
        };
    }

    immobilize(duration) {
        this.immobilizeTimer = duration;
    }

    takeDamage(amount, source, game) {
        if (this.isDead || this.isInvulnerable) return;
        this.hp -= amount;

        if (game.sound) game.sound.playEnemyHit();
        game.spawnDamageNumber(this.x, this.y - 12, amount);
        game.spawnParticles(this.x, this.y, '#e63946', 4);

        if (this.hp <= 0) {
            this.die(game);
        }
    }

    die(game) {
        if (this.isDead) return;
        this.isDead = true;

        if (game.sound) game.sound.playEnemyDeath();
        game.spawnParticles(this.x, this.y, '#9d0208', this.isBoss ? 40 : 12);

        // Loot drop
        const luck = game.player.luck;
        const dropChance = 0.45 + (luck * 0.08);
        if (Math.random() < dropChance || this.isBoss) {
            const dropRoll = Math.random();
            if (dropRoll < 0.5) {
                game.currentRoom.pickups.push(new Pickup(this.x, this.y, 'coin'));
            } else if (dropRoll < 0.75) {
                game.currentRoom.pickups.push(new Pickup(this.x, this.y, 'apple'));
            } else if (dropRoll < 0.9) {
                game.currentRoom.pickups.push(new Pickup(this.x, this.y, 'bomb'));
            } else {
                game.currentRoom.pickups.push(new Pickup(this.x, this.y, 'key'));
            }
        }

        // Boss defeat drops pedestal and unlocks door!
        if (this.isBoss) {
            game.onBossDefeated(this);
        }
    }

    update(dt, game) {
        if (this.isDead) return;

        this.animTimer += dt * 6;
        this.animFrame = Math.floor(this.animTimer) % 2;

        if (this.immobilizeTimer > 0) {
            this.immobilizeTimer -= dt;
            return;
        }

        const p = game.player;
        if (!p || p.isDead) return;

        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        const dirX = (p.x - this.x) / (dist || 1);
        const dirY = (p.y - this.y) / (dist || 1);
        const curSpeed = this.speed * this.slowFactor;
        this.slowFactor = 1.0;

        this.attackTimer += dt;

        // Specific AI behaviors
        if (this.type === 'wolf' || this.type === 'hound') {
            // Stalk and lunge
            if (this.state === 'lunge') {
                this.x += this.lungeVx * dt;
                this.y += this.lungeVy * dt;
                if (this.attackTimer > 0.6) {
                    this.state = 'chase';
                    this.attackTimer = 0;
                }
            } else {
                this.x += dirX * curSpeed * dt;
                this.y += dirY * curSpeed * dt;
                if (dist < 140 && this.attackTimer > 2.2) {
                    this.state = 'lunge';
                    this.lungeVx = dirX * (curSpeed * 2.8);
                    this.lungeVy = dirY * (curSpeed * 2.8);
                    this.attackTimer = 0;
                    if (game.sound) game.sound.playRoar();
                }
            }
        } else if (this.type === 'alpha_wolf') {
            // Alpha wolf shoots teeth shockwaves
            this.x += dirX * curSpeed * dt;
            this.y += dirY * curSpeed * dt;
            if (this.attackTimer > 2.8) {
                this.attackTimer = 0;
                if (game.sound) game.sound.playRoar();
                for (let a of [-0.3, 0, 0.3]) {
                    const ang = Math.atan2(dirY, dirX) + a;
                    game.projectiles.push(new Projectile(this.x, this.y, Math.cos(ang) * 220, Math.sin(ang) * 220, {
                        damage: 1,
                        owner: 'enemy',
                        color: '#f77f00'
                    }));
                }
            }
        } else if (this.type === 'fox') {
            // Erratic flanking
            const flankX = -dirY;
            const flankY = dirX;
            this.x += (dirX * 0.5 + flankX * 0.8) * curSpeed * dt;
            this.y += (dirY * 0.5 + flankY * 0.8) * curSpeed * dt;
        } else if (this.type === 'coyote') {
            // Keeps range and spits bone projectiles
            if (dist < 160) {
                this.x -= dirX * curSpeed * dt;
                this.y -= dirY * curSpeed * dt;
            } else {
                this.x += dirX * (curSpeed * 0.5) * dt;
                this.y += dirY * (curSpeed * 0.5) * dt;
            }
            if (this.attackTimer > 2.0) {
                this.attackTimer = 0;
                game.projectiles.push(new Projectile(this.x, this.y, dirX * 240, dirY * 240, {
                    damage: 1,
                    owner: 'enemy',
                    color: '#ddb892'
                }));
            }
        } else if (this.type === 'hawk') {
            // Flying overhead and swooping
            this.x += dirX * (curSpeed * 1.3) * dt;
            this.y += dirY * (curSpeed * 1.3) * dt;
        } else if (this.type === 'boss_wolf') {
            // Boss 1: Fang
            this.x += dirX * curSpeed * dt;
            this.y += dirY * curSpeed * dt;
            if (this.attackTimer > 3.0) {
                this.attackTimer = 0;
                if (game.sound) game.sound.playRoar();
                // 8-way fang burst
                for (let i = 0; i < 8; i++) {
                    const a = (Math.PI * 2 / 8) * i;
                    game.projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 200, Math.sin(a) * 200, {
                        damage: 1,
                        owner: 'enemy',
                        color: '#d90429'
                    }));
                }
            }
        } else if (this.type === 'boss_hawk') {
            // Boss 2: Sky-Terror Hawk
            this.x += dirX * curSpeed * dt;
            this.y += dirY * curSpeed * dt;
            if (this.attackTimer > 2.5) {
                this.attackTimer = 0;
                // Feather storm
                for (let i = 0; i < 10; i++) {
                    const a = (Math.PI * 2 / 10) * i + Math.random() * 0.2;
                    game.projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 220, Math.sin(a) * 220, {
                        damage: 1,
                        owner: 'enemy',
                        color: '#a67c52'
                    }));
                }
            }
        } else if (this.type === 'boss_farmer') {
            // Boss 3: Farmer Grimm (The Butcher)
            const isEnraged = this.hp < (this.maxHp * 0.45);
            const moveMult = isEnraged ? 1.6 : 1.0;
            this.x += dirX * (curSpeed * moveMult) * dt;
            this.y += dirY * (curSpeed * moveMult) * dt;

            const attackRate = isEnraged ? 1.6 : 2.4;
            if (this.attackTimer > attackRate) {
                this.attackTimer = 0;
                if (game.sound) game.sound.playExplosion();

                // Double barrel shotgun blast
                for (let i = -2; i <= 2; i++) {
                    const a = Math.atan2(dirY, dirX) + (i * 0.18);
                    game.projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 260, Math.sin(a) * 260, {
                        damage: 1,
                        owner: 'enemy',
                        color: '#ffb703'
                    }));
                }

                // Cleaver shockwave
                if (isEnraged && dist < 180) {
                    game.createExplosion(this.x + dirX * 40, this.y + dirY * 40, 70, 2, 'enemy');
                }
            }
        }

        // Bounds
        this.x = Math.max(50, Math.min(750, this.x));
        this.y = Math.max(50, Math.min(550, this.y));

        // Contact damage with player
        if (Math.hypot(p.x - this.x, p.y - this.y) < (this.width / 2 + p.width / 2)) {
            if (!p.hasEffect('contactImmunity')) {
                p.takeDamage(this.damage, this.type, game);
            }
            if (p.hasEffect('rammingDamage')) {
                this.takeDamage(8.0, 'player_ram', game);
            }
        }
    }

    render(ctx, game) {
        if (this.isDead) return;

        let sprite = null;
        if (this.type === 'wolf') {
            sprite = game.sprites.getWolfSprite(this.animFrame, false);
        } else if (this.type === 'alpha_wolf' || this.type === 'boss_wolf') {
            sprite = game.sprites.getWolfSprite(this.animFrame, true);
        } else if (this.type === 'fox') {
            sprite = game.sprites.getFoxSprite(this.animFrame);
        } else if (this.type === 'hawk' || this.type === 'boss_hawk') {
            sprite = game.sprites.getHawkSprite(this.animFrame);
        } else if (this.type === 'coyote') {
            sprite = game.sprites.getCoyoteSprite(this.animFrame);
        } else if (this.type === 'badger') {
            sprite = game.sprites.getBadgerSprite(this.animFrame);
        } else if (this.type === 'boss_farmer') {
            sprite = game.sprites.getFarmerBossSprite(this.animFrame, this.hp < (this.maxHp * 0.45));
        } else {
            sprite = game.sprites.getWolfSprite(this.animFrame, false);
        }

        if (sprite) {
            const ox = Math.floor(this.x - sprite.width / 2);
            const oy = Math.floor(this.y - sprite.height / 2);
            ctx.drawImage(sprite, ox, oy);
        }

        // Show HP Bar if Boss or player has Specs item
        if (this.isBoss || game.player.hasEffect('showEnemyHp')) {
            const barW = this.isBoss ? 48 : 24;
            const barH = 4;
            const bx = this.x - barW / 2;
            const by = this.y - this.height / 2 - 8;

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
            ctx.fillStyle = '#e63946';
            ctx.fillRect(bx, by, Math.max(0, (this.hp / this.maxHp) * barW), barH);
        }
    }
}

// ============================================================================
// MERCHANT NPC: BARNABY THE RACCOON
// ============================================================================
class Merchant {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 36;
        this.animTimer = 0;
        this.wares = []; // Array of { item/pickup, price, x, y }
    }

    setupWares(game) {
        this.wares = [];
        const discount = game.player.hasEffect('merchantDiscount') ? 0.5 : 1.0;

        // Slot 1: Red Apple (Health)
        this.wares.push({
            type: 'pickup',
            pickupType: 'apple',
            name: 'Red Apple (Heal)',
            price: Math.max(1, Math.round(3 * discount)),
            x: this.x - 90,
            y: this.y + 60
        });

        // Slot 2: Mud Shield (Armor)
        this.wares.push({
            type: 'pickup',
            pickupType: 'shield',
            name: 'Mud Armor (+1 Shield)',
            price: Math.max(1, Math.round(5 * discount)),
            x: this.x - 30,
            y: this.y + 60
        });

        // Slot 3: Freedom Key
        this.wares.push({
            type: 'pickup',
            pickupType: 'key',
            name: 'Barn Key',
            price: Math.max(1, Math.round(5 * discount)),
            x: this.x + 30,
            y: this.y + 60
        });

        // Slot 4: Random Item from catalog
        const available = window.PIG_ITEMS.filter(it => !game.player.itemIds.has(it.id));
        if (available.length > 0) {
            const it = available[Math.floor(Math.random() * available.length)];
            this.wares.push({
                type: 'item',
                itemData: it,
                name: it.name,
                desc: it.desc,
                price: Math.max(5, Math.round(15 * discount)),
                x: this.x + 90,
                y: this.y + 60
            });
        }
    }

    update(dt, game) {
        this.animTimer += dt * 4;
        const p = game.player;

        // Check if player steps on any ware to buy
        for (let i = this.wares.length - 1; i >= 0; i--) {
            const ware = this.wares[i];
            const dist = Math.hypot(p.x - ware.x, p.y - ware.y);
            if (dist < 24) {
                if (p.coins >= ware.price) {
                    p.coins -= ware.price;
                    if (game.sound) game.sound.playCoin();

                    if (ware.type === 'pickup') {
                        if (ware.pickupType === 'apple') p.hp = Math.min(p.maxHp, p.hp + 2);
                        if (ware.pickupType === 'shield') p.shields += 1;
                        if (ware.pickupType === 'key') p.keys += 1;
                    } else if (ware.type === 'item') {
                        p.addItem(ware.itemData, game);
                    }

                    game.spawnParticles(ware.x, ware.y, '#ffd166', 15);
                    this.wares.splice(i, 1);
                } else {
                    // Not enough money hint
                    game.showNotification("Not enough corn cobs!");
                }
            }
        }
    }

    render(ctx, game) {
        // Merchant Sprite
        const sprite = game.sprites.getMerchantSprite(Math.floor(this.animTimer) % 2);
        if (sprite) {
            ctx.drawImage(sprite, this.x - 18, this.y - 18);
        }

        // Shop stall counter
        ctx.fillStyle = '#7f5539';
        ctx.fillRect(this.x - 30, this.y + 14, 60, 10);
        ctx.fillStyle = '#b08968';
        ctx.fillRect(this.x - 28, this.y + 16, 56, 4);

        // Render Wares
        for (const ware of this.wares) {
            // Pedestal pad
            ctx.fillStyle = '#495057';
            ctx.beginPath();
            ctx.ellipse(ware.x, ware.y + 10, 14, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Item / Pickup Icon
            if (ware.type === 'pickup') {
                const iconName = (ware.pickupType === 'apple') ? 'apple' :
                                 ((ware.pickupType === 'shield') ? 'mud_ball' : 'key_gold');
                const icon = game.sprites.getItemIcon(iconName);
                if (icon) ctx.drawImage(icon, ware.x - 12, ware.y - 12);
            } else if (ware.type === 'item') {
                const icon = game.sprites.getItemIcon(ware.itemData.icon || 'apple');
                if (icon) ctx.drawImage(icon, ware.x - 12, ware.y - 12);
            }

            // Price tag
            ctx.fillStyle = '#ffd166';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${ware.price}c`, ware.x, ware.y + 24);
        }
    }
}

// ============================================================================
// PICKUPS & ITEM PEDESTALS
// ============================================================================
class Pickup {
    constructor(x, y, type, config = {}) {
        this.x = x;
        this.y = y;
        this.type = type; // 'apple', 'shield', 'coin', 'bomb', 'key', 'pedestal', 'exit_trapdoor'
        this.config = config; // for pedestal itemData
        this.animTimer = Math.random() * 5;
        this.isDead = false;
    }

    update(dt, game) {
        this.animTimer += dt * 4;
        const p = game.player;
        const dist = Math.hypot(p.x - this.x, p.y - this.y);

        if (dist < 22 && !this.isDead) {
            if (this.type === 'coin') {
                p.coins += 1;
                if (game.sound) game.sound.playCoin();
                this.isDead = true;
            } else if (this.type === 'apple') {
                if (p.hp < p.maxHp) {
                    p.hp = Math.min(p.maxHp, p.hp + 2);
                    if (game.sound) game.sound.playHealth();
                    this.isDead = true;
                }
            } else if (this.type === 'shield') {
                p.shields += 1;
                if (game.sound) game.sound.playHealth();
                this.isDead = true;
            } else if (this.type === 'bomb') {
                p.bombs += 1;
                if (game.sound) game.sound.playCoin();
                this.isDead = true;
            } else if (this.type === 'key') {
                p.keys += 1;
                if (game.sound) game.sound.playCoin();
                this.isDead = true;
            } else if (this.type === 'pedestal') {
                p.addItem(this.config.itemData, game);
                game.spawnParticles(this.x, this.y, '#ffd166', 20);
                this.isDead = true;
            } else if (this.type === 'exit_trapdoor') {
                game.advanceFloor();
                return;
            }

            if (this.isDead) {
                game.spawnParticles(this.x, this.y, '#ffd166', 8);
            }
        }
    }

    render(ctx, game) {
        if (this.isDead) return;
        const bob = Math.sin(this.animTimer) * 2;

        if (this.type === 'exit_trapdoor') {
            // Dark pit / ladder down
            ctx.fillStyle = '#0f0f14';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, 20, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5c3d2e';
            ctx.fillRect(this.x - 8, this.y - 10, 16, 20); // Wooden ladder
            return;
        }

        if (this.type === 'pedestal') {
            // Pedestal column
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(this.x - 12, this.y, 24, 18);
            ctx.fillStyle = '#adb5bd';
            ctx.fillRect(this.x - 14, this.y - 2, 28, 4);

            // Floating Item Icon
            const icon = game.sprites.getItemIcon(this.config.itemData.icon || 'apple');
            if (icon) {
                ctx.drawImage(icon, this.x - 12, this.y - 20 + bob);
            }

            // Proximity name tooltip
            const dist = Math.hypot(game.player.x - this.x, game.player.y - this.y);
            if (dist < 60) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(this.config.itemData.name, this.x, this.y - 28);
                ctx.fillStyle = '#adb5bd';
                ctx.font = '10px monospace';
                ctx.fillText(this.config.itemData.desc, this.x, this.y - 16);
            }
            return;
        }

        // Standard Pickups
        const iconName = (this.type === 'apple') ? 'apple' :
                         (this.type === 'shield') ? 'mud_ball' :
                         (this.type === 'coin') ? 'corn' :
                         (this.type === 'bomb') ? 'tnt_bucket' : 'key_gold';
        const icon = game.sprites.getItemIcon(iconName);
        if (icon) {
            ctx.drawImage(icon, this.x - 12, this.y - 12 + bob);
        }
    }
}

if (typeof window !== 'undefined') {
    window.Projectile = Projectile;
    window.Player = Player;
    window.Enemy = Enemy;
    window.Merchant = Merchant;
    window.Pickup = Pickup;
}
