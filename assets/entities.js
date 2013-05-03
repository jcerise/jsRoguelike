Game.Mixins = {};

//Mixins

//Define a Moveable mixin. This will try and move the entity in the given direction
Game.Mixins.Moveable = {
    name: 'Moveable',
    tryMove: function(x, y, map) {
        var tile = map.getTile(x, y);

        //Check to see if there is an entity at the desired coordinates
        //If there is, don't allow movement
        var target = map.getEntityAt(x, y);

        if (target) {
            return false;
        }

        //Check if the tile about to be moved onto is walkable
        if (tile.isWalkable()) {
            //Update the entities position, as this is a valid tile to move onto
            this._x = x;
            this._y = y;
            return true;
        } else {
            //if the tile is not walkable, but is diggable, dig the tile and move onto it
            map.dig(x, y);
            return true;
        }
        //The tile is not walkable or diggable, and cannot be moved onto
        return false;
    }
}

//Main players actor mixin
Game.Mixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
        //Re-render the game screen
        Game.refresh();

        //Lock the engine and wait asynchronously for the player to hit a key
        this.getMap().getEngine().lock();
    }
}

//Fungus actor mixin
Game.Mixins.FungusActor = {
    name: 'FungusActor',
    groupName: 'Actor',
    act: function() { }
}

//Entities

//Define our main player entity template
//TODO: move out of Game namespace
Game.PlayerTemplate = {
    character: '@',
    foreground: 'white',
    background: 'black',
    mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor]
}

//Define a template for a Fungus
Game.FungusTemplate = {
    character: 'F',
    foreground: 'green',
    mixins: [Game.Mixins.FungusActor]
}


