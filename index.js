(function() {
  var $, blockCols, blockRows, blockSize, blockTypeCount, canvas, checkLevel, colors, drawBoom, drawLevel, drawSelected, firstClick, generateLevel, height, level, levelDown, onClick, score, width;

  width = 1000;

  height = 800;

  blockCols = 8;

  blockRows = 10;

  blockSize = 75;

  colors = ["#800", "#080", "#008", "#880", "#088", "#808", "#888"];

  blockTypeCount = colors.length;

  level = [];

  score = 0;

  canvas = document.createElement("canvas");

  canvas.width = width;

  canvas.height = height;

  document.body.appendChild(canvas);

  $ = canvas.getContext("2d");

  generateLevel = function() {
    var blockType, flag, flag1, flag2, g, i, row, _i, _j, _results;
    level = [];
    _results = [];
    for (i = _i = 0; 0 <= blockRows ? _i < blockRows : _i > blockRows; i = 0 <= blockRows ? ++_i : --_i) {
      row = [];
      for (g = _j = 0; 0 <= blockCols ? _j < blockCols : _j > blockCols; g = 0 <= blockCols ? ++_j : --_j) {
        flag = true;
        while (flag) {
          blockType = Math.floor(blockTypeCount * Math.random());
          flag1 = g >= 2 ? (blockType === row[g - 1]) && (blockType === row[g - 2]) : false;
          flag2 = i >= 2 ? (blockType === level[i - 1][g]) && (blockType === level[i - 2][g]) : false;
          flag = flag1 || flag2;
        }
        row.push(blockType);
      }
      _results.push(level.push(row));
    }
    return _results;
  };

  drawLevel = function() {
    var blockType, g, i, _i, _j;
    $.clearRect(0, 0, width, height);
    $.beginPath();
    for (i = _i = 0; 0 <= blockRows ? _i < blockRows : _i > blockRows; i = 0 <= blockRows ? ++_i : --_i) {
      for (g = _j = 0; 0 <= blockCols ? _j < blockCols : _j > blockCols; g = 0 <= blockCols ? ++_j : --_j) {
        blockType = level[i][g];
        $.fillStyle = colors[blockType];
        $.fillRect(g * (5 + blockSize), i * (5 + blockSize), blockSize, blockSize);
      }
    }
    $.beginPath();
    $.fillStyle = "#000";
    $.font = "22px Verdana";
    $.textBaseline = "top";
    return $.fillText("Score: " + score, (blockSize + 5) * blockCols + 10, 30);
  };

  generateLevel();

  drawLevel();

  firstClick = false;

  drawSelected = function() {
    if (!firstClick) {
      return;
    }
    $.strokeStyle = "#F00";
    $.lineWidth = 7;
    $.beginPath();
    $.rect(firstClick[0] * (blockSize + 5), firstClick[1] * (blockSize + 5), blockSize, blockSize);
    return $.stroke();
  };

  checkLevel = function() {
    var arr, count, g, i, _i, _j;
    for (i = _i = 0; 0 <= blockRows ? _i < blockRows : _i > blockRows; i = 0 <= blockRows ? ++_i : --_i) {
      for (g = _j = 0; 0 <= blockCols ? _j < blockCols : _j > blockCols; g = 0 <= blockCols ? ++_j : --_j) {
        if (g <= blockCols - 3) {
          count = 1;
          arr = [[i, g]];
          while ((g + count < blockCols) && (level[i][g] === level[i][g + count])) {
            arr.push([i, g + count]);
            count++;
          }
          if (count >= 3) {
            return arr;
          }
        }
        if (i <= blockRows - 3) {
          count = 1;
          arr = [[i, g]];
          while ((i + count < blockRows) && (level[i][g] === level[i + count][g])) {
            arr.push([i + count, g]);
            count++;
          }
          if (count >= 3) {
            return arr;
          }
        }
      }
    }
    return false;
  };

  levelDown = function() {
    var flag, g, i, _i, _j;
    flag = true;
    while (flag) {
      flag = false;
      for (i = _i = 0; 0 <= blockRows ? _i < blockRows : _i > blockRows; i = 0 <= blockRows ? ++_i : --_i) {
        for (g = _j = 0; 0 <= blockCols ? _j < blockCols : _j > blockCols; g = 0 <= blockCols ? ++_j : --_j) {
          if (level[i][g] < 0) {
            flag = true;
            if (i > 0) {
              level[i][g] = level[i - 1][g];
              level[i - 1][g] = -1;
            } else {
              level[i][g] = Math.floor(blockTypeCount * Math.random());
            }
          }
        }
      }
      drawLevel();
    }
    drawLevel();
    return drawBoom();
  };

  drawBoom = function() {
    var arr, interval, size;
    document.removeEventListener("click", onClick);
    arr = checkLevel();
    if (!arr) {
      document.addEventListener("click", onClick);
      return;
    }
    score += arr.length;
    size = blockSize;
    return interval = setInterval(function() {
      size -= 10;
      arr.forEach(function(block) {
        var blockType, delta;
        $.clearRect(block[1] * (blockSize + 5), block[0] * (blockSize + 5), blockSize, blockSize);
        blockType = level[block[0]][block[1]];
        $.fillStyle = colors[blockType];
        delta = (blockSize - size) / 2;
        return $.fillRect(delta + block[1] * (5 + blockSize), delta + block[0] * (5 + blockSize), size, size);
      });
      if (size < 0) {
        clearInterval(interval);
        arr.forEach(function(block) {
          return level[block[0]][block[1]] = -1;
        });
        return levelDown();
      }
    }, 50);
  };

  onClick = function(e) {
    var check, cx, cy, flag, flag1, flag2, tmp;
    cx = Math.floor(e.pageX / (blockSize + 5));
    cy = Math.floor(e.pageY / (blockSize + 5));
    if (cx < 0 || cx > blockCols || cy < 0 || cy > blockRows) {
      return;
    }
    if (!firstClick) {
      firstClick = [cx, cy];
      return drawSelected();
    } else {
      flag1 = firstClick[0] === cx && Math.abs(firstClick[1] - cy) === 1;
      flag2 = firstClick[1] === cy && Math.abs(firstClick[0] - cx) === 1;
      flag = flag1 || flag2;
      if (!flag) {
        firstClick = false;
        return drawLevel();
      } else {
        tmp = level[cy][cx];
        level[cy][cx] = level[firstClick[1]][firstClick[0]];
        level[firstClick[1]][firstClick[0]] = tmp;
        check = checkLevel();
        if (check) {
          firstClick = false;
          drawLevel();
          return drawBoom();
        } else {
          tmp = level[cy][cx];
          level[cy][cx] = level[firstClick[1]][firstClick[0]];
          level[firstClick[1]][firstClick[0]] = tmp;
          firstClick = false;
          return drawLevel();
        }
      }
    }
  };

  document.addEventListener("click", onClick);

}).call(this);
