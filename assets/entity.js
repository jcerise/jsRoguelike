Game.Entity = function(properties) {
    properties = properties || {};

    //Call the Glyph constructor with our properties
    Game.Glyph.call(this, properties);

    //Instantiate any properties from the passed object
    this._name = properties['name'] || '';
    this._x = properties['x'] || 0;
    this._y = properties['y'] || 0;

    //Create an object that will keep track of what mixins are attached to this entity, based on the mixin name
    this._attachedMixins = {};

    //Setup the objects Mixins
    var mixins = properties['mixins'] || [];
    for (var i = 0; i < mixins.length; i++) {
        //Copy over all properties from each mixin, ignoring the name and init properties
        //Also, make sure the property does not already exist for this entity
        for (var key in mixins[i]) {
            if (key != 'init' && key != 'init' && !this.hasOwnProperty(key)) {
                this[key] = mixins[i][key];
            }
        }

        //Add the name of this mixin to our attachedMixin list
        this._attachedMixins[mixins[i].name] = true;

        //Finally, call the mixin init function, if there is one
        if (mixins[i].init) {
            mixins[i].init.call(this, properties);
        }
    }
};

//Make an Entity inherit all the functionality of a Glyph
Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.hasMixin = function(obj) {
    //Allow for passing the mixin itself, or the name of the mixin
    if (typeof obj == 'object') {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[obj];
    }
};

//Standard Getters and Setters
Game.Entity.prototype.setName = function(name) {
    this._name = name;
};

Game.Entity.prototype.setX = function(x) {
    this._x = x;
};

Game.Entity.prototype.setY = function(y) {
    this._y = y;
};

Game.Entity.prototype.getName = function() {
    return this._name;
};

Game.Entity.prototype.getX = function() {
    return this._x;
};

Game.Entity.prototype.getY = function() {
    return this._y;
};