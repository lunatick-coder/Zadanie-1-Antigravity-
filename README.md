# 🐷 Oink of Isaac: Barnyard Breakout

An authentic 2D retro pixel-art roguelike dungeon crawler inspired by *The Binding of Isaac*, starring a plucky cartoon piglet determined to escape the farm slaughterhouse!

---

## 🎮 How to Play

Simply open `index.html` in any modern web browser (Edge, Chrome, Firefox, Safari).
No installation, external dependencies, or build tools required — the game runs 100% offline using standard HTML5 Canvas and the procedural Web Audio API synthesizer.

### 🕹️ Controls

| Action | Primary Key | Alternative |
|---|---|---|
| **Move Piglet** | `W`, `A`, `S`, `D` | `↑`, `←`, `↓`, `→` (Arrow Keys) |
| **Shoot Tears / Kernels** | `Mouse Aim & Left Click` | `I`, `J`, `K`, `L` (4-Directional) |
| **Use Active Item** | `Spacebar` | *(Fills pips as you clear rooms)* |
| **Place Apple Bomb** | `E` | `Shift` (Destroys rocks, traps & foes) |
| **Item & Synergy Compendium** | `Tab` | `Escape` |
| **Sound / Music Toggle** | HUD Button (Top-Right) | Mute / Unmute audio |

---

## 🌟 Key Features

1. **Cartoonish Pig Protagonist**:
   - Cute pink piglet with floppy ears, curly wiggling tail, and expressive snout.
   - Dynamic visual accessories: as you collect hats, armor, wings, or halos, your piglet visually equips them!

2. **Dungeon Generation (Isaac Style)**:
   - Procedurally generated room grid per floor.
   - Room types: Combat Rooms, Golden Treasure Rooms (free pedestal item), Shop Rooms (Merchant Barnaby), and Skull Boss Rooms.
   - 3 distinct stages:
     - **Floor 1: The Mud Barn** (Wooden planks, hay bales, mud pits, pitchfork traps)
     - **Floor 2: The Haunted Cornfield** (Dense corn stalks, loam trails, bear traps, electric fences)
     - **Floor 3: The Slaughterhouse** (Rusted steel grates, meat hooks, threshing saws, and the final showdown)

3. **55 Unique Contraband Items**:
   - Comprehensive collection of passive upgrades, familiars, dynamic shot modifiers, and active spacebar abilities.

4. **Synergy System**:
   - Items are fully compatible with one another. Holding specific combinations triggers unique **Synergies** with special names, visual effects, and combined superpowers!

5. **Predator Animal AI**:
   - **Sneaky Wolves**: Stalk at distance then make high-speed lunges.
   - **Alpha Direwolves**: Howl, buff pack, and emit tooth projectile shockwaves.
   - **Red Foxes**: Fast erratic lateral movement to flank the pig.
   - **Hunting Coyotes**: Keep distance and spit sharp projectile bones.
   - **Raptor Hawks**: Fly over rocks and traps, swooping down with shadow warnings.
   - **Ferocious Badgers & Rabid Hounds**: Relentless pursuit and high durability.

6. **Epic Boss Battles**:
   - **Floor 1**: *Fang, The Alpha Wolf* (Leaps, summons pups, radial howling shockwave)
   - **Floor 2**: *Sky-Terror, The Apex Hawk* (Feather storm, aerial divebombs)
   - **Floor 3**: *Farmer Grimm (The Butcher)* (Cleaver shockwaves, double-barrel shotgun blasts, enraged berserk speed)

7. **Wandering Merchant**:
   - Meet *Barnaby the Raccoon* in shop rooms to trade collected corn cobs (coins) for Red Apples (healing), Mud Shields (armor), Apple Bombs, Freedom Keys, and rare items.

8. **Interactive Traps**:
   - Retractable Pitchfork Spikes, Bear Traps (snap shut and immobilize), Mud Pits (slow movement), Electric Fences (high-voltage shocks), and Threshing Saw Blades. *Traps can damage both you and predators!*

---

## 📦 Complete Items Catalog (55 Items)

| Item Name | Type | Rarity | Effect |
|---|---|---|---|
| **Golden Apple** | Passive | Rare | +2 Max HP, heals 2 hearts, +1 Luck |
| **Crispy Corn Kernel** | Passive | Common | +0.8 Tear Rate, tears pop on impact |
| **Spicy Red Chili** | Passive | Common | +1.5 Damage, +Speed, tears ignite enemies |
| **Thick Mud Ball** | Passive | Common | +Knockback, slows enemies on hit |
| **Truffle Snout** | Passive | Rare | Smells out secrets, reveals map icons, +3 Luck |
| **Iron Pot Helmet** | Passive | Common | +2 Mud Armor (Shields), head protection |
| **Curly Tail Spring** | Passive | Common | +0.4 Speed, immunity to ground traps |
| **Pitchfork Tip** | Passive | Rare | +1.2 Damage, piercing shots |
| **Rubber Barn Boots** | Passive | Common | Tears bounce off walls, mud walk immunity |
| **Serrated Wolf Claw** | Passive | Rare | +1.0 Damage, causes bleeding damage over time |
| **Barn Owl Feather** | Passive | Rare | Homing tears aggressively curve toward predators |
| **Rotten Carrot** | Passive | Common | Sludge tears poison enemies on contact |
| **Heavy Tractor Tire** | Passive | Rare | Spectral shots that pass through solid rocks |
| **Magic Horseshoe** | Passive | Rare | +4 Luck, predators drop double loot |
| **Mama Sow's Locket** | Passive | Legendary | +2 Max HP, revives piglet once upon death |
| **Electric Cattle Prod** | Passive | Rare | Chain lightning arcs across nearby enemies |
| **Angel Pig Wings** | Passive | Legendary | Flight! Hover over rocks, traps, and pits |
| **Squeal of Terror** | Active (2 Charges) | Common | Terrifies and pushes all room enemies back |
| **Little Piglet** | Familiar | Rare | Loyal brother follows and shoots mini mud pellets |
| **Angry Rooster** | Familiar | Rare | Charges and pecks at nearby predators |
| **Barn Cat** | Familiar | Rare | Collects coins and scratches predators |
| **Fresh Milk Bucket** | Passive | Rare | +1 to All Stats and debuff cleanse |
| **Barn Slingshot** | Passive | Rare | Triple-shot projectile spread |
| **Muddy Cloak** | Passive | Common | +1 Shield, leaves slowing mud puddles behind you |
| **Golden Corn Cob** | Passive | Rare | Money is Power: +Damage per coin held |
| **Explosive Pig Slop** | Passive | Legendary | Tears detonate into fiery explosions on impact |
| **Swamp Mosquito** | Passive | Rare | Chance to restore health on enemy kill |
| **Farmer Straw Hat** | Passive | Common | +1 Shield, protects against falling divebombs |
| **Lard & Bacon Grease** | Passive | Common | Extreme speed boost with slippery evasive slides |
| **Rusty Cowbell** | Passive | Rare | Rings on room enter, stunning enemies for 2s |
| **Super Fertilizer** | Passive | Common | Tears sprout damaging thorn brambles on hit |
| **Four-Leaf Clover** | Passive | Common | +2.5 Luck, better chest drops and shop stock |
| **Farmer's Pocket Watch** | Active (4 Charges) | Rare | Freezes predator time for 5 seconds |
| **Prize Giant Pumpkin** | Passive | Rare | Massive bowling-ball tears with crushing force |
| **Chilled Slop Cubes** | Passive | Rare | Freezing tears turn predators into ice cubes |
| **Wild Honey Jar** | Passive | Rare | Tears stick enemies together and summon bees |
| **Orbiting Hay Bale** | Familiar | Common | Orbits player, blocking enemy bullets |
| **Shepherd Whistle** | Active (3 Charges) | Rare | Calls a stampede of sheep across the room |
| **Stink Bug Extract** | Passive | Rare | Continuous toxic gas stream weapon |
| **Silo Mill Gear** | Passive | Legendary | +2.2 Tear Rate, machine-gun snout |
| **Farmer's Reading Glasses** | Passive | Common | Inspect predator HP numbers, +Range |
| **Ghost Pepper Flakes** | Passive | Rare | Snout emits flaming breath cones |
| **Garden Trowel** | Passive | Common | Digs up food or coins when clearing rooms |
| **Reinforced Horseshoe** | Passive | Common | Ramming enemies deals 8 contact damage |
| **Prize Hen Golden Egg** | Active (5 Charges) | Rare | Crack open for random feast and consumables |
| **Cursed Scarecrow Straw** | Passive | Common | Predators frequently attack straw dummy decoys |
| **Barn Weather Vane** | Passive | Common | High-velocity wind boosts tears forward |
| **Pure Salt Lick** | Passive | Common | +1.4 Damage, enemies salt-dissolve on death |
| **Apple Core Shrapnel** | Passive | Rare | Tears burst into 4 flying seeds on hit |
| **Bessie's Cowbell** | Familiar | Rare | Orbiting brass bell emitting sonic pulses |
| **Hero's Red Bandana** | Passive | Legendary | Berserk! Below 1 heart, triple damage & fire rate |
| **Barnyard King Crown** | Passive | Legendary | +1 All Stats, 50% discount at Barnaby's Shop |
| **Saintly Hog Halo** | Passive | Legendary | Holy light beams smite predators from the sky |
| **Ancient Mud Core** | Passive | Legendary | +3 Shields, complete contact damage immunity |
| **The Barnyard Freedom Key** | Passive | Legendary | All doors and golden chests open without keys |

---

## ⚡ Secret Item Synergies Matrix

When you acquire specific combinations of items, a unique **Synergy Toast** appears, unlocking specialized powers:

| Synergy Name | Recipe Required | Combined Synergy Power |
|---|---|---|
| **Popcorn Flak Cannon** | *Crispy Corn Kernel* + *Spicy Red Chili* | Tears burst into blooming clusters of burning, explosive popcorn! |
| **Electrified Sludge** | *Thick Mud Ball* + *Electric Cattle Prod* | Mud puddles on the ground conduct fatal lightning webs across foes. |
| **Swarming Seed Missiles** | *Barn Owl Feather* + *Apple Core Shrapnel* | Apple shrapnel seeds aggressively home in on enemies like guided missiles. |
| **Divine Seraph Pig** | *Angel Pig Wings* + *Saintly Hog Halo* | Permanent flight + divine holy aura smiting all nearby predators. |
| **Thermobaric Slop Blast** | *Spicy Red Chili* + *Explosive Pig Slop* | Colossal superheated explosions with massive room-clearing radius. |
| **Pinball Juggernaut** | *Rubber Barn Boots* + *Curly Tail Spring* | Bounce violently off walls, completely invulnerable while bouncing! |
| **Plague Wasp Swarm** | *Rotten Carrot* + *Wild Honey Jar* | Poisoned predators burst into angry mutant wasps upon death. |
| **Harpoon Railgun** | *Pitchfork Tip* + *Silo Mill Gear* | Supercharged rapid-fire piercing spikes that pin predators to room walls. |
| **Midas Gold Snout** | *Truffle Snout* + *Golden Corn Cob* | Snout shoots golden coins! Defeated predators shatter into pure gold. |
| **Napalm Mud Skid** | *Lard & Bacon Grease* + *Ghost Pepper Flakes* | Sliding leaves scorching walls of fire that block predator charges. |
| **Barnyard Syndicate** | *Little Piglet* + *Angry Rooster* | Companions double in size and fire synchronized volleys. |
| **Wrecking Pumpkin Boulder** | *Heavy Tractor Tire* + *Prize Giant Pumpkin* | Enormous spectral pumpkins crush rocks, traps, and enemies alike. |
| **Tesla Storm Beam** | *Electric Cattle Prod* + *Stink Bug Extract* | Snout stream transforms into a raging high-voltage lightning laser. |
| **Undying Berserker** | *Mama Sow's Locket* + *Hero's Red Bandana* | Reviving from death grants 10 seconds of invulnerable hyper-rage. |
| **Permafrost Blizzard** | *Chilled Slop Cubes* + *Ghost Pepper Flakes* | Thermal shock shatters frozen predators into icy shrapnel. |

---

## 🏆 Win Condition

1. Fight through **Floor 1 (The Mud Barn)** and defeat *Fang, The Alpha Wolf*.
2. Descend to **Floor 2 (The Haunted Cornfield)** and conquer *Sky-Terror Hawk*.
3. Infiltrate **Floor 3 (The Slaughterhouse)**, defeat **Farmer Grimm (The Butcher)**, and shatter the Farm Exit Gate to achieve **Sweet Barnyard Freedom**!
