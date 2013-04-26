/**
 * Represents a single tile on the game map. Currently, a tile contains a single glyph.
 * @param glyph The character representation of this tile
 */

Game.Tile = function(glyph) {
    this._glyph = glyph;
};

Game.Tile.prototype.getGlyph = function() {
    return this._glyph;
};

//Create some basic tiles for floor, wall, and inaccessible
Game.Tile.nullTile = new Game.Tile(new Game.Glyph());
Game.Tile.floorTile = new Game.Tile(new Game.Glyph('.'));
Game.Tile.wallTile = new Game.Tile(new Game.Glyph('#', 'goldenrod'));
