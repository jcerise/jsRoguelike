Game.Screen = {};

//Define the intial start screen
Game.Screen.startScreen = {
    enter: function() { console.log("Entered start screen") },
    exit: function() { console.log("Exited start screen")},
    render: function(display) {
        //Render our prompt to the screen
        var center = (Game._display_width / 2);
        display.drawText(center - ("jsRoguelike".length / 2), 1, "%c{yellow}jsRoguelike");
        display.drawText(1, 2, "Press [Enter] to start");
        display.drawText(center - ("By Jeremy Cerise".length / 2), Game._display_height - 2, "By Jeremy Cerise");
    },
    handleInput: function(inputType, inputData) {
        //When [enter] is pressed, got to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                console.log("Game started");
            }
        }
    }
}