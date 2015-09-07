function MakeGrid(height, width) {
  var grid = [];
  for (var i = 0; i < height; ++i) {
    var curr = [];
    for (var j = 0; j < width; ++j) {
      curr.push(0);
    }
    grid.push(curr);
  }
  return grid;
}

function Conway(height, width) {
  this.width = width;
  this.height = height;
  this.grid = MakeGrid(height, width);
}

Conway.prototype.Step = function() {
  /*
   * Any live cell with fewer than two live neighbours dies, as if caused by under-population.
   * Any live cell with two or three live neighbours lives on to the next generation.
   * Any live cell with more than three live neighbours dies, as if by overcrowding.
   * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
   */
  var new_grid = MakeGrid(this.height, this.width);
  for (var i = 0; i < this.height; ++i) {
    for (var j = 0; j < this.width; ++j) {
      var neighbors = this._GetNeighbors(i,j);
      var live = this.grid[i][j]
      if (live) {
        if (neighbors < 2) {
          new_grid[i][j] = 0;
        } else if (neighbors < 4) {
          new_grid[i][j] = this.grid[i][j] + 1;
        } else {
          new_grid[i][j] = 0;
        }
      } else {
        if (neighbors == 3) {
          new_grid[i][j] = 1;
        } else {
          new_grid[i][j] = 0;
        }
      }
    }
  }
  this.grid = new_grid;
};

Conway.prototype.PrintGrid = function(true_char, false_char) {
  for (var i = 0; i < this.height; ++i) {
    var line = "";
    for (var j = 0; j < this.width; ++j) {
      line += this.grid[i][j] ? true_char : false_char;
    }
    console.log(line);
  }
};

Conway.prototype._GetNeighbors = function(i,j) {
  var num_neighbors = 0;
  if (this.grid[(i+1) % this.height][j]) {++num_neighbors;}
  if (this.grid[(this.height + i - 1) % this.height][j]) {++num_neighbors;}
  if (this.grid[i][(j+1) % this.width]) {++num_neighbors;}
  if (this.grid[i][(this.width + j - 1) % this.width]) {++num_neighbors;}
  if (this.grid[(i+1) % this.height][(j+1) % this.width]) {++num_neighbors;}
  if (this.grid[(i+1) % this.height][(this.width + j - 1) % this.width]) {++num_neighbors;}
  if (this.grid[(this.height + i - 1) % this.height][(j+1) % this.width]) {++num_neighbors;}
  if (this.grid[(this.height + i - 1) % this.height][(this.width + j - 1) % this.width]) {++num_neighbors;}
  return num_neighbors;
};
Conway.prototype.Toggle = function(i,j) {
  if (this.grid[i][j]) {
    this.grid[i][j] = 0;
  } else {
    this.grid[i][j] = 1;
  }
};
Conway.prototype.Set = function(i,j, v) {
  if (v) {
    this.grid[i][j] = 1;
  } else {
    this.grid[i][j] = 0;
  }
};
Conway.prototype.Get = function(i,j) {
  return this.grid[i][j];
}
Conway.prototype.RandomInit = function(p) {
  for (var i = 0; i < this.height; ++i) {
    for (var j = 0; j < this.width; ++j) {
      if (Math.random() <= p) {
        this.Toggle(i,j);
      }
    }
  }
}
