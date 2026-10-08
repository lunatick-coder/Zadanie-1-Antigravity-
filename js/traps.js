// ============================================================================
// OINK OF ISAAC: BARNYARD BREAKOUT - LEVEL TRAPS SYSTEM
// Interactive traps: Pitchfork Spikes, Bear Traps, Mud Pits, Electric Fences,
// and Threshing Saw Blades. Damages both players and unsuspecting predators!
// ============================================================================

class Trap {
    constructor(x, y, type, config = {}) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 32;
        this.height = 32;
        this.config = config;
        this.timer = 0;
        this.state = 0; // 0 = inactive/armed, 1 = active/damaging, 2 = triggered
        this.damage = config.damage || 1;
        this.cooldown = 0;
    }

    update(dt, game) {
        this.timer += dt;
        if (this.cooldown > 0) this.cooldown -= dt;

        if (this.type === 'pitchfork_spikes') {
            // Cycle: 2.2s safe, 0.5s warning, 1.5s lethal spikes
            const cycle = 4.2;
            const t = this.timer % cycle;
            if (t < 2.2) {
                this.state = 0; // retracted
            } else if (t < 2.7) {
                this.state = 0; // warning rumble
            } else {
                if (this.state === 0 && game.sound) {
                    // Just extended
                    // Subtle click
                }
                this.state = 1; // spikes UP
            }
        } else if (this.type === 'electric_fence') {
            // Cycle: 2s off, 1.5s arcing electricity
            const cycle = 3.5;
            this.state = (this.timer % cycle > 2.0) ? 1 : 0;
        } else if (this.type === 'threshing_saw') {
            // Moving back and forth along a track
            this.state = (this.state + dt * 15) % 100;
            const span = this.config.span || 120;
            const axis = this.config.axis || 'x';
            const speed = this.config.speed || 80;
            const offset = Math.sin(this.timer * (speed / 30)) * (span / 2);

            if (axis === 'x') {
                this.currentX = this.x + offset;
                this.currentY = this.y;
            } else {
                this.currentX = this.x;
                this.currentY = this.y + offset;
            }
            this.state = 1; // Always lethal on touch
        }

        // Check collisions with player and enemies
        this.checkCollisions(game);
    }

    getBounds() {
        const cx = (this.type === 'threshing_saw' && this.currentX !== undefined) ? this.currentX : this.x;
        const cy = (this.type === 'threshing_saw' && this.currentY !== undefined) ? this.currentY : this.y;
        return {
            x: cx + 4,
            y: cy + 4,
            w: this.width - 8,
            h: this.height - 8
        };
    }

    checkCollisions(game) {
        const bounds = this.getBounds();
        const p = game.player;

        // Player check
        if (p && !p.isDead && !p.isInvulnerable) {
            const pBounds = p.getBounds();
            if (this.overlaps(bounds, pBounds)) {
                this.onTrigger(p, true, game);
            }
        }

        // Enemies check (predators can also get hurt/trapped!)
        if (game.currentRoom && game.currentRoom.enemies) {
            for (const enemy of game.currentRoom.enemies) {
                if (!enemy.isDead) {
                    const eBounds = enemy.getBounds();
                    if (this.overlaps(bounds, eBounds)) {
                        this.onTrigger(enemy, false, game);
                    }
                }
            }
        }
    }

    overlaps(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }

    onTrigger(entity, isPlayer, game) {
        // Mud pit slow effect
        if (this.type === 'mud_pit') {
            if (isPlayer) {
                if (!entity.hasEffect('flying') && !entity.hasEffect('mudWalk')) {
                    entity.slowFactor = 0.45;
                }
            } else {
                if (!entity.isFlying) {
                    entity.slowFactor = 0.45;
                }
            }
            return;
        }

        // Bear trap
        if (this.type === 'bear_trap') {
            if (this.state === 0 && this.cooldown <= 0) {
                this.state = 1; // Snapped!
                this.cooldown = 6.0; // Resets after 6s
                if (game.sound) game.sound.playTrap();
                game.spawnParticles(this.x + 16, this.y + 16, '#adb5bd', 8);

                entity.immobilize(1.2);
                entity.takeDamage(1, 'bear_trap', game);
            }
            return;
        }

        // Pitchfork Spikes
        if (this.type === 'pitchfork_spikes') {
            if (this.state === 1 && this.cooldown <= 0) {
                if (isPlayer && (entity.hasEffect('flying') || entity.hasEffect('trapImmunity'))) {
                    return; // Flying or bouncy tail immunity
                }
                if (!isPlayer && entity.isFlying) return;

                this.cooldown = 0.8;
                entity.takeDamage(this.damage, 'pitchfork_spikes', game);
                if (game.sound) game.sound.playTrap();
                game.spawnParticles(this.x + 16, this.y + 16, '#e63946', 6);
            }
            return;
        }

        // Electric Fence
        if (this.type === 'electric_fence') {
            if (this.state === 1 && this.cooldown <= 0) {
                this.cooldown = 0.6;
                entity.takeDamage(this.damage, 'electric_fence', game);
                if (game.sound) game.sound.playShoot('lightning');
                game.spawnParticles(this.x + 16, this.y + 16, '#ffd166', 10);
            }
            return;
        }

        // Threshing Saw
        if (this.type === 'threshing_saw') {
            if (this.cooldown <= 0) {
                this.cooldown = 0.5;
                entity.takeDamage(this.damage, 'threshing_saw', game);
                if (game.sound) game.sound.playTrap();
                game.spawnParticles(this.currentX || this.x, this.currentY || this.y, '#e63946', 12);
            }
        }
    }

    render(ctx, game) {
        const renderX = (this.type === 'threshing_saw' && this.currentX !== undefined) ? this.currentX : this.x;
        const renderY = (this.type === 'threshing_saw' && this.currentY !== undefined) ? this.currentY : this.y;

        // Render saw blade track if saw
        if (this.type === 'threshing_saw') {
            ctx.fillStyle = '#212529';
            const span = this.config.span || 120;
            const axis = this.config.axis || 'x';
            if (axis === 'x') {
                ctx.fillRect(this.x - span / 2 + 14, this.y + 14, span, 4);
            } else {
                ctx.fillRect(this.x + 14, this.y - span / 2 + 14, 4, span);
            }
        }

        const sprite = game.sprites.getTrapSprite(this.type, Math.floor(this.state));
        if (sprite) {
            ctx.drawImage(sprite, renderX, renderY);
        }
    }
}

if (typeof window !== 'undefined') {
    window.Trap = Trap;
}
