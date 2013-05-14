Game.Builder = function(width, height, depth) {
    this._width = width;
    this._height = height;
    this._depth = depth;

    this._tiles = new Array(depth);

    //Each seperate piece of the dungeon (mostly used on cave levels) will have a region. This will ensure that the
    //player can reach each area of the cave via stairs
    this._regions = new Array(depth);

    //Instatiate the tile and region arrays to be multi-dimensional
    for (var z = 0; z < depth; z ++) {
        //Create a new dungeon floor at each level
        this._tiles[z] =  this._generateLevel();
        //Set up the region array for each depth level
        this._regions[z] = new Array(width);
        for (var x = 0; x < width; x ++) {
            this._regions[x][z] = new Array(height);

            //Fill with zeroes, we'll set the regions accordingly later. Zero means the tile is never reachable. Later
            //This will be replaced with the region number if the tile is walkable
            for (var y = 0; y < height; y ++) {
                this._region[z][x][y] = 0;
            }
        }
    }
};

//Generate a single Z -level map
Game.Builder.prototype._generateLevel = function() {
    //Create an empty Map
    var map = new Array(this._width);
    for (var w = 0; w < this._width; w ++) {
        map[w] = new Array(this._height);
    }

    //Setup our map generator, currently, I'm just using the built in generators from Rot.js
    var mapConfig = {
        roomWidth: [4, 16],
        roomHeight: [4, 16]
    };
    var generator = new ROT.Map.Digger(this._width, this._height, mapConfig);

    generator.create(function(x, y, v) {
        if (v === 0) {
            map[x][y] = Game.Tile.floorTile;
        } else {
            map[x][y] = Game.Tile.wallTile
        }
    });

    return map;
}

//Helper method to make sure a tile can be added to a region
Game.Builder.prototype._canFillRegion = function(x, y, z) {
    //Make sure the tile is within bounds first
    if (x < 0 || y < 0 || z < 0 || x >= this._width ||
        y >= this._height || z >= this._depth) {
        return false;
    }

    //Make sure the tile doesn't already have a region
    if (this._regions[z][x][y] != 0) {
        return false;
    }

    //Make sure the tile is walkable
    return this._tiles[z][x][y]._isWalkable();
};

//Flood fill implementation. Check all neighbors of a given tile, and try and fill them in (add them to a region)
Game.Builder.prototype._fillRegion = function(region, x, y, z) {
    var tilesFilled = 1;
    var tiles = [{x: x, y: y}];
    var tile;
    var neighbors;

    //Update the region of the original tile
    this._regions[z][x][y] = region;

    //Loop through each tile that is walkable and reachable by the starting tile
    while (tiles.length > 0) {
        tile = tiles.pop();
        //Get all the neighbors of the tile
        neighbors = Game.getNeighborPositions(tile.x, tile.y);
        //Iterate through each neighbor, check if it can be filled. If it can be, add it to the region, and add it
        //to the list of tiles to be processed
        while (neighbors.length > 0) {
            tile = neighbors.pop();
            if (this._canFillRegion(tile.x, tile.y, z)) {
                this._regions[z][tile.x][tile.y] = region;
                tiles.push(tile);
                tilesFilled ++;
            }
        }
    }
    return tilesFilled;
};

//Remove a region (its too small, doesnt overlap deeper regions) by replacing all its tiles with wall
Game.Builder.prototype._removeRegion = function(region, z) {
    for (var x = 0; x < this._width; x ++) {
        for (var y = 0; y < this._height; y ++) {
            if (this._regions[z][x][y] == region) {
                //Clear the region and set the tile to be a wall
                this._regions[z][x][y] = 0;
                this._tiles[z][x][y] = Game.Tile.wallTile;
            }
        }
    }
};

Game.Builder.prototype._setupRegions = function(z) {
    var region = 1;
    var tilesFilled;

    //Iterate through each tile, looking for one that can used as a starting point for a flood fill
    for (var x = 0; x < this._width; x ++) {
        for (var y = 0; y < this._height; y ++) {
            if (this._canFillRegion(x, y, z)) {
                //Try to fill the tile
                tilesFilled = this._fillRegion(region, x, y, z);

                //If the region is too small (< 20 tiles) remove it
                if (tilesFilled <= 20) {
                    this._removeRegion(region, z);
                } else {
                    //The region was large enough, so move onto the next region
                    region ++;
                }
            }
        }
    }
}