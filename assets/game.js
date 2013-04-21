//Define a main game object
var Game = {
    _display: null,
    init: function() {
        //Any necessary initilization will go here
        this._display = new ROT.Display({width:80, height:24});
    },
    getDisplay: function() {
        //Return the main game display
        return this._display;
    }
}

window.onload = function() {
    //Check if Rot.js will work on this browser
    if (!ROT.isSupported()) {
        alert('Rot.js is not supported by this browser.');
    } else {
        //Initialize the game
        Game.init();
        //Add the display container to our HTML page
        document.body.appendChild(Game.getDisplay().getContainer());
    }
}