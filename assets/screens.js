Game.Screen = {};

Game.Screen.centerText = function(text) {
    //Find the X coordinate needed to center the provided string
    var center = (Game._display_width / 2) - (text.length / 2);
    return center;
};

//Define the intial start screen
Game.Screen.startScreen = {
    enter: function() { console.log("Entered start screen") },
    exit: function() { console.log("Exited start screen")},
    render: function(display) {
        //Render our prompt to the screen
        display.drawText(Game.Screen.centerText("jsRoguelike"), 1, "%c{yellow}jsRoguelike");
        display.drawText(1, 2, "Press [Enter] to start");
        display.drawText(Game.Screen.centerText("By Jeremy Cerise"), Game._display_height - 2, "By Jeremy Cerise");
    },
    handleInput: function(inputType, inputData) {
        //When [enter] is pressed, got to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.playingScreen);
            }
        }
    }
};

//Define the main playing screen
Game.Screen.playingScreen = {
    _map: null,
    exploredTiles: null,
    _player: null,

    enter: function() {
        console.log("Entered playing screen")
        var map = [];
        //Create a map based on the following size parameters
        var mapWidth = 100;
        var mapHeight = 48;
        var depth = 6;

        //Create our maps
        var tiles = new Game.Builder(mapWidth, mapHeight, depth).getTiles();

        //Create the player entity
        this._player = new Game.Entity(Game.PlayerTemplate);

        //Create the map instance for this floor
        this._map = new Game.Map(tiles, this._player);

        //Initialize our explored tiles array
        this._exploredTiles = [];
        for (var i = 0; i < depth; i ++) {
            this._exploredTiles.push(i);
            this._exploredTiles[i] = [];
        }

        //Start the maps engine
        this._map.getEngine().start();
    },
    exit: function() { console.log("Exited playing screen") },
    render: function(display) {
        console.log(this._map);
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();

        //make sure the X axis does not go to the left of the left bound (offscreen)
        var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));

        //Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);

        //Make sure the Y axis does not go above the top bound
        var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));

        //make sure we still have enough space to fill an entire game screen
        topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

        //Calculate the Field of View
        var map = this._map;
        var player = this._player;

        var lightPasses = function(x, y) {
            var tile = map.getTile(x, y, player.getZ());
            if (tile === Game.Tile.floorTile) {
                return true;
            } else {
                return false
            }
        }

        var fov = new ROT.FOV.PreciseShadowcasting(lightPasses);

        //Set which tiles are visible this turn. This gets reset each time the screen is rendered.
        var visibleTiles = [];

        //Compute the field of view, and draw all visible tiles to the screen, in color
        fov.compute(this._player.getX(), this._player.getY(), 5, function(x, y, r, visibility) {
            var tile =  map.getTile(x, y, player.getZ());
            display.draw(
                x - topLeftX,
                y - topLeftY,
                tile.getChar(),
                tile.getForeground(),
                tile.getBackground()
            );
            visibleTiles.push(x+","+y);
        });

        //Now, show only tiles that have already been visited, and display any not in the field of view greyed out
        //Start at our topleft corner, and draw the map according to where the player currently is
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
            for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
                //Fetch the tile at the coordinates, and render it to the screen at the offset position if its valid
                var tile = this._map.getTile(x, y, this._player.getZ());
                if (this._exploredTiles[this._player.getZ()].indexOf(x+","+y) != -1 && visibleTiles.indexOf(x+","+y) == -1) {
                    display.draw(
                        x - topLeftX,
                        y - topLeftY,
                        tile.getChar(),
                        'grey',
                        tile.getBackground()
                    );
                }


            }
        }

        //Dump the visible tiles into the explored tiles array, as we have already viewed them, and they should
        //continue to be shown, but greyed out
        for (var i = 0; i < visibleTiles.length; i ++) {
            if (this._exploredTiles[player.getZ()].indexOf(visibleTiles[i]) == -1) {
                this._exploredTiles[player.getZ()].push(visibleTiles[i]);
            }
        }

        //Render all visible entities
        var entities = this._map.getEntities();
        for (var i = 0; i < entities.length; i ++) {
            var entity = entities[i];

            //Only render this entity if they would show up on the screen and are visible in the current FOV
            if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
                entity.getX() < topLeftX + screenWidth &&
                entity.getY() < topLeftY + screenHeight &&
                entity.getZ() == this._player.getZ() &&
                visibleTiles.indexOf(entity.getX()+","+entity.getY()) != -1) {
                //Draw the entity to the screen
                display.draw(
                  entity.getX() - topLeftX,
                  entity.getY() - topLeftY,
                  entity.getChar(),
                  entity.getForeground(),
                  entity.getBackground()
                );
            }
        }

        //Get all messages in the players message queue, and render them to the screen
        var messages = this._player.getMessages();
        var messageY = 0;

        for (var i = 0; i < messages.length; i ++) {
            //Draw each message, adding the number of lines
            messageY += display.drawText(0, messageY, '%c{white}%b{black}' + messages[i]);
        }

        //Render the players HP in a status bar at the bottom of the screen
        var stats = '%c{white}%b{black}';
        stats += vsprintf('HP: %d/%d ', [this._player.getHp(), this._player.getMaxHp()]);
        display.drawText(0, screenHeight, stats);
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                //For the time being, if the enter key is pressed, regenerate the map
                Game.switchScreen(Game.Screen.playingScreen);
            }

            //Movement keys, just arrow keys for now
            //TODO: Change out to standard VIM keys for movement
            if (inputData.keyCode === ROT.VK_LEFT) {
                this.move(-1, 0, 0);
            } else if (inputData.keyCode === ROT.VK_RIGHT) {
                this.move(1, 0, 0);
            } else if (inputData.keyCode === ROT.VK_UP) {
                this.move(0, -1, 0);
            } else if (inputData.keyCode === ROT.VK_DOWN) {
                this.move(0, 1, 0);
            } else {
                //No valid key was pressed
                return;
            }

            //Unlock the engine
            this._map.getEngine().unlock();

        } else if (inputType == 'keypress') {
            var keyChar = String.fromCharCode(inputData.charCode);
            if (keyChar === '>') {
                this.move(0, 0, 1);
            } else if (keyChar === '<') {
                this.move(0, 0, -1);
            } else {
                //Not a valid keypress
                return;
            }

            //Unlock the engine
            this._map.getEngine().unlock();
        }
    },
    move: function(dX, dY, dZ) {
        //Move an entity the specified amount
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newZ = this._player.getZ() + dZ;

        //Try and move to the new coordinates specified by dX, dY
        this._player.tryMove(newX, newY, newZ, this._map)

    }

};