Game.Mixins = {};

//Mixins

//Define a Moveable mixin. This will try and move the entity in the given direction
Game.Mixins.Moveable = {
    name: 'Moveable',
    tryMove: function(x, y, map) {
        var tile = map.getTile(x, y);

        //Check to see if there is an entity at the desired coordinates
        //If there is, check if entity can attack. If it can, attack the target
        var target = map.getEntityAt(x, y);

        if (target) {
            //Check to make sure entity is an attacker
            if (this.hasMixin('Attacker')) {
                //Entity can attack, so attempt an attack on the target
                this.attack(target);
                return true;
            } else {
                //We can't attack, so we can't move onto the tile either, so do nothing
                return false;
            }
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

//Attacker mixin - defines an entity that can attack destructible entities
Game.Mixins.SimpleAttacker = {
    name: 'SimpleAttacker',
    groupName: 'Attacker',
    attack: function(target) {
        //only attack an entity that is destructible
        if (target.hasMixin('Destructible')) {
            target.takeDamage(this, 1);
        }
    }
}

//Destructible mixin - defines an entity that can be destroyed. Provides hit points and a method to take damage
Game.Mixins.Destructible = {
    name: 'Destructible',
    init: function() {
        this._hp = 1;
    },
    takeDamage: function(attacker, damage) {
        this._hp -= damage;
        //If hp drops to 0 or below, this entity is destroyed, remove it from the game
        if (this._hp <= 0) {
            this.getMap().removeEntity(this);
        }
    }
}

//Main players actor mixin
Game.Mixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
        //When the scheduler gets to the player, redraw the screen to reflect all other actors, and let the player
        //make an action

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
    init: function() {
        //Each fungus can only grow x times
        this._growthsRemaining = 5;
    },
    act: function() {
        //Make the fungus grow randomly, slowly spreading to adjacent tiles if not contained

        //First, check to see if this fungus can grow anymore
        if (this._growthsRemaining > 0) {
            //Give a two percent chance of growth
            if (Math.random() <= 0.01) {
                //This fungus is growing this turn, so find a random adjacent tile for it to grow to
                //This is done by choosing a random number between -1 and 1 for x and y, and applying those
                //to the current entity coordinates
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;

                //Make sure this fungus isnt trying to spawn on itself
                if (xOffset != 0 || yOffset != 0) {
                    //Check to make sure an entity can legally occupy the chosen tile
                    if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset)) {
                        //Everything is good, spawn a new fungus
                        var entity = new Game.Entity(Game.FungusTemplate);
                        entity.setX(this.getX() + xOffset);
                        entity.setY(this.getY() + yOffset);
                        this.getMap().addEntity(entity);
                        this._growthsRemaining --;
                    }
                }
            }
        }
    }
}

//Entities

//Define our main player entity template
//TODO: move out of Game namespace
Game.PlayerTemplate = {
    character: '@',
    foreground: 'white',
    background: 'black',
    mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor, Game.Mixins.Destructible, Game.Mixins.SimpleAttacker]
}

//Define a template for a Fungus
Game.FungusTemplate = {
    character: 'F',
    foreground: 'green',
    mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
}


