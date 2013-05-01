Game.Map = function(tiles) {
    this._tiles = tiles;

    //Get the width and height of the map based on the size of the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
};

//Standard getters
Game.Map.prototype.getWidth = function() {
    return this._width;
};

Game.Map.prototype.getHeight = function() {
    return this._height;
};

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

//Set a random starting position for the player, ensuring its a floor tile
Game.Map.prototype.getRandomFloorPosition = function() {
    //Randomly choose a tile that is floor
    var x, y;
    do {
        x = Math.floor(Math.random()  * this._width);
        y = Math.floor(Math.random() * this._height);
    } while(this.getTile(x, y) != Game.Tile.floorTile);

    return ({x: x, y: y});
}