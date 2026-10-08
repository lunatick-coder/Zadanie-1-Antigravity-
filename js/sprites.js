// ============================================================================
// OINK OF ISAAC: BARNYARD BREAKOUT - PIXEL ART SPRITE GENERATOR & CACHE
// Generates crisp, authentic 16-bit pixel art for characters, enemies, tiles,
// items, traps, and boss animations directly into cached offscreen canvases.
// ============================================================================

class SpriteManager {
    constructor() {
        this.cache = new Map();
        this.pixelScale = 2; // Internal scaling for crisp pixels
    }

    // Helper to create an offscreen canvas
    createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas: c, ctx: ctx };
    }

    // Draw pixel matrix from array of strings (color mapped)
    drawMatrix(ctx, matrix, colorMap, ox = 0, oy = 0, scale = 1) {
        for (let y = 0; y < matrix.length; y++) {
            const row = matrix[y];
            for (let x = 0; x < row.length; x++) {
                const char = row[x];
                if (char && char !== ' ' && char !== '.') {
                    const color = colorMap[char];
                    if (color) {
                        ctx.fillStyle = color;
                        ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale);
                    }
                }
            }
        }
    }

    // Retrieve or generate a cached sprite
    get(key, generator) {
        if (!this.cache.has(key)) {
            const sprite = generator();
            this.cache.set(key, sprite);
        }
        return this.cache.get(key);
    }

    // ========================================================================
    // PLAYER PIGLET SPRITES
    // ========================================================================
    getPigSprite(direction = 'down', frame = 0, accessories = {}) {
        const key = `pig_${direction}_${frame}_${JSON.stringify(accessories)}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(32, 32);

            // Palette
            const pinkLight = '#ffb3c6';
            const pinkBase = '#ff85a1';
            const pinkDark = '#e05780';
            const pinkShadow = '#b83b5e';
            const snoutHole = '#6a1b29';
            const white = '#ffffff';
            const black = '#1a1a24';
            const hoof = '#5a3d28';

            // Bobbing offset
            const bob = (frame % 2 === 1) ? 1 : 0;
            const legWalk = (frame % 2 === 1) ? 2 : 0;

            // Draw shadow beneath pig
            ctx.fillStyle = 'rgba(20, 10, 10, 0.35)';
            ctx.beginPath();
            ctx.ellipse(16, 28, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Mud Coat modifier
            const bodyColor = accessories.mudCoat ? '#8d5524' : (accessories.berserk ? '#e63946' : pinkBase);
            const lightColor = accessories.mudCoat ? '#b07d4b' : (accessories.berserk ? '#ff758f' : pinkLight);
            const darkColor = accessories.mudCoat ? '#5c3818' : (accessories.berserk ? '#9d0208' : pinkDark);

            // Back accessories (Wings)
            if (accessories.wings) {
                const wingFlap = (frame % 2 === 1) ? -2 : 0;
                ctx.fillStyle = '#f8f9fa';
                // Left wing
                ctx.fillRect(4, 10 + wingFlap, 5, 8);
                ctx.fillRect(2, 8 + wingFlap, 4, 6);
                // Right wing
                ctx.fillRect(23, 10 + wingFlap, 5, 8);
                ctx.fillRect(26, 8 + wingFlap, 4, 6);
                ctx.fillStyle = '#d0d7de';
                ctx.fillRect(5, 12 + wingFlap, 3, 5);
                ctx.fillRect(24, 12 + wingFlap, 3, 5);
            }

            // Hooves (Legs)
            ctx.fillStyle = hoof;
            if (direction === 'down' || direction === 'up') {
                ctx.fillRect(10, 24 - legWalk, 3, 5 + legWalk);
                ctx.fillRect(19, 24 + (legWalk ? -1 : 1), 3, 4 + (legWalk ? 1 : 0));
            } else if (direction === 'left') {
                ctx.fillRect(11 - legWalk, 24, 3, 5);
                ctx.fillRect(18 + legWalk, 24, 3, 5);
            } else if (direction === 'right') {
                ctx.fillRect(11 + legWalk, 24, 3, 5);
                ctx.fillRect(18 - legWalk, 24, 3, 5);
            }

            // Boots accessory
            if (accessories.boots) {
                ctx.fillStyle = '#ffb703';
                ctx.fillRect(9, 26, 5, 3);
                ctx.fillRect(18, 26, 5, 3);
            }

            // Body
            const by = 11 + bob;
            ctx.fillStyle = bodyColor;
            ctx.fillRect(8, by, 16, 14);
            ctx.fillRect(7, by + 2, 18, 10);

            // Shading & Highlights
            ctx.fillStyle = lightColor;
            ctx.fillRect(9, by + 1, 14, 3);
            ctx.fillStyle = darkColor;
            ctx.fillRect(8, by + 12, 16, 2);

            // Curly tail (visible from up, left, right)
            if (direction === 'up' || direction === 'left' || direction === 'right') {
                ctx.fillStyle = pinkDark;
                const tx = (direction === 'right') ? 5 : (direction === 'left' ? 25 : 15);
                ctx.fillRect(tx, by + 8, 3, 2);
                ctx.fillRect(tx + (direction === 'right' ? -1 : 1), by + 6, 2, 3);
                ctx.fillRect(tx, by + 5, 2, 2);
            }

            // Floppy Ears
            ctx.fillStyle = darkColor;
            if (direction === 'down') {
                ctx.fillRect(6, by - 1, 4, 5);
                ctx.fillRect(22, by - 1, 4, 5);
                ctx.fillStyle = lightColor;
                ctx.fillRect(7, by, 2, 3);
                ctx.fillRect(23, by, 2, 3);
            } else if (direction === 'up') {
                ctx.fillRect(6, by - 2, 4, 4);
                ctx.fillRect(22, by - 2, 4, 4);
            } else if (direction === 'left') {
                ctx.fillRect(18, by - 2, 4, 4);
                ctx.fillRect(10, by - 1, 4, 5);
            } else if (direction === 'right') {
                ctx.fillRect(10, by - 2, 4, 4);
                ctx.fillRect(18, by - 1, 4, 5);
            }

            // Face (if facing down or sideways)
            if (direction === 'down') {
                // Eyes
                ctx.fillStyle = white;
                ctx.fillRect(10, by + 4, 3, 4);
                ctx.fillRect(19, by + 4, 3, 4);
                ctx.fillStyle = black;
                ctx.fillRect(11, by + 5, 2, 3);
                ctx.fillRect(19, by + 5, 2, 3);
                // Eye shines
                ctx.fillStyle = white;
                ctx.fillRect(11, by + 5, 1, 1);
                ctx.fillRect(19, by + 5, 1, 1);

                // Snout
                ctx.fillStyle = lightColor;
                ctx.fillRect(12, by + 8, 8, 6);
                ctx.fillStyle = darkColor;
                ctx.fillRect(11, by + 9, 10, 4);
                ctx.fillStyle = snoutHole;
                ctx.fillRect(13, by + 10, 2, 2);
                ctx.fillRect(17, by + 10, 2, 2);
            } else if (direction === 'left') {
                // Eye
                ctx.fillStyle = white;
                ctx.fillRect(9, by + 4, 3, 4);
                ctx.fillStyle = black;
                ctx.fillRect(9, by + 5, 2, 3);
                ctx.fillStyle = white;
                ctx.fillRect(9, by + 5, 1, 1);
                // Snout protruding left
                ctx.fillStyle = darkColor;
                ctx.fillRect(5, by + 8, 5, 5);
                ctx.fillStyle = lightColor;
                ctx.fillRect(6, by + 7, 3, 2);
                ctx.fillStyle = snoutHole;
                ctx.fillRect(5, by + 10, 2, 2);
            } else if (direction === 'right') {
                // Eye
                ctx.fillStyle = white;
                ctx.fillRect(20, by + 4, 3, 4);
                ctx.fillStyle = black;
                ctx.fillRect(21, by + 5, 2, 3);
                ctx.fillStyle = white;
                ctx.fillRect(21, by + 5, 1, 1);
                // Snout protruding right
                ctx.fillStyle = darkColor;
                ctx.fillRect(22, by + 8, 5, 5);
                ctx.fillStyle = lightColor;
                ctx.fillRect(23, by + 7, 3, 2);
                ctx.fillStyle = snoutHole;
                ctx.fillRect(25, by + 10, 2, 2);
            } else if (direction === 'up') {
                // Back of head, cute round shading
                ctx.fillStyle = darkColor;
                ctx.fillRect(11, by + 3, 10, 4);
            }

            // Head Accessories:
            // 1. Halo
            if (accessories.halo) {
                ctx.strokeStyle = '#ffd166';
                ctx.lineWidth = 2;
                ctx.strokeRect(9, by - 6, 14, 4);
            }
            // 2. Iron Pot Helmet
            if (accessories.potHelmet) {
                ctx.fillStyle = '#6c757d';
                ctx.fillRect(8, by - 4, 16, 7);
                ctx.fillStyle = '#495057';
                ctx.fillRect(7, by + 1, 18, 2); // Rim
                // Pot handle
                ctx.fillStyle = '#343a40';
                ctx.fillRect(6, by - 1, 2, 3);
            }
            // 3. Straw Hat
            if (accessories.strawHat) {
                ctx.fillStyle = '#e9c46a';
                ctx.fillRect(5, by - 1, 22, 3); // Brim
                ctx.fillRect(10, by - 5, 12, 5); // Cone
                ctx.fillStyle = '#e76f51';
                ctx.fillRect(10, by - 2, 12, 1); // Ribbon
            }
            // 4. Red Bandana
            if (accessories.bandana) {
                ctx.fillStyle = '#d90429';
                ctx.fillRect(8, by + 2, 16, 3);
                ctx.fillRect(6, by + 4, 3, 3); // Knot tail
            }
            // 5. Reading Specs
            if (accessories.specs && direction === 'down') {
                ctx.fillStyle = '#48cae4';
                ctx.fillRect(10, by + 4, 3, 3);
                ctx.fillRect(19, by + 4, 3, 3);
                ctx.strokeStyle = '#023e8a';
                ctx.lineWidth = 1;
                ctx.strokeRect(10, by + 4, 3, 3);
                ctx.strokeRect(19, by + 4, 3, 3);
                ctx.beginPath();
                ctx.moveTo(13, by + 5);
                ctx.lineTo(19, by + 5);
                ctx.stroke();
            }

            return canvas;
        });
    }

    // ========================================================================
    // ENEMY SPRITES (PREDATORS)
    // ========================================================================
    getWolfSprite(frame = 0, isAlpha = false) {
        const key = `wolf_${isAlpha ? 'alpha' : 'normal'}_${frame % 2}`;
        return this.get(key, () => {
            const size = isAlpha ? 40 : 32;
            const { canvas, ctx } = this.createCanvas(size, size);
            const ox = isAlpha ? 4 : 0;
            const oy = isAlpha ? 4 : 0;

            const furDark = isAlpha ? '#212529' : '#495057';
            const furMid = isAlpha ? '#343a40' : '#6c757d';
            const furLight = isAlpha ? '#495057' : '#adb5bd';
            const eyeColor = isAlpha ? '#d90429' : '#f77f00';
            const fangs = '#ffffff';

            const legOffset = (frame % 2 === 1) ? 2 : 0;

            // Shadow
            ctx.fillStyle = 'rgba(20, 10, 10, 0.4)';
            ctx.beginPath();
            ctx.ellipse(size / 2, size - 4, size / 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Paws
            ctx.fillStyle = furDark;
            ctx.fillRect(ox + 8 - legOffset, oy + 23, 4, 6);
            ctx.fillRect(ox + 20 + legOffset, oy + 23, 4, 6);

            // Body
            ctx.fillStyle = furMid;
            ctx.fillRect(ox + 6, oy + 10, 20, 14);
            ctx.fillRect(ox + 8, oy + 8, 16, 4);

            // Shading
            ctx.fillStyle = furDark;
            ctx.fillRect(ox + 6, oy + 20, 20, 3);
            ctx.fillStyle = furLight;
            ctx.fillRect(ox + 10, oy + 10, 12, 4);

            // Pointy Wolf Ears
            ctx.fillStyle = furDark;
            ctx.fillRect(ox + 7, oy + 2, 4, 6);
            ctx.fillRect(ox + 21, oy + 2, 4, 6);
            ctx.fillStyle = '#ff758f';
            ctx.fillRect(ox + 8, oy + 4, 2, 3);
            ctx.fillRect(ox + 22, oy + 4, 2, 3);

            // Glowing Predator Eyes
            ctx.fillStyle = eyeColor;
            ctx.fillRect(ox + 10, oy + 11, 3, 3);
            ctx.fillRect(ox + 19, oy + 11, 3, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(ox + 10, oy + 11, 1, 1);
            ctx.fillRect(ox + 19, oy + 11, 1, 1);

            // Snout with Fangs
            ctx.fillStyle = furLight;
            ctx.fillRect(ox + 12, oy + 15, 8, 6);
            ctx.fillStyle = '#111111';
            ctx.fillRect(ox + 14, oy + 15, 4, 2); // Nose
            // Fangs
            ctx.fillStyle = fangs;
            ctx.fillRect(ox + 13, oy + 19, 2, 3);
            ctx.fillRect(ox + 17, oy + 19, 2, 3);

            // Tail
            ctx.fillStyle = furMid;
            ctx.fillRect(ox + 2, oy + 12 + legOffset, 5, 5);
            ctx.fillRect(ox + 1, oy + 14 + legOffset, 3, 6);

            if (isAlpha) {
                // Battle scar
                ctx.strokeStyle = '#d90429';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(ox + 11, oy + 9);
                ctx.lineTo(ox + 13, oy + 15);
                ctx.stroke();
            }

            return canvas;
        });
    }

    getFoxSprite(frame = 0) {
        const key = `fox_${frame % 2}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(32, 32);
            const legOffset = (frame % 2 === 1) ? 2 : 0;

            const orange = '#e76f51';
            const lightOrange = '#f4a261';
            const white = '#ffffff';
            const dark = '#264653';

            // Shadow
            ctx.fillStyle = 'rgba(20, 10, 10, 0.35)';
            ctx.beginPath();
            ctx.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Legs
            ctx.fillStyle = dark;
            ctx.fillRect(10 - legOffset, 24, 3, 5);
            ctx.fillRect(19 + legOffset, 24, 3, 5);

            // Body
            ctx.fillStyle = orange;
            ctx.fillRect(8, 12, 16, 12);
            ctx.fillStyle = lightOrange;
            ctx.fillRect(10, 13, 12, 4);

            // Big bushy tail with white tip
            ctx.fillStyle = orange;
            ctx.fillRect(23, 13 - legOffset, 6, 8);
            ctx.fillStyle = white;
            ctx.fillRect(27, 12 - legOffset, 4, 5);

            // Triangular ears
            ctx.fillStyle = dark;
            ctx.fillRect(8, 5, 4, 6);
            ctx.fillRect(20, 5, 4, 6);
            ctx.fillStyle = white;
            ctx.fillRect(9, 7, 2, 3);
            ctx.fillRect(21, 7, 2, 3);

            // Sly Eyes
            ctx.fillStyle = '#e9c46a';
            ctx.fillRect(10, 13, 3, 2);
            ctx.fillRect(19, 13, 3, 2);
            ctx.fillStyle = '#000000';
            ctx.fillRect(11, 13, 1, 2);
            ctx.fillRect(19, 13, 1, 2);

            // White snout and chest
            ctx.fillStyle = white;
            ctx.fillRect(12, 16, 8, 6);
            ctx.fillStyle = '#000000';
            ctx.fillRect(14, 17, 4, 2); // black nose tip

            return canvas;
        });
    }

    getHawkSprite(frame = 0) {
        const key = `hawk_${frame % 2}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(36, 36);
            const flap = (frame % 2 === 1) ? -4 : 2;

            const brown = '#6f4e37';
            const lightBrown = '#a67c52';
            const white = '#f8f9fa';
            const yellow = '#fcbf49';

            // Outstretched predatory wings
            ctx.fillStyle = brown;
            ctx.beginPath();
            ctx.moveTo(18, 16);
            ctx.lineTo(2, 8 + flap);
            ctx.lineTo(6, 18 + flap);
            ctx.lineTo(16, 20);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(18, 16);
            ctx.lineTo(34, 8 + flap);
            ctx.lineTo(30, 18 + flap);
            ctx.lineTo(20, 20);
            ctx.fill();

            // Wing feathers highlight
            ctx.fillStyle = lightBrown;
            ctx.fillRect(4, 11 + flap, 8, 3);
            ctx.fillRect(24, 11 + flap, 8, 3);

            // Body
            ctx.fillStyle = brown;
            ctx.fillRect(14, 12, 8, 14);
            ctx.fillStyle = white;
            ctx.fillRect(15, 14, 6, 8); // Speckled chest

            // Sharp Yellow Beak & Eyes
            ctx.fillStyle = yellow;
            ctx.fillRect(16, 8, 4, 4);
            ctx.fillRect(17, 12, 2, 3);
            ctx.fillStyle = '#000000';
            ctx.fillRect(15, 9, 2, 2);
            ctx.fillRect(19, 9, 2, 2);

            // Talons
            ctx.fillStyle = yellow;
            ctx.fillRect(14, 26, 3, 4);
            ctx.fillRect(19, 26, 3, 4);

            return canvas;
        });
    }

    getCoyoteSprite(frame = 0) {
        const key = `coyote_${frame % 2}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(32, 32);
            const legOffset = (frame % 2 === 1) ? 2 : 0;
            const fur = '#b08968';
            const furDark = '#7f5539';

            ctx.fillStyle = 'rgba(20, 10, 10, 0.35)';
            ctx.beginPath();
            ctx.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = furDark;
            ctx.fillRect(9 - legOffset, 24, 3, 5);
            ctx.fillRect(20 + legOffset, 24, 3, 5);

            ctx.fillStyle = fur;
            ctx.fillRect(8, 11, 16, 13);
            ctx.fillStyle = furDark;
            ctx.fillRect(7, 4, 3, 6);
            ctx.fillRect(22, 4, 3, 6);

            // Eyes
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(10, 12, 3, 2);
            ctx.fillRect(19, 12, 3, 2);
            ctx.fillStyle = '#000000';
            ctx.fillRect(11, 12, 1, 2);
            ctx.fillRect(20, 12, 1, 2);

            // Long snout
            ctx.fillStyle = '#ddb892';
            ctx.fillRect(11, 16, 10, 6);
            ctx.fillStyle = '#000000';
            ctx.fillRect(14, 16, 4, 2);

            return canvas;
        });
    }

    getBadgerSprite(frame = 0) {
        const key = `badger_${frame % 2}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(32, 32);
            const bob = (frame % 2 === 1) ? 1 : 0;

            ctx.fillStyle = 'rgba(20, 10, 10, 0.35)';
            ctx.beginPath();
            ctx.ellipse(16, 27, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Chunky grey body
            ctx.fillStyle = '#495057';
            ctx.fillRect(6, 14 + bob, 20, 11);
            // Black and white striped face
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 8 + bob, 12, 8);
            ctx.fillStyle = '#212529';
            ctx.fillRect(11, 8 + bob, 3, 8); // left stripe
            ctx.fillRect(18, 8 + bob, 3, 8); // right stripe
            // Claws
            ctx.fillStyle = '#adb5bd';
            ctx.fillRect(7, 24, 3, 4);
            ctx.fillRect(22, 24, 3, 4);

            return canvas;
        });
    }

    // ========================================================================
    // FINAL BOSS: FARMER GRIMM (THE BUTCHER)
    // ========================================================================
    getFarmerBossSprite(frame = 0, isEnraged = false) {
        const key = `farmer_boss_${frame % 2}_${isEnraged}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(64, 64);
            const bob = (frame % 2 === 1) ? 2 : 0;

            const skin = isEnraged ? '#e76f51' : '#ffb703';
            const denim = isEnraged ? '#780000' : '#1d3557';
            const apron = isEnraged ? '#ba181b' : '#f8f9fa';
            const blood = '#9d0208';
            const steel = '#adb5bd';

            // Shadow
            ctx.fillStyle = 'rgba(20, 10, 10, 0.5)';
            ctx.beginPath();
            ctx.ellipse(32, 58, 22, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Heavy Work Boots
            ctx.fillStyle = '#343a40';
            ctx.fillRect(20, 52, 8, 8);
            ctx.fillRect(36, 52, 8, 8);

            // Overalls Legs
            ctx.fillStyle = denim;
            ctx.fillRect(19, 38, 10, 16);
            ctx.fillRect(35, 38, 10, 16);

            // Massive Torso / Belly
            ctx.fillStyle = '#e63946'; // Red plaid shirt
            ctx.fillRect(16, 20 + bob, 32, 22);

            // Butcher Apron
            ctx.fillStyle = apron;
            ctx.fillRect(22, 22 + bob, 20, 26);
            // Splatters on apron
            ctx.fillStyle = blood;
            ctx.fillRect(25, 28 + bob, 4, 6);
            ctx.fillRect(32, 34 + bob, 5, 5);
            ctx.fillRect(27, 42 + bob, 6, 3);

            // Farmer Head & Angry Beard
            ctx.fillStyle = skin;
            ctx.fillRect(24, 10 + bob, 16, 14);
            // Beard
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(23, 18 + bob, 18, 8);

            // Angry Glowing Eyes
            ctx.fillStyle = isEnraged ? '#ffff3f' : '#ffffff';
            ctx.fillRect(27, 13 + bob, 3, 3);
            ctx.fillRect(34, 13 + bob, 3, 3);
            ctx.fillStyle = isEnraged ? '#d90429' : '#000000';
            ctx.fillRect(28, 14 + bob, 2, 2);
            ctx.fillRect(35, 14 + bob, 2, 2);

            // Straw Hat
            ctx.fillStyle = '#e9c46a';
            ctx.fillRect(16, 7 + bob, 32, 5); // Brim
            ctx.fillRect(22, 1 + bob, 20, 7); // Crown
            ctx.fillStyle = '#e76f51';
            ctx.fillRect(22, 6 + bob, 20, 2);

            // Left Hand: Giant Meat Cleaver
            ctx.fillStyle = skin;
            ctx.fillRect(10, 26 + bob, 7, 7);
            ctx.fillStyle = '#495057'; // handle
            ctx.fillRect(12, 18 + bob, 3, 10);
            ctx.fillStyle = steel; // Cleaver Blade
            ctx.fillRect(4, 8 + bob, 18, 14);
            ctx.fillStyle = blood;
            ctx.fillRect(4, 18 + bob, 18, 3);

            // Right Hand: Double Barrel Shotgun
            ctx.fillStyle = skin;
            ctx.fillRect(47, 28 + bob, 7, 7);
            ctx.fillStyle = '#5c3d2e'; // Wood stock
            ctx.fillRect(52, 29 + bob, 5, 6);
            ctx.fillStyle = '#212529'; // Barrels
            ctx.fillRect(48, 18 + bob, 4, 14);
            ctx.fillRect(52, 18 + bob, 4, 14);

            return canvas;
        });
    }

    // ========================================================================
    // MERCHANT: BARNABY THE RACCOON
    // ========================================================================
    getMerchantSprite(frame = 0) {
        const key = `merchant_${frame % 2}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(36, 36);
            const bob = (frame % 2 === 1) ? 1 : 0;

            // Shadow
            ctx.fillStyle = 'rgba(20, 10, 10, 0.4)';
            ctx.beginPath();
            ctx.ellipse(18, 32, 12, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Raccoon body
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(10, 14 + bob, 16, 14);

            // Striped tail
            ctx.fillStyle = '#343a40';
            ctx.fillRect(24, 18 + bob, 8, 5);
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(27, 18 + bob, 3, 5);

            // Merchant vest
            ctx.fillStyle = '#8338ec';
            ctx.fillRect(11, 16 + bob, 14, 10);
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(17, 18 + bob, 2, 2); // Gold button

            // Masked face
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(11, 7 + bob, 14, 9);
            // Black bandit mask
            ctx.fillStyle = '#212529';
            ctx.fillRect(10, 9 + bob, 16, 5);

            // Cute shiny eyes
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(13, 10 + bob, 3, 3);
            ctx.fillRect(20, 10 + bob, 3, 3);
            ctx.fillStyle = '#000000';
            ctx.fillRect(14, 11 + bob, 1, 1);
            ctx.fillRect(21, 11 + bob, 1, 1);

            // Tiny ears
            ctx.fillStyle = '#212529';
            ctx.fillRect(9, 4 + bob, 4, 4);
            ctx.fillRect(23, 4 + bob, 4, 4);

            // Little snout
            ctx.fillStyle = '#000000';
            ctx.fillRect(16, 14 + bob, 4, 2);

            return canvas;
        });
    }

    // ========================================================================
    // TILES & ENVIRONMENT
    // ========================================================================
    getTile(type, variant = 0) {
        const key = `tile_${type}_${variant}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(32, 32);

            if (type === 'barn_floor') {
                // Wooden planks
                ctx.fillStyle = (variant % 2 === 0) ? '#a26938' : '#945c2f';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#7a461e';
                ctx.fillRect(0, 31, 32, 1); // plank divider
                ctx.fillRect(15, 0, 1, 32);
                // Nail heads
                ctx.fillStyle = '#49301d';
                ctx.fillRect(2, 2, 2, 2);
                ctx.fillRect(28, 2, 2, 2);
                ctx.fillRect(2, 18, 2, 2);
                ctx.fillRect(28, 18, 2, 2);
            } else if (type === 'barn_wall') {
                ctx.fillStyle = '#5c1d1d'; // dark barn red
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#782828';
                ctx.fillRect(2, 2, 28, 28);
                // Wood beam cross
                ctx.strokeStyle = '#421414';
                ctx.lineWidth = 2;
                ctx.strokeRect(4, 4, 24, 24);
                ctx.beginPath();
                ctx.moveTo(4, 4);
                ctx.lineTo(28, 28);
                ctx.stroke();
            } else if (type === 'field_floor') {
                // Loam dirt with small pebbles and grass sprouts
                ctx.fillStyle = '#705335';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#5c4125';
                ctx.fillRect(4, 12, 6, 4);
                ctx.fillRect(18, 22, 8, 3);
                // Grass sprout
                ctx.fillStyle = '#55a630';
                ctx.fillRect(8, 6, 2, 3);
                ctx.fillRect(9, 5, 2, 2);
                ctx.fillRect(24, 15, 2, 3);
            } else if (type === 'field_wall') {
                // Dense corn stalks
                ctx.fillStyle = '#2d6a4f';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#40916c';
                ctx.fillRect(4, 0, 6, 32);
                ctx.fillRect(16, 0, 6, 32);
                ctx.fillStyle = '#ffb703'; // golden corn ear
                ctx.fillRect(7, 10, 4, 8);
                ctx.fillRect(19, 14, 4, 8);
            } else if (type === 'silo_floor') {
                // Industrial rusted metal grates
                ctx.fillStyle = '#495057';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#343a40';
                ctx.fillRect(0, 0, 32, 2);
                ctx.fillRect(0, 0, 2, 32);
                // Grate pattern
                ctx.fillStyle = '#212529';
                for (let x = 6; x < 28; x += 6) {
                    for (let y = 6; y < 28; y += 6) {
                        ctx.fillRect(x, y, 3, 3);
                    }
                }
                // Rust stain
                ctx.fillStyle = '#b7094c';
                ctx.fillRect(14, 16, 5, 4);
            } else if (type === 'silo_wall') {
                // Steel plate with rivets
                ctx.fillStyle = '#343a40';
                ctx.fillRect(0, 0, 32, 32);
                ctx.fillStyle = '#495057';
                ctx.fillRect(2, 2, 28, 28);
                ctx.fillStyle = '#adb5bd'; // Rivets
                ctx.fillRect(4, 4, 2, 2);
                ctx.fillRect(26, 4, 2, 2);
                ctx.fillRect(4, 26, 2, 2);
                ctx.fillRect(26, 26, 2, 2);
            } else if (type === 'rock') {
                ctx.fillStyle = '#6c757d';
                ctx.beginPath();
                ctx.arc(16, 16, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#adb5bd';
                ctx.beginPath();
                ctx.arc(14, 14, 8, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'hay_bale') {
                ctx.fillStyle = '#e9c46a';
                ctx.fillRect(4, 6, 24, 20);
                ctx.fillStyle = '#f4a261';
                ctx.fillRect(4, 10, 24, 2);
                ctx.fillRect(4, 18, 24, 2);
                ctx.fillStyle = '#d4a373';
                ctx.fillRect(10, 6, 2, 20);
                ctx.fillRect(20, 6, 2, 20);
            }

            return canvas;
        });
    }

    // ========================================================================
    // TRAPS
    // ========================================================================
    getTrapSprite(type, state = 0) {
        const key = `trap_${type}_${state}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(32, 32);

            if (type === 'pitchfork_spikes') {
                // Retractable floor spikes
                ctx.fillStyle = '#495057';
                ctx.fillRect(4, 4, 24, 24);
                if (state === 1) { // Up & Lethal!
                    ctx.fillStyle = '#f8f9fa';
                    // Sharp spikes
                    for (let x = 8; x <= 24; x += 8) {
                        for (let y = 8; y <= 24; y += 8) {
                            ctx.fillStyle = '#adb5bd';
                            ctx.fillRect(x - 2, y - 2, 4, 4);
                            ctx.fillStyle = '#e63946'; // blood tip
                            ctx.fillRect(x - 1, y - 3, 2, 2);
                        }
                    }
                } else {
                    // Holes in floor
                    ctx.fillStyle = '#212529';
                    for (let x = 8; x <= 24; x += 8) {
                        for (let y = 8; y <= 24; y += 8) {
                            ctx.fillRect(x - 1, y - 1, 2, 2);
                        }
                    }
                }
            } else if (type === 'bear_trap') {
                ctx.fillStyle = '#343a40';
                if (state === 0) { // Open jaws
                    ctx.strokeStyle = '#adb5bd';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(6, 6, 20, 20);
                    // Teeth
                    ctx.fillStyle = '#f8f9fa';
                    for (let i = 8; i <= 24; i += 4) {
                        ctx.fillRect(i, 8, 2, 3);
                        ctx.fillRect(i, 21, 2, 3);
                    }
                    ctx.fillStyle = '#e63946'; // Red pressure plate
                    ctx.fillRect(14, 14, 4, 4);
                } else { // Snapped shut
                    ctx.fillStyle = '#adb5bd';
                    ctx.fillRect(10, 8, 12, 16);
                    ctx.fillStyle = '#9d0208';
                    ctx.fillRect(12, 10, 8, 12);
                }
            } else if (type === 'mud_pit') {
                // Slowing mud puddle
                ctx.fillStyle = '#5c3818';
                ctx.beginPath();
                ctx.ellipse(16, 16, 13, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#7a461e';
                ctx.beginPath();
                ctx.ellipse(14, 14, 8, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                // Bubble
                ctx.fillStyle = '#a26938';
                ctx.beginPath();
                ctx.arc(18, 14, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'electric_fence') {
                // High voltage wire post
                ctx.fillStyle = '#5c3d2e';
                ctx.fillRect(12, 4, 8, 24);
                // Insulators
                ctx.fillStyle = '#48cae4';
                ctx.fillRect(9, 8, 14, 3);
                ctx.fillRect(9, 18, 14, 3);
                if (state === 1) { // Arcing sparks
                    ctx.strokeStyle = '#ffd166';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(2, 9);
                    ctx.lineTo(8, 11);
                    ctx.lineTo(16, 7);
                    ctx.lineTo(24, 11);
                    ctx.lineTo(30, 9);
                    ctx.stroke();
                }
            } else if (type === 'threshing_saw') {
                // Spinning saw blade
                ctx.fillStyle = '#ced4da';
                ctx.beginPath();
                ctx.arc(16, 16, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#6c757d';
                ctx.beginPath();
                ctx.arc(16, 16, 4, 0, Math.PI * 2);
                ctx.fill();
                // Teeth
                ctx.fillStyle = '#adb5bd';
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                    const sx = 16 + Math.cos(a + (state * 0.4)) * 14;
                    const sy = 16 + Math.sin(a + (state * 0.4)) * 14;
                    ctx.fillRect(sx - 1, sy - 1, 3, 3);
                }
            }

            return canvas;
        });
    }

    // ========================================================================
    // ITEM & PICKUP ICONS
    // ========================================================================
    getItemIcon(iconName) {
        const key = `icon_${iconName}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(24, 24);

            if (iconName === 'apple' || iconName === 'apple_gold') {
                const isGold = iconName === 'apple_gold';
                ctx.fillStyle = isGold ? '#ffd166' : '#e63946';
                ctx.beginPath();
                ctx.arc(12, 14, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = isGold ? '#ffe49e' : '#ff758f';
                ctx.beginPath();
                ctx.arc(10, 12, 3, 0, Math.PI * 2);
                ctx.fill();
                // Stem and leaf
                ctx.fillStyle = '#5c3d2e';
                ctx.fillRect(11, 4, 2, 4);
                ctx.fillStyle = '#55a630';
                ctx.fillRect(13, 5, 4, 3);
            } else if (iconName === 'corn' || iconName === 'corn_gold') {
                const isGold = iconName === 'corn_gold';
                ctx.fillStyle = isGold ? '#ffe600' : '#ffb703';
                ctx.fillRect(8, 6, 8, 14);
                ctx.fillStyle = '#55a630'; // Husk
                ctx.fillRect(6, 12, 4, 9);
                ctx.fillRect(14, 12, 4, 9);
            } else if (iconName === 'chili' || iconName === 'ghost_pepper') {
                ctx.fillStyle = iconName === 'ghost_pepper' ? '#ff0054' : '#d90429';
                ctx.beginPath();
                ctx.ellipse(12, 13, 5, 8, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#38b000';
                ctx.fillRect(9, 4, 4, 3);
            } else if (iconName === 'mud_ball' || iconName === 'golem_core') {
                ctx.fillStyle = iconName === 'golem_core' ? '#7b2cbf' : '#6f4e37';
                ctx.beginPath();
                ctx.arc(12, 12, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = iconName === 'golem_core' ? '#c77dff' : '#9c6644';
                ctx.beginPath();
                ctx.arc(10, 10, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (iconName === 'wings') {
                ctx.fillStyle = '#f8f9fa';
                ctx.beginPath();
                ctx.arc(8, 12, 6, 0, Math.PI * 2);
                ctx.arc(16, 12, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#e9ecef';
                ctx.fillRect(10, 10, 4, 6);
            } else if (iconName === 'halo') {
                ctx.strokeStyle = '#ffd166';
                ctx.lineWidth = 3;
                ctx.strokeRect(4, 8, 16, 8);
            } else if (iconName === 'pot_helmet') {
                ctx.fillStyle = '#6c757d';
                ctx.fillRect(5, 7, 14, 10);
                ctx.fillStyle = '#343a40';
                ctx.fillRect(4, 15, 16, 2);
            } else if (iconName === 'pitchfork') {
                ctx.fillStyle = '#adb5bd';
                ctx.fillRect(7, 4, 2, 8);
                ctx.fillRect(11, 4, 2, 8);
                ctx.fillRect(15, 4, 2, 8);
                ctx.fillRect(7, 10, 10, 2);
                ctx.fillStyle = '#5c3d2e';
                ctx.fillRect(11, 12, 2, 10);
            } else if (iconName === 'key_gold') {
                ctx.fillStyle = '#ffd166';
                ctx.beginPath();
                ctx.arc(8, 8, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(8, 8, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffd166';
                ctx.fillRect(11, 7, 10, 3);
                ctx.fillRect(17, 10, 2, 3);
                ctx.fillRect(20, 10, 2, 3);
            } else if (iconName === 'tnt_bucket') {
                ctx.fillStyle = '#d90429';
                ctx.fillRect(6, 6, 12, 14);
                ctx.fillStyle = '#f8f9fa';
                ctx.font = 'bold 6px sans-serif';
                ctx.fillText('TNT', 7, 15);
                ctx.fillStyle = '#ffb703';
                ctx.fillRect(11, 3, 2, 3);
            } else {
                // Generic shiny mystery emblem
                ctx.fillStyle = '#8338ec';
                ctx.beginPath();
                ctx.arc(12, 12, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffbe0b';
                ctx.fillRect(10, 7, 4, 10);
                ctx.fillRect(7, 10, 10, 4);
            }

            return canvas;
        });
    }

    // ========================================================================
    // DOORS (NORMAL, TREASURE, SHOP, BOSS)
    // ========================================================================
    getDoorSprite(type, isOpen = false) {
        const key = `door_${type}_${isOpen}`;
        return this.get(key, () => {
            const { canvas, ctx } = this.createCanvas(32, 32);

            let frameColor = '#5c3d2e';
            let doorColor = '#7f5539';
            let iconColor = '#ffffff';

            if (type === 'treasure') {
                frameColor = '#b5838d';
                doorColor = '#ffd166';
                iconColor = '#ffb703';
            } else if (type === 'shop') {
                frameColor = '#0077b6';
                doorColor = '#0096c7';
                iconColor = '#ffd166';
            } else if (type === 'boss') {
                frameColor = '#3a0ca3';
                doorColor = '#7209b7';
                iconColor = '#f72585';
            }

            ctx.fillStyle = frameColor;
            ctx.fillRect(2, 2, 28, 28);

            if (isOpen) {
                // Dark opening
                ctx.fillStyle = '#0f0f14';
                ctx.fillRect(6, 6, 20, 24);
            } else {
                // Closed wooden or ornate door
                ctx.fillStyle = doorColor;
                ctx.fillRect(6, 6, 20, 24);
                ctx.fillStyle = '#212529';
                ctx.fillRect(15, 6, 2, 24); // Split in middle

                // Emblem
                ctx.fillStyle = iconColor;
                if (type === 'boss') {
                    // Skull emblem
                    ctx.beginPath();
                    ctx.arc(16, 15, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(14, 14, 2, 2);
                    ctx.fillRect(17, 14, 2, 2);
                } else if (type === 'treasure') {
                    // Golden keyhole / star
                    ctx.fillRect(14, 14, 4, 4);
                } else if (type === 'shop') {
                    // Coin emblem
                    ctx.beginPath();
                    ctx.arc(16, 16, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Iron ring handles
                    ctx.fillStyle = '#ced4da';
                    ctx.fillRect(11, 16, 2, 4);
                    ctx.fillRect(19, 16, 2, 4);
                }
            }

            return canvas;
        });
    }
}

if (typeof window !== 'undefined') {
    window.SpriteManager = SpriteManager;
}
