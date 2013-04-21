//Check if Rot.js will work with this browser
if (!ROT.isSupported()) {
    alert("The Rot.js library is not supported by your browser.");
} else {
    //Rot.js is supported

    //First, we need to create a display. This will be 80 characters wide and 20 characters tall
    var display = new ROT.Display({width:80, height:20});
    var container = display.getContainer();

    //Append the container to our HTML page
    document.body.appendChild(container);

    var foreground, background, colors

    //Iterate 15 times printing some test text
    for (var i = 0; i < 15; i ++) {
        //Calculate the foreground color getting progressively darker,
        //And the background color getting progressively lighter
        foreground = ROT.Color.toRGB([255 - (i * 40),
                                      255 - (i * 20),
                                      255 - (i * 20)]);

        background = ROT.Color.toRGB([i * 20, i * 20, i * 20]);

        //Create the color format specifier
        colors = "%c{" + foreground + "}%b{" + background + "}";

        //Draw the text at column 2 and row 1
        display.drawText(2, i, colors + "Hello world!");
    }
}