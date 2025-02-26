function changeValue(id, change) {
  let input = document.getElementById(id);
  let value = parseInt(input.value) || 0;
  value = Math.max(0, value + change);
  input.value = value;

  customGrid();
}

// Function to update the username when the input changes
function updateUsername() {
  const username = document.getElementById("username").value;
}

// Start timer when the first click happens
function startTimer(timer) {
  timer.id = setInterval(() => {
    timer.second++;
    document.getElementById("timer").textContent = timer.second;
  }, 1000);
}

// Function to stop the timer when the game ends
function stopTimer(timer) {
  clearInterval(timer.id);
}

function customGrid() {
  document.getElementById("option-container").style.display = "none";
  document.getElementById("custom-container").style.display = "block";
  let size = parseInt(document.getElementById("size").value);
  let mines = parseInt(document.getElementById("mines").value);
  document.getElementById("size").addEventListener("input", () => {
    size = parseInt(document.getElementById("size").value);
  });
  document.getElementById("mines").addEventListener("input", () => {
    mines = parseInt(document.getElementById("mines").value);
  });
  if (isNaN(size)) {
    changeValue("size", 5);
    return;
  } else if (size < 5) {
    changeValue("size", 5 - size);
    return;
  } else if (size > 30) {
    changeValue("size", 30 - size);
    return;
  }
  const minMines = Math.ceil(size * size * 0.1);
  const maxMines = Math.floor(size * size * 0.5);
  if (mines < minMines) {
    mines = minMines;
  } else if (mines > maxMines) {
    mines = maxMines;
  } else if (isNaN(mines)) {
    changeValue("mines", minMines);
    return;
  }
  const playButton = document.getElementById("start-game");
  playButton.addEventListener("click", () => {
    startGame(size, mines);
  });
}

function cancelCustom() {
  document.getElementById("custom-container").style.display = "none";
  document.getElementById("option-container").style.display = "block";
  document.getElementById("size").value = 0;
  document.getElementById("mines").value = 0;
}

function selectGrid(rows, mines) {
  startGame(rows, mines);
}

//grid creation visualy
const gridCreation = (size) => {
  const gridContainer = document.getElementById("my-grid");
  gridContainer.classList.add("active-block");
  gridContainer.innerHTML = "";
  for (let i = 0; i < size; ++i) {
    const row = document.createElement("div");
    for (let j = 0; j < size; ++j) {
      const gridItem = document.createElement("div");
      gridItem.classList.add(`grid-item-${i}-${j}`);
      gridItem.setAttribute("data-state", "hidden");
      gridItem.textContent = "";
      row.appendChild(gridItem);
    }
    gridContainer.append(row);
  }
};

const disableGrid = () => {
  const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
  allGridItems.forEach((item) => item.classList.add("game-over"));
};

const revealAllBombs = (allGridItems, minesIndexes, size, flagIndexes) => {
  for (let [x, y] of minesIndexes) {
    const index = x * size + y;
    allGridItems[index].textContent = "💣";
  }
  displayIncorrectFlags(allGridItems, minesIndexes, flagIndexes, size);
  disableGrid();
};
const displayIncorrectFlags = (
  allGridItems,
  minesIndexes,
  flagIndexes,
  size
) => {
  for (let i = 0; i < allGridItems.length; i++) {
    const cellState = allGridItems[i].getAttribute("data-state");
    if (cellState === "flagged") {
      const row = Math.floor(i / size);
      const col = i % size;
      if (
        !minesIndexes.some(([r, c]) => r === row && c === col) &&
        flagIndexes.some(([r, c]) => r === row && c === col)
      ) {
        allGridItems[i].textContent = "❌";
      }
    }
  }
};

// Check if the user has won
const checkWin = (revealedCells, size, mines, timer, win) => {
  if (revealedCells === size * size - mines) {
    win.state = true;
    showMessage(timer, win);
    return true;
  }
  return false;
};

function showMessage(timer, win) {
  let username = document.getElementById("username").value;
  let messageBox = document.createElement("div");
  messageBox.id = "congratulation-message";
  if (win.state === true) {
    messageBox.textContent = `🎉 Congrats ${username}! You won in ${timer.second} seconds!`;
  } else {
    messageBox.textContent = `😭 Game over ${username}! You lost in ${timer.second} seconds!`;
  }
  document.body.appendChild(messageBox);

  setTimeout(() => {
    messageBox.classList.add("show");
  }, 100);

  // Hide after 5 seconds
  setTimeout(() => {
    messageBox.classList.remove("show");
    setTimeout(() => {
      messageBox.remove();
    }, 500);
  }, 5000);
}

const minesGeneration = (size, mines, minesMatrix, rowIndex, colIndex) => {
  let i = 0;
  //the array for keeping the indexes of mines random generation of mines
  const minesIndexes = [];
  while (i < mines) {
    let first_index = Math.floor(Math.random() * size); // mine 1st coordinate
    let second_index = Math.floor(Math.random() * size); // mine 2nd coordinate

    const first_click_neighbors = [];
    for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
      for (let j = colIndex - 1; j <= colIndex + 1; j++) {
        first_click_neighbors.push(`${i},${j}`);
      }
    }

    if (
      minesMatrix[first_index][second_index] !== "*" &&
      !first_click_neighbors.includes(`${first_index},${second_index}`)
    ) {
      minesMatrix[first_index][second_index] = "*";
      minesIndexes.push([first_index, second_index]);
      i++;
    }
  }
  return minesIndexes;
};

//matrix numbers calculation
const numbersCalculation = (minesMatrix, minesIndexes, size) => {
  for (let [x, y] of minesIndexes) {
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (
          i >= 0 &&
          i < size &&
          j >= 0 &&
          j < size &&
          minesMatrix[i][j] !== "*" &&
          (i !== x || j !== y)
        ) {
          minesMatrix[i][j] += 1;
        }
      }
    }
  }
  return minesMatrix;
};

const zeroReveal = (
  x,
  y,
  allGridItems,
  visited,
  minesMatrix,
  size,
  revealedCells,
  flagIndexes,
  flagCount,
  mines
) => {
  //queue for keeping neighbor zeroes
  let queue = [[x, y]];
  visited[x][y] = 1;
  let zeroIndex = x * size + y;
  allGridItems[zeroIndex].textContent = "";
  allGridItems[zeroIndex].classList.add("click-color");
  revealedCells.count++;
  while (queue.length > 0) {
    [x, y] = queue.shift();
    zeroIndex = x * size + y;
    allGridItems[zeroIndex].classList.add("click-color");
    allGridItems[zeroIndex].textContent = "";
    if (allGridItems[zeroIndex].getAttribute("data-state") === "flagged") {
      flagIndexes.forEach((flag, idx) => {
        if (flag[0] === x && flag[1] === y) {
          flagIndexes.splice(idx, 1);
        }
      });
      flagCount.count--;
      document.getElementById("pinCount").textContent = `${flagCount.count}/${mines}`;
    }
    //adjacent cells check
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (
          i >= 0 &&
          i < size &&
          j >= 0 &&
          j < size &&
          minesMatrix[i][j] !== "*" &&
          visited[i][j] === 0
        ) {
          if (minesMatrix[i][j] === 0) {
            visited[i][j] = 1;
            queue.push([i, j]);
            revealedCells.count++;
          } else {
            visited[i][j] = 1;
            const numIndex = i * size + j;
            allGridItems[numIndex].textContent = minesMatrix[i][j];
            allGridItems[numIndex].classList.add(
              `click-number-${minesMatrix[i][j]}`
            );
            if (
              allGridItems[numIndex].getAttribute("data-state") === "flagged"
            ) {
              flagIndexes.forEach((flag, idx) => {
                if (flag[0] === i && flag[1] === j) {
                  flagIndexes.splice(idx, 1);
                }
              });
              flagCount.count--;
              document.getElementById("pinCount").textContent = `${flagCount.count}/${mines}`;
            }
            revealedCells.count++;
          }
        }
      }
    }
  }
};

//reveals the content of cell
const openCells = (
  size,
  mines,
  minesMatrix,
  visited,
  first_click,
  allGridItems,
  flagIndexes,
  win,
  timer,
  flagCount
) => {
  let revealedCells = { count: 0 };
  let minesIndexes = [];
  for (let index = 0; index < size * size; index++) {
    allGridItems[index].addEventListener("click", () => {
      //getting indexes from className
      let parts = allGridItems[index].className.split("-");
      let rowIndex = parseInt(parts[2]);
      let colIndex = parseInt(parts[3]);

      if (first_click.click === true) {
        startTimer(timer);
        first_click.click = false;
        document.getElementById("pause-resume").disabled = false;
        minesIndexes = minesGeneration(
          size,
          mines,
          minesMatrix,
          rowIndex,
          colIndex
        );
        numbersCalculation(minesMatrix, minesIndexes, size);
      }

      //checking whether cell is bomb
      if (minesMatrix[rowIndex][colIndex] === "*") {
        win.state = false;
        allGridItems[index].textContent = "💣";
        allGridItems[index].classList.add("bomb-click");
        //revealing all the bombs present
        revealAllBombs(allGridItems, minesIndexes, size, flagIndexes);
        showMessage(timer, win);
        stopTimer(timer); 
        document.getElementById("pause-resume").disabled = true;
        //controling the cell which is 0(empty)
      } else if (
        minesMatrix[rowIndex][colIndex] === 0 &&
        visited[rowIndex][colIndex] !== 1
      ) {
        zeroReveal(
          rowIndex,
          colIndex,
          allGridItems,
          visited,
          minesMatrix,
          size,
          revealedCells,
          flagIndexes,
          flagCount,
          mines
        );
        //controling the cell which is number
      } else if (visited[rowIndex][colIndex] !== 1) {
        allGridItems[index].textContent = minesMatrix[rowIndex][colIndex];
        allGridItems[index].classList.add(
          `click-number-${minesMatrix[rowIndex][colIndex]}`
        );
        visited[rowIndex][colIndex] = 1;
        if (allGridItems[index].getAttribute("data-state") === "flagged") {
          flagIndexes.forEach((flag, idx) => {
            if (flag[0] === rowIndex && flag[1] === colIndex) {
              flagIndexes.splice(idx, 1);
            }
          });
          flagCount.count--;
          document.getElementById("pinCount").textContent = `${flagCount.count}/${mines}`;

        }
        revealedCells.count++;
      }
      if (checkWin(revealedCells.count, size, mines, timer, win)) {
        // win.state = true;
        stopTimer(timer);
        document.getElementById("pause-resume").disabled = true;
        document.getElementById("pinCount").textContent = `${mines}/${mines}`;
        disableGrid();
      }
    });
  }
};

//state controlling of right click
const flagCell = (
  size,
  allGridItems,
  visited,
  first_click,
  flagIndexes,
  mines,
  flagCount
) => {
  for (let i = 0; i < size; ++i) {
    for (let j = 0; j < size; ++j) {
      const allGridItems_index = i * size + j;
      allGridItems[allGridItems_index].addEventListener(
        "contextmenu",
        (event) => {
          event.preventDefault();
          if (visited[i][j] !== 1 && first_click.click === false) {
            if (
              allGridItems[allGridItems_index].getAttribute("data-state") ===
                "hidden" &&
              flagCount.count < mines
            ) {
              flagCount.count++;
              allGridItems[allGridItems_index].textContent = "🚩";
              allGridItems[allGridItems_index].setAttribute(
                "data-state",
                "flagged"
              );
              flagIndexes.push([i, j]);
            } else if (
              allGridItems[allGridItems_index].getAttribute("data-state") ===
              "flagged"
            ) {
              flagCount.count--;
              allGridItems[allGridItems_index].textContent = "❓";
              allGridItems[allGridItems_index].setAttribute(
                "data-state",
                "question"
              );
              flagIndexes.forEach((flag, idx) => {
                if (flag[0] === i && flag[1] === j) {
                  flagIndexes.splice(idx, 1);
                }
              });
            } else if (
              allGridItems[allGridItems_index].getAttribute("data-state") ===
              "question"
            ) {
              allGridItems[allGridItems_index].textContent = "";
              allGridItems[allGridItems_index].setAttribute(
                "data-state",
                "hidden"
              );
            }
          }
          document.getElementById(
            "pinCount"
          ).textContent = `${flagCount.count}/${mines}`;
        }
      );
    }
  }
};

const darkMode = () => {
  const darkMode = document.getElementById("dark-mode-btn");

  if (darkMode.textContent === "🌙") {
    document.body.classList.add("dark-mode");
    darkMode.textContent = "🌞";
  } else {
    document.body.classList.remove("dark-mode");
    darkMode.textContent = "🌙";
  }
};

const startGame = (size, mines) => {
  document.getElementById("option-container").style.display = "none";
  document.getElementById("custom-container").style.display = "none";
  document.getElementById("pause-resume").disabled = true;
  document.getElementById("main").style.display = "flex";
  const flagIndexes = [];
  let timer = { second: 0, id: null };
  let flagCount = { count: 0 };
  document.getElementById("size").addEventListener("input", function () {
    size = parseInt(document.getElementById("size").value);
  });
  document.getElementById("mines").addEventListener("input", function () {
    mines = parseInt(document.getElementById("mines").value);
  });
  const win = { state: false };

  document.getElementById("menu").classList.add("active-flex");
  document.getElementById("pinCount").textContent = `0/${mines}`;
  //matrix generation, initial matrix is filled with 0s
  const minesMatrix = Array.from({ length: size }, () =>
    new Array(size).fill(0)
  );

  //array for differentiated opened and not opened cells
  const visited = Array.from({ length: size }, () => new Array(size).fill(0));

  //grid visually creation
  gridCreation(size);
  const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
  if (size <= 10) {
    allGridItems.forEach((item) => {
      item.classList.add("small");
    });
  } else if (size <= 15) {
    allGridItems.forEach((item) => {
      item.classList.add("middle");
    });
  } else {
    allGridItems.forEach((item) => {
      item.classList.add("big");
    });
  }

  const first_click = { click: true };

  openCells(
    size,
    mines,
    minesMatrix,
    visited,
    first_click,
    allGridItems,
    flagIndexes,
    win,
    timer,
    flagCount
  );
  flagCell(
    size,
    allGridItems,
    visited,
    first_click,
    flagIndexes,
    mines,
    flagCount
  );

  document
    .getElementById("pause-resume")
    .addEventListener("click", function () {
      const button = document.getElementById("pause-resume");
      if (button.textContent === "Resume") {
        button.textContent = "Pause"; // Set button to "Pause"
        startTimer(timer); // Resume timer
        const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
        allGridItems.forEach((item) => (item.style.pointerEvents = "auto"));
      } else {
        button.textContent = "Resume"; // Set button to "Resume"
        stopTimer(timer); // Pause timer
        const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
        allGridItems.forEach((item) => (item.style.pointerEvents = "none"));
      }
    });
  document.getElementById("reset").addEventListener("click", function () {
    stopTimer(timer);
    document.getElementById("timer").textContent = 0;
    startGame(size, mines);
  });

  document.getElementById("restart").addEventListener("click", function () {
    document.getElementById("main").style.display = "none";
    document.getElementById("option-container").style.display = "block";
    stopTimer(timer);
    document.getElementById("timer").textContent = 0;
  });
};
