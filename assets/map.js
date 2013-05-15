Game.Map = function(tiles, player) {
    this._tiles = tiles;

    //Create a list which will hold all entities present on the map
    this._entities = [];

    //Create an engine instance and a scheduler
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);

    //Get the width, height and depth of the map based on the size of the tiles array
    this._depth = tiles.length;
    this._width = tiles[0].length;
    this._height = tiles[0][0].length;

    //Add the player to the map, on the first level of the dungeon
    this.addEntityAtRandomPosition(player, 0);

    //Add some random fungi to the dungeon on each level
    for (var z = 0; z < this._depth; z ++) {
        for (var i = 0; i <= 25; i ++) {
            this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate), z);
        }
    }
};

//Standard getters
Game.Map.prototype.getWidth = function() {
    return this._width;
};

Game.Map.prototype.getHeight = function() {
    return this._height;
};

Game.Map.prototype.getDepth = function() {
    return this._depth;
}

Game.Map.prototype.getEngine = function() {
    return this._engine;
};

Game.Map.prototype.getEntities = function() {
    return this._entities;
};

Game.Map.prototype.getEntityAt = function(x, y, z) {
    //Iterate through every entity, looking for one with matching coordinates
    for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i].getX() == x && this._entities[i].getY() == y && this._entities[i].getZ() == z) {
            return this._entities[i];
        }
    }
    //We didn't find an entity at the provided coordinates
    return false;
};

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, centerZ, radius) {
    //Get all entities that are within *radius* of a center point (centerX, centerY)
    var results = [];

    //Determine the bounds of our radius
    var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;

    //Iterate through all our entities, adding any that fall witin the bounds of our area
    for (var i = 0; i < this._entities.length; i ++) {
        if (this._entities[i].getX() >= leftX &&
            this._entities[i].getX() <= rightX &&
            this._entities[i].getY() >= topY &&
            this._entities[i].getY() <= bottomY &&
            this._entities[i].getZ() == centerZ) {
            results.push(this._entities[i]);
        }
    }
    return results;
};

//Get the tile at the given coordinates
Game.Map.prototype.getTile = function(x, y, z) {
    //Make sure we are within the bounds of the map, if not return a null tile
    if (x < 0 || x >= this._width || y < 0 || y >=this._height || z < 0 || z >= this._depth) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[z][x][y] || Game.Tile.nullTile;
    }
};

//Dig a tile
Game.Map.prototype.dig = function(x, y, z) {
    //If the tile is diggable, update it to a floor tile
    if (this.getTile(x, y, z).isDiggable()) {
        this._tiles[z][x][y] = Game.Tile.floorTile;
    }
};

//Add an entity to the game map
Game.Map.prototype.addEntity = function(entity) {
    //Make sure the entities position is within the bounds of the map
    if (entity.getX() < 0 || entity.getX() >= this._width ||
        entity.getY() < 0 || entity.getY() >= this._height ||
        entity.getZ() < 0 || entity.getZ() >= this._depth) {
        throw new Error('Adding entity out of bounds.');
    }

    //Update the entity's map
    entity.setMap(this);

    //Add the entity to the list of entities
    this._entities.push(entity);

    //Check if the entity has an actor, if so, add it to the scheduler
    if (entity.hasMixin('Actor')) {
        this._scheduler.add(entity, true);
    }
};

//Add an entity at a random position on the map, useful for quickly populating a dungeon floor
Game.Map.prototype.addEntityAtRandomPosition = function(entity, z) {
    var position = this.getRandomFloorPosition(z);

    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z)

    this.addEntity(entity);
};

//remove an entity from the map. If it had an actor mixin, also remove it from the scheduler
Game.Map.prototype.removeEntity = function(entity) {
    //Find the entity in the list of entities, if it is available
    for (var i =0; i < this._entities.length; i ++) {
        if (this._entities[i] == entity) {
            this._entities.splice(i, 1);
            break;
        }
    }

    //If the entity has an actor mixin, we also need to remove it from the scheduler
    if (entity.hasMixin('Actor')) {
        this._scheduler.remove(entity);
    }
};

//Check if a given tile on the map is empty floor or not
Game.Map.prototype.isEmptyFloor = function(x, y, z) {
    //Check if the tile is floor first, and then if it is empty (no entity on tile)
    return this.getTile(x, y, z) == Game.Tile.floorTile &&
        !this.getEntityAt(x, y, z);
};

//Set a random starting position for the player, ensuring its a floor tile
Game.Map.prototype.getRandomFloorPosition = function(z) {
    //Randomly choose a tile that is floor
    var x, y;
    do {
        x = Math.floor(Math.random()  * this._width);
        y = Math.floor(Math.random() * this._height);
    } while(!this.isEmptyFloor(x, y, z));

    return ({x: x, y: y, z: z});
};