Game.Mixins = {};

Game.sendMessage = function(recipient, message, args) {
    //Make sure the recipient can recieve the message before doing any processing
    if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
        //If args were passed, then we can format the message, otherwise, no formatting will be used
        if (args) {
            message = vsprintf(message, args);
        }
        recipient.recieveMessage(message);
    }
};

Game.sendMessageNearby = function(map, centerX, centerY, radius, message, args) {
    //Send a message to every entity nearby and capable of receiving messages

    //If args were passed, then we can format the message, otherwise, no formatting will be used
    if (args) {
        message = vsprintf(message, args);
    }

    //Get all nearby entities
    var entities = map.getEntitiesWithinRadius(centerX, centerY, radius);

    //Iterate through every nearby entity, sending the message to each one capable of receiving it
    for (var i = 0; i < entities.length; i ++) {
        if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
            entities[i].recieveMessage(message);
        }
    }

};

//=======================
//===== Mixins
//=======================

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
};

//Attacker mixin - defines an entity that can attack destructible entities
Game.Mixins.Attacker = {
    name: 'Attacker',
    groupName: 'Attacker',
    init: function(template) {
      this._attackValue = template['attackValue'] || 1;
    },
    getAttackValue: function() {
      return this._attackValue;
    },
    attack: function(target) {
        //If the target is destructible, calculate the damage of the attack by subtracting attack from defense
        if (target.hasMixin('Destructible')) {
            var attack = this.getAttackValue();
            var defense = target.getDefenseValue();
            var max = Math.max(0, attack - defense);
            var damage = 1 + Math.floor(Math.random() * max);

            //Send a message to attacker, informing them of damage done to target
            Game.sendMessage(this, 'You strike the %s for  %d damage!', [target.getName(), damage]);

            //Send a message to the target, informing them of damage dealt to them
            Game.sendMessage(target, 'The %s strikes you for %d damage!', [this.getName(), damage]);

            target.takeDamage(this, damage);
        }
    }
};

//Destructible mixin - defines an entity that can be destroyed. Provides hit points and a method to take damage
Game.Mixins.Destructible = {
    name: 'Destructible',
    init: function(template) {
        this._maxHp = template['maxHp'] || 10;
        //We'll set HP from the template, in case an entity needs to start with less than their max HP value
        this._hp = template['hp'] || this._maxHp;
        //Define our defense, default of 0
        this._defenseValue = template['defenseValue'] || 0;
    },
    getHp: function() {
        return this._hp;
    },
    getMaxHp: function() {
        return this._maxHp;
    },
    getDefenseValue: function() {
        return this._defenseValue;
    },
    takeDamage: function(attacker, damage) {
        this._hp -= damage;
        //If hp drops to 0 or below, this entity is destroyed, remove it from the game
        if (this._hp <= 0) {
            Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            Game.sendMessage(this, 'You were killed by %s!', [attacker.getName()]);
            this.getMap().removeEntity(this);
        }
    }
};

//Message Recipient Mixin - Allows an entity to recieve messages, which will be displayed on the screen
Game.Mixins.MessageRecipient = {
    name: 'MessageRecipient',
    init: function(template) {
        this._messages = [];
    },
    recieveMessage: function(message) {
        this._messages.push(message);
    },
    getMessages: function() {
        return this._messages;
    },
    clearMessages: function() {
        this._messages = [];
    }
};

//===========================
//====== Actors
//===========================

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

        //Clear the message queue, as all messages have been rendered to the screen
        this.clearMessages();
    }
};

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

                        //Broadcast a message to all nearby entities alerting them to the growth
                        Game.sendMessageNearby(this.getMap(), entity.getX(), entity.getY(),
                            5, 'The fungus is spreading!');
                    }
                }
            }
        }
    }
};

//==========================
//===== Templates
//==========================

//Define our main player entity template
//TODO: move out of Game namespace
Game.PlayerTemplate = {
    character: '@',
    foreground: 'white',
    maxHp: 40,
    attackValue: 10,
    mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor,
             Game.Mixins.Destructible, Game.Mixins.Attacker,
             Game.Mixins.MessageRecipient]
};

//Define a template for a Fungus
Game.FungusTemplate = {
    name: 'fungus',
    character: 'F',
    foreground: 'green',
    maxHp: 10,
    mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
};


