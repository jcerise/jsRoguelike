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
    _map : null,

    enter: function() {
        var map = [];
        for (var x = 0;  x < Game._display_width; x++) {
            //Create the nested array for the y values
            map.push([]);
            //Add all tile to the array
            for (var y = 0; y > Game._display_height; y++) {
                map[x].push(Game.Tile.nullTile);
            }
        }

        //Setup our map generator, currently, I'm just using the built in generators from Rot.js
        var generator = new ROT.Map.Rogue(Game._display_width, Game._display_height);

        generator.create(function(x, y, v) {
           if (v === 0) {
               map[x][y] = Game.Tile.floorTile;
           } else {
               map[x][y] = Game.Tile.wallTile
           }
        });

        this._map = new Game.Map(map);
    },
    exit: function() { console.log("Exited playing screen") },
    render: function(display) {
        //Iterate through all of our map cells
        for (var x = 0; x < this._map.getWidth(); x++) {
            for (var y = 0; y < this._map.getHeight(); y++) {
                //Fetch the glyph for the tile and render it to the screen
                var glyph = this._map.getTile(x, y).getGlyph();
                display.draw(x, y, glyph.getChar(), glyph.getForeground(), glyph.getBackground());
            }
        }
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                //For the time being, if the enter key is pressed, regenerate the map
                Game.switchScreen(Game.Screen.playingScreen);
            }
        }
    }
};