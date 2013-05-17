/**
 * Represents a single tile on the game map. Currently, a tile contains a single glyph.
 * @param glyph The character representation of this tile
 */

Game.Tile = function(properties) {
    properties = properties || {};

    //Call the glyph constructor with our properties
    Game.Glyph.call(this, properties);

    //Set up tile properties, set to false by default
    this._isWalkable = properties['isWalkable'] || false;
    this._isDiggable = properties['isDiggable'] || false;
};

//Make a tile inherit all the functionality from a Glyph
Game.Tile.extend(Game.Glyph);

//Return all eight neighbors of a tile at the given coordinates
Game.getNeighborPositions = function(x, y) {
    var tiles = [];
    //Generate all possible offsets (8 directions from this tile)
    for (var dX = -1; dX < 2; dX ++) {
        for (var dY = -1; dY < 2; dY ++) {
            //Make sure we don't include the current tile (x=0, y=0)
            if (dX == 0 && dY == 0) {
                continue
            }
            tiles.push({x: x + dX, y: y + dY});
        }
    }
    //Randomize the order, so we don't give precedence to the top left corner
    return tiles.randomize();
}

//Standard getters
Game.Tile.prototype.isWalkable = function() {
    return this._isWalkable;
};

Game.Tile.prototype.isDiggable = function() {
    return this._isDiggable;
};

//Create some basic tiles for floor, wall, and inaccessible
Game.Tile.nullTile = new Game.Tile({});

Game.Tile.floorTile = new Game.Tile({
    character: '.',
    isWalkable: true
});

Game.Tile.wallTile = new Game.Tile({
    character: '#',
    foreground: 'goldenrod',
    isDiggable: false
});

//Create tiles for stairs up and stairs down
Game.Tile.stairsUpTile = new Game.Tile({
    character: '<',
    foreground: 'white',
    isWalkable: true
});

Game.Tile.stairsDownTile = new Game.Tile({
    character: '>',
    foreground: 'white',
    isWalkable: true
});
