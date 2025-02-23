function changeValue(id, change) {
  let input = document.getElementById(id);
  let value = parseInt(input.value) || 0;
  value = Math.max(0, value + change);
  input.value = value;

  customGrid();
}

function customGrid() {
  document.getElementById("option-container").style.display = "none";
  document.getElementById("container").style.display = "block";

  let size = parseInt(document.getElementById("size").value); // Ensure this is updated
  let mines = parseInt(document.getElementById("mines").value); // Ensure this is updated

  document.getElementById("size").addEventListener("input", () => {
    size = parseInt(document.getElementById("size").value); // Ensure this is updated
  });

  document.getElementById("mines").addEventListener("input", () => {
    mines = parseInt(document.getElementById("mines").value); // Ensure this is updated
  });
  console.log(`Starting game with size: ${size} and mines: ${mines}`); // Debugging log
  startGame(size, mines); // Call with updated values
}

function cancelCustom() {
  document.getElementById("container").style.display = "none";
  document.getElementById("option-container").style.display = "block";
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
const checkWin = (revealedCells, size, mines) => {
  return revealedCells === size * size - mines;
};

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
  revealedCells
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
  win
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
        first_click.click = false;
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
        alert("Game Over!");
        document.getElementById("pause-game").disabled = true; //added
        document.getElementById("resume-game").disabled = true; //added
        //controling the cell which is 0(empty)
      } else if (minesMatrix[rowIndex][colIndex] === 0) {
        zeroReveal(
          rowIndex,
          colIndex,
          allGridItems,
          visited,
          minesMatrix,
          size,
          revealedCells
        );
        //controling the cell which is number
      } else {
        allGridItems[index].textContent = minesMatrix[rowIndex][colIndex];
        allGridItems[index].classList.add(
          `click-number-${minesMatrix[rowIndex][colIndex]}`
        );
        visited[rowIndex][colIndex] = 1;
        revealedCells.count++;
      }
      if (checkWin(revealedCells.count, size, mines)) {
        win.state = true;
        alert("You win!");
        disableGrid();
        document.getElementById("pause-game").disabled = true; //added
        document.getElementById("resume-game").disabled = true; //added
      }
    });
  }
};

//state controlling of right click
const flagCell = (size, allGridItems, visited, first_click, flagIndexes) => {
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
              "hidden"
            ) {
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
              allGridItems[allGridItems_index].textContent = "❓";
              allGridItems[allGridItems_index].setAttribute(
                "data-state",
                "question"
              );
              flagIndexes = flagIndexes.filter(([x, y]) => x !== i || y !== j);
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

//start game function
const startGame = (size, mines) => {
  let gameActive = true;
  const flagIndexes = [];
  //event listener for start-game button
  document.getElementById("start-game").addEventListener("click", function () {
    document.getElementById("size").addEventListener("input", function () {
      size = parseInt(document.getElementById("size").value);
    });
    document.getElementById("mines").addEventListener("input", function () {
      mines = parseInt(document.getElementById("mines").value);
    });
    const win = { state: false };

    document.getElementById("menu").classList.add("active-flex");

    //matrix generation, initial matrix is filled with 0s
    const minesMatrix = Array.from({ length: size }, () =>
      new Array(size).fill(0)
    );

    //array for differentiated opened and not opened cells
    const visited = Array.from({ length: size }, () => new Array(size).fill(0));

    //grid visually creation
    gridCreation(size);
    const allGridItems = document.querySelectorAll('[class^="grid-item-"]');

    const first_click = { click: true };
    openCells(
      size,
      mines,
      minesMatrix,
      visited,
      first_click,
      allGridItems,
      flagIndexes,
      win
    );
    flagCell(size, allGridItems, visited, first_click, flagIndexes);
  });

  const pauseGame = () => {
    document.getElementById("pause-game").disabled = true;
    document.getElementById("resume-game").disabled = false; //es pausei mej em avelacrel
    gameActive = false;
    //clearInterval(timer); // Stop the timer
    const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
    allGridItems.forEach((item) => (item.style.pointerEvents = "none")); // Disable clicks
  };
  const resumeGame = () => {
    document.getElementById("pause-game").disabled = false;
    document.getElementById("resume-game").disabled = true;
    gameActive = true;
    //startTimer(); // Restart the timer
    const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
    allGridItems.forEach((item) => (item.style.pointerEvents = "auto")); // Enable clicks
  };
  document.getElementById("pause-game").addEventListener("click", pauseGame);
  document.getElementById("resume-game").addEventListener("click", resumeGame);
};

startGame(size, mines);
