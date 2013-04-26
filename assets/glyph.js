Game.Glyph = function(chr, foreground, background) {
    //Instantiate properties to defaults if they aren't provided
    this._char = chr || ' ';
    this._foreground = foreground || 'white';
    this._background = background || 'black';
};

//Getters for the glyphs
Game.Glyph.prototype.getChar = function() {
    return this._char;
};

Game.Glyph.prototype.getBackground = function() {
    return this._background;
};

Game.Glyph.prototype.getForeground = function() {
    return this._foreground;
};