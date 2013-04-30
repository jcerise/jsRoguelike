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
    _rooms: null,
    _centerX: 0,
    _centerY: 0,

    enter: function() {
        console.log("Entered playing screen")
        var map = [];
        //Create a map based on the following size parameters
        var mapWidth = 150;
        var mapHeight = 150;

        for (var x = 0;  x < mapWidth; x++) {
            //Create the nested array for the y values
            map.push([]);
            //Add all tile to the array
            for (var y = 0; y > mapHeight; y++) {
                map[x].push(Game.Tile.nullTile);
            }
        }

        //Setup our map generator, currently, I'm just using the built in generators from Rot.js
        var mapConfig = {
            roomWidth: [4, 16],
            roomHeight: [4, 16]
        };
        var generator = new ROT.Map.Digger(mapWidth, mapHeight, mapConfig);

        generator.create(function(x, y, v) {
           if (v === 0) {
               map[x][y] = Game.Tile.floorTile;
           } else {
               map[x][y] = Game.Tile.wallTile
           }
        });

        this._map = new Game.Map(map);
        this._rooms = generator.getRooms();

        //Set the cursor to the starting position, in this case, the very first room to be generated
        var startX = this._rooms[0].getCenter()[0];
        var startY = this._rooms[0].getCenter()[1];
        this.move(startX, startY);
    },
    exit: function() { console.log("Exited playing screen") },
    render: function(display) {
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();

        //make sure the X axis does not go to the left of the left bound (offscreen)
        var topLeftX = Math.max(0, this._centerX - (screenWidth / 2));

        //Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);

        //Make sure the Y axis does not go above the top bound
        var topLeftY = Math.max(0, this._centerY - (screenHeight / 2));

        //make sure we still have enough space to fill an entire game screen
        topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

        //Iterate through all visible map cells and render them
        //Start at our topleft corner, and draw the map according to where the player currently is
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
            for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
                //Fetch the glyph for the tile, and render it to the screen at the offset position
                var glyph = this._map.getTile(x, y).getGlyph();
                display.draw(
                    x - topLeftX,
                    y - topLeftY,
                    glyph.getChar(),
                    glyph.getForeground(),
                    glyph.getBackground()
                );
            }
        }

        //Render a player shaped cursor for the time being, starting in the first room to be generated
        display.draw(
            this._centerX - topLeftX,
            this._centerY - topLeftY,
            '@',
            'white',
            'black'
        );
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
                this.move(-1, 0);
            } else if (inputData.keyCode === ROT.VK_RIGHT) {
                this.move(1, 0);
            } else if (inputData.keyCode === ROT.VK_UP) {
                this.move(0, -1);
            } else if (inputData.keyCode === ROT.VK_DOWN) {
                this.move(0, 1);
            }
        }
    },
    move: function(dX, dY) {
        //Move the cursor the specified amount
        //Make sure our cursor does not go out of bounds from the map width and height
        this._centerX = Math.max(0, Math.min(this._map.getWidth() - 1, this._centerX + dX));
        this._centerY = Math.max(0, Math.min(this._map.getHeight() - 1, this._centerY + dY));
    }

};