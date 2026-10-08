// ============================================================================
// OINK OF ISAAC: BARNYARD BREAKOUT - ITEMS & SYNERGIES CATALOG
// Minimum 50+ unique items with stats, active effects, familiars & synergies!
// ============================================================================

const ITEMS_DATABASE = [
    {
        id: 'golden_apple',
        name: 'Golden Apple',
        desc: 'Max HP up + full heal',
        type: 'passive',
        category: 'vitality',
        rarity: 'rare',
        stats: { maxHp: 2, hp: 2, luck: 1 },
        icon: 'apple_gold'
    },
    {
        id: 'crispy_corn',
        name: 'Crispy Corn Kernel',
        desc: 'Rapid fire + popping tears',
        type: 'passive',
        category: 'tears',
        rarity: 'common',
        stats: { tearRate: 0.8, range: 20 },
        effects: { poppingCorn: true },
        icon: 'corn'
    },
    {
        id: 'spicy_chili',
        name: 'Spicy Red Chili',
        desc: 'Hot hot hot! Tears burn foes',
        type: 'passive',
        category: 'damage',
        rarity: 'common',
        stats: { damage: 1.5, speed: 0.15 },
        effects: { burning: true },
        icon: 'chili'
    },
    {
        id: 'thick_mud_ball',
        name: 'Thick Mud Ball',
        desc: 'Heavy knockback & slows predators',
        type: 'passive',
        category: 'tears',
        rarity: 'common',
        stats: { knockback: 2.0, damage: 0.8 },
        effects: { slowing: true, mudCoat: true },
        icon: 'mud_ball'
    },
    {
        id: 'truffle_snout',
        name: 'Truffle Snout',
        desc: 'Smells out secrets & boosts luck',
        type: 'passive',
        category: 'utility',
        rarity: 'rare',
        stats: { luck: 3 },
        effects: { revealSecrets: true, betterChests: true },
        icon: 'snout'
    },
    {
        id: 'iron_pot_helmet',
        name: 'Iron Pot Helmet',
        desc: 'Protective headgear (+2 Mud Armor)',
        type: 'passive',
        category: 'defense',
        rarity: 'common',
        stats: { shields: 2 },
        effects: { headArmor: true },
        icon: 'pot_helmet'
    },
    {
        id: 'curly_tail_spring',
        name: 'Curly Tail Spring',
        desc: 'Bouncy speed & trap jump agility',
        type: 'passive',
        category: 'movement',
        rarity: 'common',
        stats: { speed: 0.4 },
        effects: { trapImmunity: true, bouncyDash: true },
        icon: 'spring_tail'
    },
    {
        id: 'pitchfork_tip',
        name: 'Pitchfork Tip',
        desc: 'Piercing shots that impale',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        stats: { damage: 1.2 },
        effects: { piercing: true },
        icon: 'pitchfork'
    },
    {
        id: 'bouncy_rubber_boots',
        name: 'Rubber Barn Boots',
        desc: 'Bouncing shots & immunity to mud slow',
        type: 'passive',
        category: 'tears',
        rarity: 'common',
        stats: { range: 40 },
        effects: { bouncing: true, mudWalk: true },
        icon: 'boots'
    },
    {
        id: 'serrated_wolf_claw',
        name: 'Serrated Wolf Claw',
        desc: 'Tears inflict bleeding wounds',
        type: 'passive',
        category: 'damage',
        rarity: 'rare',
        stats: { damage: 1.0 },
        effects: { bleeding: true },
        icon: 'wolf_claw'
    },
    {
        id: 'barn_owl_feather',
        name: 'Barn Owl Feather',
        desc: 'Homing tears seek out predators',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        stats: { shotSpeed: -0.1 },
        effects: { homing: true },
        icon: 'feather'
    },
    {
        id: 'rotten_carrot',
        name: 'Rotten Carrot',
        desc: 'Toxic sludge tears poison foes',
        type: 'passive',
        category: 'tears',
        rarity: 'common',
        stats: { damage: 0.6 },
        effects: { poison: true },
        icon: 'rotten_carrot'
    },
    {
        id: 'tractor_tire',
        name: 'Heavy Tractor Tire',
        desc: 'Spectral shots pass through solid rocks',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        stats: { knockback: 1.2 },
        effects: { spectral: true },
        icon: 'tire'
    },
    {
        id: 'magic_horseshoe',
        name: 'Magic Horseshoe',
        desc: 'Tremendous luck! Enemies drop more loot',
        type: 'passive',
        category: 'utility',
        rarity: 'rare',
        stats: { luck: 4, speed: 0.15 },
        effects: { doubleLootChance: 0.35 },
        icon: 'horseshoe'
    },
    {
        id: 'mama_sows_locket',
        name: "Mama Sow's Locket",
        desc: '+2 Max HP & Revive once from death',
        type: 'passive',
        category: 'vitality',
        rarity: 'legendary',
        stats: { maxHp: 2, hp: 2 },
        effects: { extraLife: 1 },
        icon: 'locket'
    },
    {
        id: 'electric_cattle_prod',
        name: 'Electric Cattle Prod',
        desc: 'Chain lightning arcs across enemies',
        type: 'passive',
        category: 'damage',
        rarity: 'rare',
        stats: { damage: 1.2 },
        effects: { chainLightning: true },
        icon: 'prod'
    },
    {
        id: 'angel_pig_wings',
        name: 'Angel Pig Wings',
        desc: 'When pigs fly! Flight over all obstacles',
        type: 'passive',
        category: 'movement',
        rarity: 'legendary',
        stats: { speed: 0.35 },
        effects: { flying: true },
        icon: 'wings'
    },
    {
        id: 'squeal_of_terror',
        name: 'Squeal of Terror',
        desc: 'Active: Terrify all predators and push them back',
        type: 'active',
        category: 'active',
        rarity: 'common',
        maxCharges: 2,
        icon: 'megaphone'
    },
    {
        id: 'little_piglet',
        name: 'Little Piglet',
        desc: 'A loyal brother follows and shoots',
        type: 'passive',
        category: 'familiar',
        rarity: 'rare',
        familiarType: 'piglet',
        icon: 'mini_pig'
    },
    {
        id: 'angry_rooster',
        name: 'Angry Rooster',
        desc: 'Fierce bird dashes at nearby predators',
        type: 'passive',
        category: 'familiar',
        rarity: 'rare',
        familiarType: 'rooster',
        icon: 'rooster'
    },
    {
        id: 'barn_cat',
        name: 'Barn Cat',
        desc: 'Collects coins & scratches nearby enemies',
        type: 'passive',
        category: 'familiar',
        rarity: 'rare',
        familiarType: 'cat',
        icon: 'cat'
    },
    {
        id: 'milk_bucket',
        name: 'Fresh Milk Bucket',
        desc: 'Cleanses debuffs and +1 to all stats',
        type: 'passive',
        category: 'stats',
        rarity: 'rare',
        stats: { maxHp: 1, hp: 1, damage: 0.8, tearRate: 0.3, speed: 0.15, luck: 1 },
        icon: 'milk'
    },
    {
        id: 'spitfire_slingshot',
        name: 'Barn Slingshot',
        desc: 'Triple shot spread for maximum coverage',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        stats: { damage: -0.2, tearRate: -0.2 },
        effects: { tripleShot: true },
        icon: 'slingshot'
    },
    {
        id: 'muddy_cloak',
        name: 'Muddy Cloak',
        desc: 'Leaves sticky mud puddles behind you',
        type: 'passive',
        category: 'defense',
        rarity: 'common',
        stats: { shields: 1 },
        effects: { mudTrail: true },
        icon: 'cloak'
    },
    {
        id: 'golden_corn_cob',
        name: 'Golden Corn Cob',
        desc: 'Your wealth feeds your power (+dmg per coin)',
        type: 'passive',
        category: 'damage',
        rarity: 'rare',
        effects: { moneyIsPower: true },
        icon: 'corn_gold'
    },
    {
        id: 'nitroglycerin_slop',
        name: 'Explosive Pig Slop',
        desc: 'Tears detonate on impact!',
        type: 'passive',
        category: 'tears',
        rarity: 'legendary',
        stats: { damage: 2.0, tearRate: -0.3 },
        effects: { explosiveShots: true },
        icon: 'tnt_bucket'
    },
    {
        id: 'vampire_mosquito',
        name: 'Swamp Mosquito',
        desc: 'Chance to siphon vitality on enemy kill',
        type: 'passive',
        category: 'vitality',
        rarity: 'rare',
        effects: { lifeStealChance: 0.15 },
        icon: 'mosquito'
    },
    {
        id: 'straw_hat',
        name: 'Farmer Straw Hat',
        desc: '+1 Mud Shield & protection from aerial hawks',
        type: 'passive',
        category: 'defense',
        rarity: 'common',
        stats: { shields: 1 },
        effects: { skyShield: true },
        icon: 'straw_hat'
    },
    {
        id: 'bacon_grease',
        name: 'Lard & Bacon Grease',
        desc: 'Extreme speed + slippery evasive slides',
        type: 'passive',
        category: 'movement',
        rarity: 'common',
        stats: { speed: 0.6 },
        effects: { greaseSlide: true },
        icon: 'grease'
    },
    {
        id: 'rusty_cowbell',
        name: 'Rusty Cowbell',
        desc: 'Rings on room enter, stunning enemies for 2s',
        type: 'passive',
        category: 'utility',
        rarity: 'rare',
        effects: { roomStun: 2.0 },
        icon: 'bell'
    },
    {
        id: 'fertilizer_bag',
        name: 'Super Fertilizer',
        desc: 'Impacts sprout brambles that damage foes',
        type: 'passive',
        category: 'tears',
        rarity: 'common',
        effects: { thornBrambles: true },
        icon: 'fertilizer'
    },
    {
        id: 'clover_of_fortune',
        name: 'Four-Leaf Clover',
        desc: 'Better shop deals & high tier chests',
        type: 'passive',
        category: 'utility',
        rarity: 'common',
        stats: { luck: 2.5 },
        effects: { luckyDrop: true },
        icon: 'clover'
    },
    {
        id: 'farmers_pocket_watch',
        name: "Farmer's Pocket Watch",
        desc: 'Active: Freeze predator time for 5 seconds',
        type: 'active',
        category: 'active',
        rarity: 'rare',
        maxCharges: 4,
        icon: 'pocket_watch'
    },
    {
        id: 'giant_pumpkin',
        name: 'Prize Giant Pumpkin',
        desc: 'Gigantic bowling-ball tears with crushing force',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        stats: { damage: 3.5, tearRate: -0.4, shotSpeed: -0.2 },
        effects: { giantTears: true },
        icon: 'pumpkin'
    },
    {
        id: 'ice_cube_slop',
        name: 'Chilled Slop Cubes',
        desc: 'Freezing tears turn predators into ice cubes',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        effects: { freezing: true },
        icon: 'ice_cube'
    },
    {
        id: 'honey_dipper',
        name: 'Wild Honey Jar',
        desc: 'Sticky sweet tears summon stinging bees',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        stats: { damage: 0.5 },
        effects: { beeSwarm: true },
        icon: 'honey'
    },
    {
        id: 'hay_bale_shield',
        name: 'Orbiting Hay Bale',
        desc: 'Blocks enemy bullets and knocks back melee',
        type: 'passive',
        category: 'familiar',
        rarity: 'common',
        familiarType: 'hay_bale',
        icon: 'hay_bale'
    },
    {
        id: 'silver_whistle',
        name: 'Shepherd Whistle',
        desc: 'Active: Call a stampede of sheep across the room',
        type: 'active',
        category: 'active',
        rarity: 'rare',
        maxCharges: 3,
        icon: 'whistle'
    },
    {
        id: 'stink_bug_juice',
        name: 'Stink Bug Extract',
        desc: 'Fires a toxic continuous snout-stream',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        stats: { tearRate: 1.5, damage: -0.4 },
        effects: { streamWeapon: true },
        icon: 'stink_bug'
    },
    {
        id: 'gatling_silo_gear',
        name: 'Silo Mill Gear',
        desc: 'Absurd tear rate! Machine-gun snout',
        type: 'passive',
        category: 'tears',
        rarity: 'legendary',
        stats: { tearRate: 2.2, damage: -0.5, shotSpeed: 0.3 },
        effects: { rapidFire: true },
        icon: 'gear'
    },
    {
        id: 'farmers_lost_specs',
        name: "Farmer's Reading Glasses",
        desc: 'Inspect predator HP bars & +Range',
        type: 'passive',
        category: 'utility',
        rarity: 'common',
        stats: { range: 80, shotSpeed: 0.2 },
        effects: { showEnemyHp: true },
        icon: 'glasses'
    },
    {
        id: 'ghost_pepper',
        name: 'Ghost Pepper Flakes',
        desc: 'Snout burps flaming cones when shooting',
        type: 'passive',
        category: 'damage',
        rarity: 'rare',
        stats: { damage: 1.2 },
        effects: { fireBreath: true },
        icon: 'ghost_pepper'
    },
    {
        id: 'truffle_pig_trowel',
        name: 'Garden Trowel',
        desc: 'Dig up food or coins when clearing rooms',
        type: 'passive',
        category: 'utility',
        rarity: 'common',
        effects: { roomDig: true },
        icon: 'trowel'
    },
    {
        id: 'steel_horseshoe',
        name: 'Reinforced Horseshoe',
        desc: 'Ramming enemies deals devastating impact',
        type: 'passive',
        category: 'damage',
        rarity: 'common',
        stats: { speed: 0.2 },
        effects: { rammingDamage: 8.0 },
        icon: 'steel_horseshoe'
    },
    {
        id: 'golden_egg',
        name: 'Prize Hen Golden Egg',
        desc: 'Active: Crack open for a random mystery feast',
        type: 'active',
        category: 'active',
        rarity: 'rare',
        maxCharges: 5,
        icon: 'golden_egg'
    },
    {
        id: 'scarecrow_straw',
        name: 'Cursed Scarecrow Straw',
        desc: 'Predators frequently attack decoy straw dummies',
        type: 'passive',
        category: 'defense',
        rarity: 'common',
        effects: { strawDecoy: true },
        icon: 'straw'
    },
    {
        id: 'weather_vane',
        name: 'Barn Weather Vane',
        desc: 'Wind gusts propel tears forward at high velocity',
        type: 'passive',
        category: 'tears',
        rarity: 'common',
        stats: { shotSpeed: 0.5, range: 40 },
        effects: { windBoost: true },
        icon: 'weather_vane'
    },
    {
        id: 'salt_lick',
        name: 'Pure Salt Lick',
        desc: '+Damage and enemies salt-dissolve on death',
        type: 'passive',
        category: 'damage',
        rarity: 'common',
        stats: { damage: 1.4 },
        effects: { saltDissolve: true },
        icon: 'salt_lick'
    },
    {
        id: 'apple_core_shrapnel',
        name: 'Apple Core Shrapnel',
        desc: 'Tears burst into 4 sharp flying seeds',
        type: 'passive',
        category: 'tears',
        rarity: 'rare',
        effects: { burstShrapnel: true },
        icon: 'apple_core'
    },
    {
        id: 'bessies_bell',
        name: "Bessie's Cowbell",
        desc: 'An orbiting brass bell emitting sonic shockwaves',
        type: 'passive',
        category: 'familiar',
        rarity: 'rare',
        familiarType: 'sonic_bell',
        icon: 'brass_bell'
    },
    {
        id: 'heros_red_bandana',
        name: "Hero's Red Bandana",
        desc: 'Berserk! At 1 HP, triple damage and tear rate',
        type: 'passive',
        category: 'damage',
        rarity: 'legendary',
        effects: { berserkRage: true },
        icon: 'bandana'
    },
    {
        id: 'crown_of_barnyard',
        name: 'Barnyard King Crown',
        desc: '+1 to all stats and 50% Shopkeeper discount!',
        type: 'passive',
        category: 'stats',
        rarity: 'legendary',
        stats: { maxHp: 1, hp: 1, damage: 1.0, tearRate: 0.4, speed: 0.2, luck: 2 },
        effects: { merchantDiscount: 0.5 },
        icon: 'crown'
    },
    {
        id: 'holy_halo',
        name: 'Saintly Hog Halo',
        desc: 'Holy light beams smite predators from above',
        type: 'passive',
        category: 'damage',
        rarity: 'legendary',
        stats: { damage: 1.0 },
        effects: { holyBeams: true },
        icon: 'halo'
    },
    {
        id: 'mud_golem_core',
        name: 'Ancient Mud Core',
        desc: '+3 Mud Armor and complete immunity to contact damage',
        type: 'passive',
        category: 'defense',
        rarity: 'legendary',
        stats: { shields: 3 },
        effects: { contactImmunity: true },
        icon: 'golem_core'
    },
    {
        id: 'freedom_key',
        name: 'The Barnyard Freedom Key',
        desc: 'All locked doors and golden chests open without keys!',
        type: 'passive',
        category: 'utility',
        rarity: 'legendary',
        effects: { infiniteKeys: true },
        icon: 'key_gold'
    }
];

// ============================================================================
// UNIQUE ITEM SYNERGIES
// When player holds specific combinations, a powerful new synergy emerges!
// ============================================================================

const SYNERGIES_DATABASE = [
    {
        id: 'popcorn_flak',
        name: 'Popcorn Flak Cannon',
        desc: 'Tears burst into blooming clusters of explosive, burning popcorn!',
        required: ['crispy_corn', 'spicy_chili'],
        effects: { popcornFlak: true, burning: true },
        bonusStats: { damage: 1.5, tearRate: 0.4 }
    },
    {
        id: 'electrified_sludge',
        name: 'Electrified Sludge',
        desc: 'Mud puddles conduct lethal arcing lightning webs!',
        required: ['thick_mud_ball', 'electric_cattle_prod'],
        effects: { electricMud: true, chainLightning: true },
        bonusStats: { damage: 1.8 }
    },
    {
        id: 'homing_shrapnel',
        name: 'Swarming Seed Missiles',
        desc: 'Apple shrapnel seeds aggressively home in on predators like mini missiles!',
        required: ['barn_owl_feather', 'apple_core_shrapnel'],
        effects: { homingShrapnel: true, homing: true },
        bonusStats: { shotSpeed: 0.2 }
    },
    {
        id: 'divine_seraph',
        name: 'Divine Seraph Pig',
        desc: 'Ascended piglet! Flight + permanent holy beam aura frying nearby foes!',
        required: ['angel_pig_wings', 'holy_halo'],
        effects: { divineAura: true, flying: true },
        bonusStats: { damage: 2.5, speed: 0.3 }
    },
    {
        id: 'thermobaric_slop',
        name: 'Thermobaric Slop Blast',
        desc: 'Chili sparks superheat explosive slop into colossal room-clearing blasts!',
        required: ['spicy_chili', 'nitroglycerin_slop'],
        effects: { megaExplosions: true },
        bonusStats: { damage: 3.5, knockback: 3.0 }
    },
    {
        id: 'pinball_destroyer',
        name: 'Pinball Juggernaut',
        desc: 'Boots + Spring make you bounce violently off walls, completely invulnerable!',
        required: ['bouncy_rubber_boots', 'curly_tail_spring'],
        effects: { pinballMode: true },
        bonusStats: { speed: 0.5, damage: 1.0 }
    },
    {
        id: 'plague_wasp_swarm',
        name: 'Plague Wasp Swarm',
        desc: 'Poisoned enemies that perish burst into a swarm of angry mutant wasps!',
        required: ['rotten_carrot', 'honey_dipper'],
        effects: { corpseWasps: true },
        bonusStats: { damage: 1.2 }
    },
    {
        id: 'harpoon_railgun',
        name: 'Harpoon Railgun',
        desc: 'Supercharged piercing pitchfork spikes pin predators to room walls!',
        required: ['pitchfork_tip', 'gatling_silo_gear'],
        effects: { wallPinHarpoon: true },
        bonusStats: { damage: 1.5, tearRate: 0.5 }
    },
    {
        id: 'midas_snout',
        name: 'Midas Gold Snout',
        desc: 'Truffle Snout shoots gleaming coins! Defeated foes shatter into pure gold!',
        required: ['truffle_snout', 'golden_corn_cob'],
        effects: { midasTouch: true },
        bonusStats: { luck: 3.0, damage: 1.5 }
    },
    {
        id: 'napalm_skid',
        name: 'Napalm Mud Skid',
        desc: 'Slippery grease ignites into scorching walls of defensive fire behind you!',
        required: ['bacon_grease', 'ghost_pepper'],
        effects: { fireTrail: true },
        bonusStats: { speed: 0.3 }
    },
    {
        id: 'barnyard_syndicate',
        name: 'Barnyard Syndicate',
        desc: 'Piglet and Rooster team up, doubling in size and firing synchronized volleys!',
        required: ['little_piglet', 'angry_rooster'],
        effects: { megaFamiliars: true },
        bonusStats: { familiarDamage: 2.0 }
    },
    {
        id: 'wrecking_boulder',
        name: 'Wrecking Pumpkin Boulder',
        desc: 'Enormous spectral pumpkins crush rocks, traps, and predators without stopping!',
        required: ['tractor_tire', 'giant_pumpkin'],
        effects: { wreckingBall: true },
        bonusStats: { damage: 3.0, knockback: 4.0 }
    },
    {
        id: 'tesla_storm_beam',
        name: 'Tesla Storm Beam',
        desc: 'Continuous snout stream transforms into a raging high-voltage lightning laser!',
        required: ['electric_cattle_prod', 'stink_bug_juice'],
        effects: { continuousLightningBeam: true },
        bonusStats: { damage: 2.0 }
    },
    {
        id: 'undying_wrath',
        name: 'Undying Berserker',
        desc: 'Upon revival from the Locket, you gain 10 seconds of invulnerable hyper-rage!',
        required: ['mama_sows_locket', 'heros_red_bandana'],
        effects: { berserkRevival: true },
        bonusStats: { damage: 2.0 }
    },
    {
        id: 'glacial_frostfire',
        name: 'Permafrost Blizzard',
        desc: 'Ice cubes and Ghost Pepper create thermal shock, shattering frozen enemies!',
        required: ['ice_cube_slop', 'ghost_pepper'],
        effects: { thermalShock: true },
        bonusStats: { damage: 2.5 }
    }
];

if (typeof window !== 'undefined') {
    window.PIG_ITEMS = ITEMS_DATABASE;
    window.PIG_SYNERGIES = SYNERGIES_DATABASE;
}
