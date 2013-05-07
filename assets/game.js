//Define a main game object
var Game = {
    _display: null,
    _current_screen: null,

    _display_width: 80,
    _display_height: 24,

    init: function() {
        //Any necessary initilization will go here
        this._display = new ROT.Display({width:this._display_width, height:this._display_height + 1});

        //Create a helper function for binding an event and sending it to the screen
        var game = this;
        var bindEventToScreen = function(event) {
            //Add an event listener to hande keyboard input
            window.addEventListener(event, function(e) {
                //When an event is recieved, send it to the current screen, if one exists
                if (game._current_screen !== null) {
                    game._current_screen.handleInput(event, e);
                }
            });
        };

        //Bind keyboard events
        bindEventToScreen('keydown');
        //These are not currently being used, but will be in the future
        //bindEventToScreen('keyup');
        //bindEventToScreen('keypress');
    },
    getDisplay: function() {
        //Return the main game display
        return this._display;
    },
    getScreenWidth: function() {
        //Return the width of our viewing screen
        return this._display_width;
    },
    getScreenHeight: function() {
        //Return the height of our viewing screen
        return this._display_height;
    },
    switchScreen: function(screen) {
        //Check if we already have a screen, if we do, notify it that we are exiting
        if (this._current_screen !== null) {
            this._current_screen.exit();
        }

        //Clear the display before rendering our new display
        this.getDisplay().clear();

        //Update the current screen, notify that we are entering it, and then render it
        this._current_screen = screen;
        if (this._current_screen !== null) {
            this._current_screen.enter();
            this.refresh();
        }
    },
    refresh: function() {
        //Clear the screen
        this._display.clear();
        //Redraw the whole screen
        this._current_screen.render(this._display);
    }
};

window.onload = function() {
    //Check if Rot.js will work on this browser
    if (!ROT.isSupported()) {
        alert('Rot.js is not supported by this browser.');
    } else {
        //Initialize the game
        Game.init();
        //Add the display container to our HTML page
        document.body.appendChild(Game.getDisplay().getContainer());
        //Display our first game screen
        Game.switchScreen(Game.Screen.startScreen);
    }
};