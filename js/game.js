// ============================================================================
// OINK OF ISAAC: BARNYARD BREAKOUT - CORE GAME ENGINE
// Main game loop, room rendering, collisions, camera transitions, UI & HUD,
// particles, and state management.
// ============================================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Managers
        this.sprites = new SpriteManager();
        this.sound = new SoundManager();

        // State
        this.state = 'TITLE'; // 'TITLE', 'PLAYING', 'PAUSED', 'GAMEOVER', 'VICTORY'
        this.floorNumber = 1;
        this.maxFloors = 3;

        this.player = null;
        this.dungeon = null;
        this.currentRoom = null;
        this.projectiles = [];
        this.bombs = []; // Placed apple bombs
        this.particles = [];
        this.floatingTexts = [];

        // Screen Shake
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        // Banner notifications (Synergies / Floor transitions)
        this.banner = null; // { title, text, timer }
        this.notification = null; // { text, timer }

        // Stats tracking
        this.stats = {
            enemiesKilled: 0,
            itemsCollected: 0,
            roomsCleared: 0,
            startTime: Date.now()
        };

        // Inputs
        this.input = {
            keys: {},
            mouse: { x: 0, y: 0, down: false }
        };

        this.lastTime = performance.now();
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            this.input.keys[e.code] = true;
            this.sound.resume();

            if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                if (this.state === 'PLAYING') this.dropBomb();
            }

            if (e.code === 'Escape' || e.code === 'Tab') {
                e.preventDefault();
                if (this.state === 'PLAYING') {
                    this.state = 'PAUSED';
                    this.showCompendiumModal(true);
                } else if (this.state === 'PAUSED') {
                    this.state = 'PLAYING';
                    this.showCompendiumModal(false);
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });

        const updateMousePos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.input.mouse.x = (e.clientX - rect.left) * scaleX;
            this.input.mouse.y = (e.clientY - rect.top) * scaleY;
        };

        this.canvas.addEventListener('mousemove', updateMousePos);
        this.canvas.addEventListener('mousedown', (e) => {
            this.sound.resume();
            updateMousePos(e);
            if (e.button === 0) this.input.mouse.down = true;
        });
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.input.mouse.down = false;
        });
    }

    startNewGame() {
        this.sound.init();
        this.sound.resume();

        this.floorNumber = 1;
        this.player = new Player(400, 300);
        this.stats = {
            enemiesKilled: 0,
            itemsCollected: 0,
            roomsCleared: 0,
            startTime: Date.now()
        };

        this.loadFloor(this.floorNumber);
        this.state = 'PLAYING';
        this.showBanner("FLOOR 1: THE MUD BARN", "Find items, survive predators, and escape!");
        this.sound.playBgm('barn');
    }

    loadFloor(floorNum) {
        this.floorNumber = floorNum;
        this.dungeon = new Dungeon(floorNum);
        this.dungeon.populateAllRooms(this);
        this.currentRoom = this.dungeon.startRoom;
        this.currentRoom.visited = true;
        this.currentRoom.cleared = true;

        this.player.x = 400;
        this.player.y = 300;
        this.projectiles = [];
        this.bombs = [];
        this.particles = [];
        this.floatingTexts = [];

        const bgmTrack = (floorNum === 1) ? 'barn' : ((floorNum === 2) ? 'field' : 'boss');
        this.sound.playBgm(bgmTrack);
    }

    advanceFloor() {
        if (this.floorNumber >= this.maxFloors) {
            this.onGameVictory();
            return;
        }

        this.floorNumber++;
        const titles = {
            2: "FLOOR 2: THE HAUNTED CORNFIELD",
            3: "FLOOR 3: THE SLAUGHTERHOUSE"
        };
        this.showBanner(titles[this.floorNumber], "The predators are growing hungrier...");
        this.loadFloor(this.floorNumber);
    }

    dropBomb() {
        if (this.player.bombs > 0) {
            this.player.bombs--;
            this.bombs.push({
                x: this.player.x,
                y: this.player.y,
                timer: 1.8,
                maxTimer: 1.8
            });
            if (this.sound) this.sound.playTrap();
        } else {
            this.showNotification("No apple bombs left!");
        }
    }

    createExplosion(x, y, radius, damage, owner = 'player') {
        if (this.sound) this.sound.playExplosion();
        this.triggerShake(0.3, 8);
        this.spawnParticles(x, y, '#ff5400', 30);
        this.spawnParticles(x, y, '#ffd166', 20);

        // Damage enemies
        if (this.currentRoom) {
            for (const enemy of this.currentRoom.enemies) {
                if (!enemy.isDead) {
                    const d = Math.hypot(enemy.x - x, enemy.y - y);
                    if (d < radius + enemy.width / 2) {
                        enemy.takeDamage(damage * 3, 'explosion', this);
                    }
                }
            }

            // Damage player if inside blast
            if (owner === 'enemy' || owner === 'player') {
                const pDist = Math.hypot(this.player.x - x, this.player.y - y);
                if (pDist < radius + this.player.width / 2) {
                    this.player.takeDamage(1, 'explosion', this);
                }
            }

            // Destroy rocks
            for (const obs of this.currentRoom.obstacles) {
                if (!obs.destroyed && (obs.type === 'rock' || obs.type === 'hay_bale')) {
                    if (Math.hypot(obs.x + 16 - x, obs.y + 16 - y) < radius + 16) {
                        obs.destroyed = true;
                        this.spawnParticles(obs.x + 16, obs.y + 16, '#6c757d', 12);
                    }
                }
            }
        }
    }

    triggerShake(duration, intensity) {
        this.shakeTimer = duration;
        this.shakeIntensity = intensity;
    }

    showBanner(title, text) {
        this.banner = { title, text, timer: 3.5 };
    }

    showSynergyBanner(name, desc) {
        this.banner = {
            title: `★ SYNERGY: ${name} ★`,
            text: desc,
            timer: 4.5,
            isSynergy: true
        };
    }

    showNotification(text) {
        this.notification = { text, timer: 2.0 };
    }

    spawnParticles(x, y, color, count = 10, speed = 80) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 0.7 + 0.3) * speed;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color,
                life: Math.random() * 0.4 + 0.2,
                maxLife: 0.5,
                size: Math.random() * 3 + 2
            });
        }
    }

    spawnDamageNumber(x, y, text) {
        this.floatingTexts.push({
            x: x + (Math.random() * 16 - 8),
            y,
            text: `-${typeof text === 'number' ? text.toFixed(1) : text}`,
            timer: 0.8
        });
    }

    onBossDefeated(boss) {
        this.triggerShake(0.8, 14);

        if (this.floorNumber === 3) {
            // Final Boss defeated!
            setTimeout(() => {
                this.onGameVictory();
            }, 2500);
        } else {
            // Spawn Exit Trapdoor & Boss Pedestal Item
            this.currentRoom.pickups.push(new Pickup(400, 300, 'exit_trapdoor'));

            const available = window.PIG_ITEMS.filter(it => !this.player.itemIds.has(it.id));
            if (available.length > 0) {
                const item = available[Math.floor(Math.random() * available.length)];
                this.currentRoom.pickups.push(new Pickup(400, 220, 'pedestal', { itemData: item }));
            }

            this.showNotification("Boss Defeated! Escape path unlocked!");
        }
    }

    onPlayerDeath() {
        this.state = 'GAMEOVER';
        this.sound.stopBgm();
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            document.getElementById('deathStats').innerHTML = `
                Rooms Cleared: <b>${this.stats.roomsCleared}</b><br>
                Predators Hunted: <b>${this.stats.enemiesKilled}</b><br>
                Items Found: <b>${this.player.items.length}</b><br>
                Floor Reached: <b>Floor ${this.floorNumber}</b>
            `;
            gameOverScreen.classList.remove('hidden');
        }
    }

    onGameVictory() {
        this.state = 'VICTORY';
        this.sound.stopBgm();
        if (this.sound) this.sound.playSynergyJingle();
        const victoryScreen = document.getElementById('victoryScreen');
        if (victoryScreen) {
            document.getElementById('victoryStats').innerHTML = `
                You broke through the farm gates and led all the animals to sweet freedom!<br><br>
                Predators Vanquished: <b>${this.stats.enemiesKilled}</b><br>
                Items Gathered: <b>${this.player.items.length}</b><br>
                Synergies Discovered: <b>${this.player.synergies.size}</b>
            `;
            victoryScreen.classList.remove('hidden');
        }
    }

    // ========================================================================
    // UPDATE LOOP
    // ========================================================================
    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Screen shake decay
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        // Banners
        if (this.banner) {
            this.banner.timer -= dt;
            if (this.banner.timer <= 0) this.banner = null;
        }
        if (this.notification) {
            this.notification.timer -= dt;
            if (this.notification.timer <= 0) this.notification = null;
        }

        // Update Player
        this.player.update(dt, this.input, this);

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt, this);
            if (p.isDead) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update Bombs
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const b = this.bombs[i];
            b.timer -= dt;
            if (b.timer <= 0) {
                this.createExplosion(b.x, b.y, 80, 8, 'player');
                this.bombs.splice(i, 1);
            }
        }

        // Update Room Entities
        if (this.currentRoom) {
            // Traps
            for (const trap of this.currentRoom.traps) {
                trap.update(dt, this);
            }

            // Enemies
            let aliveCount = 0;
            for (let i = this.currentRoom.enemies.length - 1; i >= 0; i--) {
                const e = this.currentRoom.enemies[i];
                e.update(dt, this);
                if (!e.isDead) {
                    aliveCount++;
                } else {
                    this.stats.enemiesKilled++;
                    this.currentRoom.enemies.splice(i, 1);
                }
            }

            // Check Room Clearance
            if (!this.currentRoom.cleared && aliveCount === 0) {
                this.currentRoom.cleared = true;
                this.stats.roomsCleared++;
                if (this.sound) this.sound.playDoor();

                // Active item charge
                if (this.player.activeItem) {
                    this.player.activeCharges = Math.min(this.player.activeItem.maxCharges, this.player.activeCharges + 1);
                }

                // Truffle Trowel dig reward
                if (this.player.hasEffect('roomDig') && Math.random() < 0.6) {
                    this.currentRoom.pickups.push(new Pickup(400, 300, 'coin'));
                }

                // Room clear reward drop
                if (this.currentRoom.type === 'combat') {
                    if (Math.random() < 0.7) {
                        const roll = Math.random();
                        const rType = (roll < 0.5) ? 'coin' : ((roll < 0.8) ? 'apple' : 'bomb');
                        this.currentRoom.pickups.push(new Pickup(400, 300, rType));
                    }
                }
            }

            // Merchant
            if (this.currentRoom.merchant) {
                this.currentRoom.merchant.update(dt, this);
            }

            // Pickups
            for (let i = this.currentRoom.pickups.length - 1; i >= 0; i--) {
                const pick = this.currentRoom.pickups[i];
                pick.update(dt, this);
                if (pick.isDead) {
                    this.currentRoom.pickups.splice(i, 1);
                }
            }

            // Obstacle collisions with Player
            for (const obs of this.currentRoom.obstacles) {
                if (!obs.destroyed && (obs.type === 'rock' || obs.type === 'hay_bale')) {
                    if (!this.player.hasEffect('flying')) {
                        const dist = Math.hypot(this.player.x - (obs.x + 16), this.player.y - (obs.y + 16));
                        if (dist < 26) {
                            const angle = Math.atan2(this.player.y - (obs.y + 16), this.player.x - (obs.x + 16));
                            this.player.x = (obs.x + 16) + Math.cos(angle) * 26;
                            this.player.y = (obs.y + 16) + Math.sin(angle) * 26;
                        }
                    }
                }
            }

            // Projectile-Enemy Collisions
            for (const p of this.projectiles) {
                if (p.owner === 'player' && !p.isDead) {
                    for (const e of this.currentRoom.enemies) {
                        if (!e.isDead && !e.isInvulnerable) {
                            const d = Math.hypot(p.x - e.x, p.y - e.y);
                            if (d < p.radius + e.width / 2) {
                                e.takeDamage(p.damage, 'projectile', this);

                                // Projectile on-hit effects
                                if (p.effects.slowing) e.slowFactor = 0.5;
                                if (p.effects.burning) e.takeDamage(p.damage * 0.4, 'fire', this);
                                if (p.effects.poison) e.takeDamage(p.damage * 0.3, 'poison', this);
                                if (p.effects.chainLightning) {
                                    // Arc to nearest other enemy
                                    for (const other of this.currentRoom.enemies) {
                                        if (other !== e && !other.isDead) {
                                            if (Math.hypot(other.x - e.x, other.y - e.y) < 140) {
                                                other.takeDamage(p.damage * 0.8, 'chain', this);
                                                this.spawnParticles(other.x, other.y, '#ffd166', 8);
                                            }
                                        }
                                    }
                                }

                                if (p.pierceLeft > 0) {
                                    p.pierceLeft--;
                                } else {
                                    p.destroy(this);
                                    break;
                                }
                            }
                        }
                    }
                } else if (p.owner === 'enemy' && !p.isDead) {
                    // Enemy projectile hitting player
                    const d = Math.hypot(p.x - this.player.x, p.y - this.player.y);
                    if (d < p.radius + this.player.width / 2) {
                        this.player.takeDamage(p.damage, 'enemy_projectile', this);
                        p.destroy(this);
                    }
                }
            }

            // Check Doorway Walk-Through
            if (this.currentRoom.cleared) {
                this.checkDoorTransitions();
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.life -= dt;
            if (pt.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= dt * 25;
            ft.timer -= dt;
            if (ft.timer <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    checkDoorTransitions() {
        const p = this.player;
        const doors = this.currentRoom.doors;

        // North Door
        if (doors.north && p.y <= 42 && p.x >= 350 && p.x <= 450) {
            this.transitionRoom(doors.north, 400, 500);
        }
        // South Door
        else if (doors.south && p.y >= 558 && p.x >= 350 && p.x <= 450) {
            this.transitionRoom(doors.south, 400, 100);
        }
        // West Door
        else if (doors.west && p.x <= 42 && p.y >= 250 && p.y <= 350) {
            this.transitionRoom(doors.west, 700, 300);
        }
        // East Door
        else if (doors.east && p.x >= 758 && p.y >= 250 && p.y <= 350) {
            this.transitionRoom(doors.east, 100, 300);
        }
    }

    transitionRoom(newRoom, targetX, targetY) {
        this.currentRoom = newRoom;
        this.currentRoom.visited = true;
        this.player.x = targetX;
        this.player.y = targetY;
        this.projectiles = [];
        this.bombs = [];

        // Cowbell stun on room entry
        if (!this.currentRoom.cleared && this.player.hasEffect('roomStun')) {
            for (const e of this.currentRoom.enemies) {
                e.immobilize(2.0);
            }
        }

        if (this.sound) this.sound.playDoor();
    }

    // ========================================================================
    // RENDER LOOP
    // ========================================================================
    render() {
        this.ctx.save();

        // Screen Shake
        if (this.shakeTimer > 0) {
            const rx = (Math.random() * 2 - 1) * this.shakeIntensity;
            const ry = (Math.random() * 2 - 1) * this.shakeIntensity;
            this.ctx.translate(rx, ry);
        }

        // Draw Room Base Tiles
        this.renderRoomTiles();

        // Draw Room Traps
        if (this.currentRoom) {
            for (const trap of this.currentRoom.traps) {
                trap.render(this.ctx, this);
            }

            // Draw Obstacles
            for (const obs of this.currentRoom.obstacles) {
                if (!obs.destroyed) {
                    const sprite = this.sprites.getTile(obs.type, 0);
                    if (sprite) this.ctx.drawImage(sprite, obs.x, obs.y);
                }
            }

            // Draw Merchant
            if (this.currentRoom.merchant) {
                this.currentRoom.merchant.render(this.ctx, this);
            }

            // Draw Pickups & Pedestals
            for (const pick of this.currentRoom.pickups) {
                pick.render(this.ctx, this);
            }

            // Draw Enemies
            for (const e of this.currentRoom.enemies) {
                e.render(this.ctx, this);
            }
        }

        // Draw Bombs
        for (const b of this.bombs) {
            const bob = Math.sin(b.timer * 12) * 2;
            const icon = this.sprites.getItemIcon('tnt_bucket');
            if (icon) this.ctx.drawImage(icon, b.x - 12, b.y - 12 + bob);
        }

        // Draw Player
        if (this.player) {
            this.player.render(this.ctx, this);
        }

        // Draw Projectiles
        for (const p of this.projectiles) {
            p.render(this.ctx);
        }

        // Draw Particles
        for (const pt of this.particles) {
            this.ctx.fillStyle = pt.color;
            this.ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        }

        // Floating texts
        for (const ft of this.floatingTexts) {
            this.ctx.fillStyle = '#ff4d6d';
            this.ctx.font = 'bold 12px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(ft.text, ft.x, ft.y);
        }

        // Draw Room Doors
        this.renderDoors();

        this.ctx.restore();

        // Render HUD Overlay
        this.renderHUD();
    }

    renderRoomTiles() {
        const floorType = (this.floorNumber === 1) ? 'barn' : ((this.floorNumber === 2) ? 'field' : 'silo');
        const floorTileName = `${floorType}_floor`;
        const wallTileName = `${floorType}_wall`;

        // Floor
        for (let x = 32; x < 768; x += 32) {
            for (let y = 32; y < 568; y += 32) {
                const sprite = this.sprites.getTile(floorTileName, (x + y) % 2);
                if (sprite) this.ctx.drawImage(sprite, x, y);
            }
        }

        // Walls (Borders)
        for (let x = 0; x < 800; x += 32) {
            const topWall = this.sprites.getTile(wallTileName, 0);
            if (topWall) {
                this.ctx.drawImage(topWall, x, 0);
                this.ctx.drawImage(topWall, x, 568);
            }
        }
        for (let y = 32; y < 568; y += 32) {
            const sideWall = this.sprites.getTile(wallTileName, 0);
            if (sideWall) {
                this.ctx.drawImage(sideWall, 0, y);
                this.ctx.drawImage(sideWall, 768, y);
            }
        }
    }

    renderDoors() {
        if (!this.currentRoom) return;
        const doors = this.currentRoom.doors;
        const isOpen = this.currentRoom.cleared;

        const drawDoor = (x, y, targetRoom) => {
            if (!targetRoom) return;
            const sprite = this.sprites.getDoorSprite(targetRoom.type, isOpen);
            if (sprite) this.ctx.drawImage(sprite, x, y);
        };

        // North Door (top center)
        if (doors.north) drawDoor(384, 0, doors.north);
        // South Door (bottom center)
        if (doors.south) drawDoor(384, 568, doors.south);
        // West Door (left center)
        if (doors.west) drawDoor(0, 284, doors.west);
        // East Door (right center)
        if (doors.east) drawDoor(768, 284, doors.east);
    }

    renderHUD() {
        if (!this.player) return;

        // Top Left: Hearts & Mud Shields
        const maxHearts = Math.ceil(this.player.maxHp / 2);
        const curHp = this.player.hp;

        for (let i = 0; i < maxHearts; i++) {
            const hx = 24 + i * 22;
            const hy = 24;
            const icon = this.sprites.getItemIcon('apple');

            if (curHp >= (i + 1) * 2) {
                // Full heart
                if (icon) this.ctx.drawImage(icon, hx, hy, 20, 20);
            } else if (curHp === i * 2 + 1) {
                // Half heart
                if (icon) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.rect(hx, hy, 10, 20);
                    this.ctx.clip();
                    this.ctx.drawImage(icon, hx, hy, 20, 20);
                    this.ctx.restore();
                }
            } else {
                // Empty heart container
                this.ctx.strokeStyle = '#495057';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(hx + 2, hy + 2, 16, 16);
            }
        }

        // Shields (Mud Armor)
        for (let i = 0; i < this.player.shields; i++) {
            const sx = 24 + (maxHearts + i) * 22;
            const sy = 24;
            const sIcon = this.sprites.getItemIcon('mud_ball');
            if (sIcon) this.ctx.drawImage(sIcon, sx, sy, 20, 20);
        }

        // Consumables: Corn (Coins), Bombs, Keys
        const cy = 52;
        this.ctx.font = 'bold 13px monospace';
        this.ctx.fillStyle = '#ffd166';

        // Coin
        const coinIcon = this.sprites.getItemIcon('corn');
        if (coinIcon) this.ctx.drawImage(coinIcon, 24, cy - 2, 16, 16);
        this.ctx.fillText(`${this.player.coins}`, 44, cy + 10);

        // Bomb
        const bombIcon = this.sprites.getItemIcon('tnt_bucket');
        if (bombIcon) this.ctx.drawImage(bombIcon, 84, cy - 2, 16, 16);
        this.ctx.fillText(`${this.player.bombs}`, 104, cy + 10);

        // Key
        const keyIcon = this.sprites.getItemIcon('key_gold');
        if (keyIcon) this.ctx.drawImage(keyIcon, 144, cy - 2, 16, 16);
        this.ctx.fillText(`${this.player.keys}`, 164, cy + 10);

        // Active Item Slot (top left below consumables)
        if (this.player.activeItem) {
            const ax = 24, ay = 76;
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(ax, ay, 36, 36);
            this.ctx.strokeStyle = '#adb5bd';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(ax, ay, 36, 36);

            const aIcon = this.sprites.getItemIcon(this.player.activeItem.icon);
            if (aIcon) this.ctx.drawImage(aIcon, ax + 6, ay + 6, 24, 24);

            // Charge bars
            const chargePercent = this.player.activeCharges / this.player.activeItem.maxCharges;
            this.ctx.fillStyle = (chargePercent >= 1.0) ? '#55a630' : '#ffb703';
            this.ctx.fillRect(ax + 2, ay + 38, Math.floor(32 * chargePercent), 4);
        }

        // Top Right: Minimap
        this.renderMinimap();

        // Floor Boss Health Bar (if in boss room)
        if (this.currentRoom && this.currentRoom.type === 'boss') {
            const boss = this.currentRoom.enemies.find(e => e.isBoss);
            if (boss && !boss.isDead) {
                const bw = 340, bh = 14;
                const bx = (this.width - bw) / 2;
                const by = this.height - 38;

                this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                this.ctx.fillRect(bx - 4, by - 16, bw + 8, bh + 22);

                const bossNames = {
                    1: "FANG - THE ALPHA WOLFPACK LEADER",
                    2: "SKY-TERROR - THE APEX HAWK",
                    3: "FARMER GRIMM - THE BUTCHER"
                };
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 11px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(bossNames[this.floorNumber] || "BOSS", this.width / 2, by - 4);

                // Health bar fill
                this.ctx.fillStyle = '#d90429';
                const fillW = Math.max(0, (boss.hp / boss.maxHp) * bw);
                this.ctx.fillRect(bx, by, fillW, bh);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.strokeRect(bx, by, bw, bh);
            }
        }

        // Banner Toast Popup
        if (this.banner) {
            this.ctx.fillStyle = this.banner.isSynergy ? 'rgba(131, 56, 236, 0.9)' : 'rgba(20, 20, 25, 0.85)';
            this.ctx.fillRect(160, 100, 480, 56);
            this.ctx.strokeStyle = this.banner.isSynergy ? '#ffd166' : '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(160, 100, 480, 56);

            this.ctx.fillStyle = '#ffd166';
            this.ctx.font = 'bold 14px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.banner.title, 400, 122);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '11px monospace';
            this.ctx.fillText(this.banner.text, 400, 142);
        }

        // Notification message
        if (this.notification) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
            this.ctx.fillRect(260, 460, 280, 26);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '11px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.notification.text, 400, 477);
        }
    }

    renderMinimap() {
        if (!this.dungeon) return;
        const mapSize = 90;
        const ox = this.width - mapSize - 20;
        const oy = 20;
        const cell = 12;

        this.ctx.fillStyle = 'rgba(20, 20, 25, 0.7)';
        this.ctx.fillRect(ox, oy, mapSize, mapSize);
        this.ctx.strokeStyle = '#495057';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(ox, oy, mapSize, mapSize);

        for (const r of this.dungeon.rooms) {
            if (r.visited || this.player.hasEffect('revealSecrets')) {
                const rx = ox + r.gridX * cell + 3;
                const ry = oy + r.gridY * cell + 3;

                // Color by room type
                let color = '#6c757d';
                if (r === this.currentRoom) color = '#ffffff';
                else if (r.type === 'boss') color = '#d90429';
                else if (r.type === 'treasure') color = '#ffd166';
                else if (r.type === 'shop') color = '#00b4d8';

                this.ctx.fillStyle = color;
                this.ctx.fillRect(rx, ry, cell - 2, cell - 2);
            }
        }
    }

    showCompendiumModal(show) {
        const modal = document.getElementById('compendiumModal');
        if (!modal) return;
        if (show) {
            modal.classList.remove('hidden');
            this.populateCompendium();
        } else {
            modal.classList.add('hidden');
        }
    }

    populateCompendium() {
        const grid = document.getElementById('itemsGrid');
        const synergiesList = document.getElementById('synergiesList');
        if (!grid || !synergiesList) return;

        // Populate 55 Items
        grid.innerHTML = '';
        for (const it of window.PIG_ITEMS) {
            const hasIt = this.player.itemIds.has(it.id);
            const card = document.createElement('div');
            card.className = `item-card ${hasIt ? 'collected' : 'uncollected'}`;
            card.innerHTML = `
                <div class="item-name">${hasIt ? it.name : '???'}</div>
                <div class="item-desc">${hasIt ? it.desc : 'Discover this farm contraband'}</div>
                <div class="item-tag">${it.rarity.toUpperCase()}</div>
            `;
            grid.appendChild(card);
        }

        // Populate Synergies
        synergiesList.innerHTML = '';
        for (const syn of window.PIG_SYNERGIES) {
            const isUnlocked = this.player.synergies.has(syn.id);
            const reqNames = syn.required.map(id => {
                const found = window.PIG_ITEMS.find(x => x.id === id);
                return found ? found.name : id;
            }).join(' + ');

            const row = document.createElement('div');
            row.className = `synergy-row ${isUnlocked ? 'unlocked' : 'locked'}`;
            row.innerHTML = `
                <div class="synergy-title">${isUnlocked ? '★ ' + syn.name : '??? (Undiscovered Synergy)'}</div>
                <div class="synergy-req">Recipe: ${reqNames}</div>
                <div class="synergy-effect">${isUnlocked ? syn.desc : 'Combine these two farm items to synthesize new power!'}</div>
            `;
            synergiesList.appendChild(row);
        }
    }

    // ========================================================================
    // MAIN LOOP
    // ========================================================================
    loop(currentTime) {
        const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    init() {
        requestAnimationFrame((t) => {
            this.lastTime = t;
            this.loop(t);
        });
    }
}

if (typeof window !== 'undefined') {
    window.Game = Game;
}
