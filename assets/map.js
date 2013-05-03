Game.Map = function(tiles, player) {
    this._tiles = tiles;

    //Create a list which will hold all entities present on the map
    this._entities = [];

    //Create an engine instance and a scheduler
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);

    //Get the width and height of the map based on the size of the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;

    //Add the player to the map
    this.addEntityAtRandomPosition(player);

    //Add some random fungi to the dungeon
    for (var i = 0; i <= 1000; i ++) {
        this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate));
    }
};

//Standard getters
Game.Map.prototype.getWidth = function() {
    return this._width;
};

Game.Map.prototype.getHeight = function() {
    return this._height;
};

Game.Map.prototype.getEngine = function() {
    return this._engine;
};

Game.Map.prototype.getEntities = function() {
    return this._entities;
}

Game.Map.prototype.getEntityAt = function(x, y) {
    //Iterate through every entity, looking for one with matching coordinates
    for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i].getX() == x && this._entities[i].getY() == y) {
            return this._entities[i];
        }
    }
    //We didn't find an entity at the provided coordinates
    return false;
}

//Get the tile at the given coordinates
Game.Map.prototype.getTile = function(x, y) {
    //Make sure we are within the bounds of the map, if not return a null tile
    if (x < 0 || x >= this._width || y < 0 || y >=this._height) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[x][y] || Game.Tile.nullTile;
    }
};

//Dig a tile
Game.Map.prototype.dig = function(x, y) {
    //If the tile is diggable, update it to a floor tile
    if (this.getTile(x, y).isDiggable()) {
        this._tiles[x][y] = Game.Tile.floorTile;
    }
}

//Add an entity to the game map
Game.Map.prototype.addEntity = function(entity) {
    //Make sure the entities position is within the bounds of the map
    if (entity.getX() < 0 || entity.getX() >= this._width ||
        entity.getY() < 0 || entity.getY() >= this._height) {
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
}

//Add an entity at a random position on the map, useful for quickly populating a dungeon floor
Game.Map.prototype.addEntityAtRandomPosition = function(entity) {
    var position = this.getRandomFloorPosition();

    entity.setX(position.x);
    entity.setY(position.y);

    this.addEntity(entity);
}

//Set a random starting position for the player, ensuring its a floor tile
Game.Map.prototype.getRandomFloorPosition = function() {
    //Randomly choose a tile that is floor
    var x, y;
    do {
        x = Math.floor(Math.random()  * this._width);
        y = Math.floor(Math.random() * this._height);
    } while(this.getTile(x, y) != Game.Tile.floorTile || this.getEntityAt(x, y));

    return ({x: x, y: y});
}