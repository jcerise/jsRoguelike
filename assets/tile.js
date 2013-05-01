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
    isDiggable: true
});
