// ============================================================================
// OINK OF ISAAC: BARNYARD BREAKOUT - DUNGEON & LEVEL GENERATOR
// Procedural room generation on a grid with doors, room types (Combat, Treasure,
// Shop, Boss, Secret), obstacles, traps, and floor progression.
// ============================================================================

class Room {
    constructor(gridX, gridY, type = 'combat', floorNumber = 1) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type; // 'start', 'combat', 'treasure', 'shop', 'boss', 'secret'
        this.floorNumber = floorNumber;

        this.doors = { north: null, south: null, east: null, west: null };
        this.enemies = [];
        this.traps = [];
        this.pickups = [];
        this.obstacles = [];
        this.merchant = null;

        this.cleared = (type === 'start' || type === 'treasure' || type === 'shop' || type === 'secret');
        this.visited = false;
    }

    populate(game) {
        if (this.type === 'start') {
            // Safe starting room
            return;
        }

        if (this.type === 'treasure') {
            // Free item pedestal!
            const available = window.PIG_ITEMS.filter(it => !game.player.itemIds.has(it.id));
            const item = available[Math.floor(Math.random() * available.length)] || window.PIG_ITEMS[0];
            this.pickups.push(new Pickup(400, 300, 'pedestal', { itemData: item }));
            return;
        }

        if (this.type === 'shop') {
            // Merchant NPC
            this.merchant = new Merchant(400, 220);
            this.merchant.setupWares(game);
            return;
        }

        if (this.type === 'boss') {
            // Floor Boss
            let bossType = 'boss_wolf';
            if (this.floorNumber === 2) bossType = 'boss_hawk';
            if (this.floorNumber === 3) bossType = 'boss_farmer';

            const hp = (this.floorNumber === 1) ? 140 : ((this.floorNumber === 2) ? 240 : 420);
            this.enemies.push(new Enemy(400, 260, bossType, { isBoss: true, maxHp: hp }));
            return;
        }

        if (this.type === 'combat') {
            // Spawn obstacles (rocks / hay bales)
            const obsCount = Math.floor(Math.random() * 5) + 3;
            for (let i = 0; i < obsCount; i++) {
                const ox = 120 + Math.floor(Math.random() * 18) * 32;
                const oy = 120 + Math.floor(Math.random() * 11) * 32;

                // Avoid center & avoid blocking doors
                if (Math.hypot(ox - 400, oy - 300) < 80) continue;
                if (Math.abs(ox - 400) < 64 && (oy < 150 || oy > 450)) continue;
                if (Math.abs(oy - 300) < 64 && (ox < 150 || ox > 650)) continue;

                const obsType = (this.floorNumber === 1) ? 'hay_bale' : 'rock';
                this.obstacles.push({ x: ox, y: oy, type: obsType });
            }

            // Spawn Traps
            const trapCount = Math.floor(Math.random() * 4) + 1;
            for (let i = 0; i < trapCount; i++) {
                const tx = 140 + Math.floor(Math.random() * 16) * 32;
                const ty = 140 + Math.floor(Math.random() * 9) * 32;

                // Avoid doorway thresholds
                if (Math.abs(tx - 400) < 64 && (ty < 150 || ty > 450)) continue;
                if (Math.abs(ty - 300) < 64 && (tx < 150 || tx > 650)) continue;

                let trapType = 'pitchfork_spikes';
                if (this.floorNumber === 1) {
                    trapType = (Math.random() < 0.5) ? 'pitchfork_spikes' : 'mud_pit';
                } else if (this.floorNumber === 2) {
                    trapType = (Math.random() < 0.5) ? 'bear_trap' : 'electric_fence';
                } else {
                    trapType = (Math.random() < 0.5) ? 'threshing_saw' : 'bear_trap';
                }

                this.traps.push(new Trap(tx, ty, trapType, {
                    axis: (Math.random() < 0.5 ? 'x' : 'y'),
                    span: 140
                }));
            }

            // Spawn Animal Predators
            const enemyCount = Math.floor(Math.random() * 3) + 2 + this.floorNumber;
            const enemyTypesByFloor = {
                1: ['wolf', 'fox', 'wolf'],
                2: ['fox', 'coyote', 'hawk', 'alpha_wolf'],
                3: ['alpha_wolf', 'badger', 'hound', 'coyote', 'hawk']
            };
            const types = enemyTypesByFloor[this.floorNumber] || ['wolf'];

            for (let i = 0; i < enemyCount; i++) {
                const ex = 120 + Math.random() * 560;
                const ey = 120 + Math.random() * 360;
                // Avoid right next to doors
                const selectedType = types[Math.floor(Math.random() * types.length)];
                const enemyHp = 10 + (this.floorNumber * 6);
                this.enemies.push(new Enemy(ex, ey, selectedType, { maxHp: enemyHp }));
            }
        }
    }
}

class Dungeon {
    constructor(floorNumber = 1) {
        this.floorNumber = floorNumber;
        this.gridSize = 7; // 7x7 grid
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
        this.rooms = [];
        this.startRoom = null;
        this.bossRoom = null;
        this.itemRoom = null;
        this.shopRoom = null;

        this.generate();
    }

    generate() {
        const startX = 3;
        const startY = 3;
        this.startRoom = new Room(startX, startY, 'start', this.floorNumber);
        this.grid[startX][startY] = this.startRoom;
        this.rooms.push(this.startRoom);

        // Queue for BFS-like dungeon room growth
        const targetRooms = 8 + this.floorNumber * 3; // 11 to 17 rooms
        const queue = [{ x: startX, y: startY }];
        const dirs = [
            { name: 'north', opp: 'south', dx: 0, dy: -1 },
            { name: 'south', opp: 'north', dx: 0, dy: 1 },
            { name: 'east',  opp: 'west',  dx: 1, dy: 0 },
            { name: 'west',  opp: 'east',  dx: -1, dy: 0 }
        ];

        while (queue.length > 0 && this.rooms.length < targetRooms) {
            const cur = queue.shift();
            const curRoom = this.grid[cur.x][cur.y];

            // Shuffle directions
            const shuffledDirs = [...dirs].sort(() => Math.random() - 0.5);

            for (const d of shuffledDirs) {
                const nx = cur.x + d.dx;
                const ny = cur.y + d.dy;

                if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                    if (!this.grid[nx][ny] && this.rooms.length < targetRooms) {
                        // Count neighbors to keep maze layout clean
                        let neighbors = 0;
                        for (const check of dirs) {
                            const cx = nx + check.dx;
                            const cy = ny + check.dy;
                            if (cx >= 0 && cx < this.gridSize && cy >= 0 && cy < this.gridSize && this.grid[cx][cy]) {
                                neighbors++;
                            }
                        }

                        if (neighbors <= 2 && Math.random() < 0.65) {
                            const newRoom = new Room(nx, ny, 'combat', this.floorNumber);
                            this.grid[nx][ny] = newRoom;
                            this.rooms.push(newRoom);

                            // Connect doors
                            curRoom.doors[d.name] = newRoom;
                            newRoom.doors[d.opp] = curRoom;

                            queue.push({ x: nx, y: ny });
                        }
                    } else if (this.grid[nx][ny]) {
                        // Chance to link existing rooms
                        if (Math.random() < 0.25) {
                            curRoom.doors[d.name] = this.grid[nx][ny];
                            this.grid[nx][ny].doors[d.opp] = curRoom;
                        }
                    }
                }
            }
        }

        // Assign special rooms: Boss, Treasure, Shop
        // Find dead ends (rooms with only 1 door connection, farthest from start)
        const candidates = this.rooms.filter(r => r !== this.startRoom);
        candidates.sort((a, b) => {
            const distA = Math.hypot(a.gridX - startX, a.gridY - startY);
            const distB = Math.hypot(b.gridX - startX, b.gridY - startY);
            return distB - distA; // Descending by distance
        });

        // 1. Boss Room (farthest)
        if (candidates.length > 0) {
            this.bossRoom = candidates[0];
            this.bossRoom.type = 'boss';
        }

        // 2. Treasure Room
        if (candidates.length > 1) {
            this.itemRoom = candidates[1];
            this.itemRoom.type = 'treasure';
        }

        // 3. Shop Room
        if (candidates.length > 2) {
            this.shopRoom = candidates[2];
            this.shopRoom.type = 'shop';
        }
    }

    populateAllRooms(game) {
        for (const r of this.rooms) {
            r.populate(game);
        }
    }
}

if (typeof window !== 'undefined') {
    window.Room = Room;
    window.Dungeon = Dungeon;
}
