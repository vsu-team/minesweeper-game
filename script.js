const disableGrid = () => {
  const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
  allGridItems.forEach((item) => item.classList.add("game-over"));
};
const revealAllBombs = (allGridItems, minesIndexes, size) => {
  for (let [x, y] of minesIndexes) {
    const index = x * size + y;
    allGridItems[index].textContent = "💣";
  }
  disableGrid();
};

const minesGeneration = (size, mines) => {
  //matrix generation, initial matrix is filled with 0s
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
  let i = 0;
  //the array for keeping the indexes of mines random generation of mines
  let minesIndexes = [];
  while (i < mines) {
    let first_index = Math.floor(Math.random() * size); // mine 1st coordinate
    let second_index = Math.floor(Math.random() * size); // mine 2nd coordinate
    if (matrix[first_index][second_index] !== "*") {
      matrix[first_index][second_index] = "*";
      minesIndexes.push([first_index, second_index]);
      i++;
    }
  }
  console.log(matrix);
  return [minesIndexes, matrix];
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

//grid creation visualy
const gridCreation = (size) => {
  const gridContainer = document.getElementById("my-grid");
  gridContainer.classList.add("active-grid");
  gridContainer.innerHTML = "";
  for (let i = 0; i < size; ++i) {
    const row = document.createElement("div");
    for (let j = 0; j < size; ++j) {
      const gridItem = document.createElement("div");
      gridItem.className = `grid-item-${i}-${j}`;
      gridItem.setAttribute("data-state", "hidden");
      gridItem.textContent = "";
      row.appendChild(gridItem);
    }
    gridContainer.append(row);
  }
};

const zeroReveal = (x, y, allGridItems, visited, minesMatrix, size) => {
  //queue for keeping neighbor zeroes
  let queue = [[x, y]];
  visited[x][y] = 1;
  let zeroIndex = x * size + y;
  allGridItems[zeroIndex].textContent = "";
  allGridItems[zeroIndex].classList.add("click-color");
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
          } else {
            visited[i][j] = 1;
            const numIndex = i * size + j;
            allGridItems[numIndex].textContent = minesMatrix[i][j];
            allGridItems[numIndex].classList.add("click-color");
          }
        }
      }
    }
  }
};

//reveals the content of cell
const openCells = (size, minesMatrix, allGridItems, minesIndexes) => {
  //array for differentiated opened and not opened cells
  let visited = Array.from({ length: size }, () => new Array(size).fill(0));
  for (let index = 0; index < size * size; index++) {
    allGridItems[index].addEventListener("click", () => {
      //getting indexes from className
      let parts = allGridItems[index].className.split("-");
      let rowIndex = parseInt(parts[2]);
      let colIndex = parseInt(parts[3]);
      //checking whether cell is bomb
      if (minesMatrix[rowIndex][colIndex] === "*") {
        allGridItems[index].textContent = "💣";
        //revealing all the bombs present
        revealAllBombs(allGridItems, minesIndexes, size);
        //controling the cell which is 0(empty)
      } else if (minesMatrix[rowIndex][colIndex] === 0) {
        zeroReveal(
          rowIndex,
          colIndex,
          allGridItems,
          visited,
          minesMatrix,
          size
        );
        //controling the cell which is number
      } else {
        allGridItems[index].textContent = minesMatrix[rowIndex][colIndex];
        allGridItems[index].classList.add("click-color");
        visited[rowIndex][colIndex] = 1;
      }
    });
  }
};

//state controlling of right click
const flagCell = (size, allGridItems) => {
  for (let i = 0; i < size * size; ++i) {
    allGridItems[i].addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (allGridItems[i].getAttribute("data-state") === "hidden") {
        allGridItems[i].textContent = "🚩";
        allGridItems[i].setAttribute("data-state", "flagged");
      } else if (allGridItems[i].getAttribute("data-state") === "flagged") {
        allGridItems[i].textContent = "❓";
        allGridItems[i].setAttribute("data-state", "question");
      } else if (allGridItems[i].getAttribute("data-state") === "question") {
        allGridItems[i].textContent = "";
        allGridItems[i].setAttribute("data-state", "hidden");
      }
    });
  }
};

//start game function
const startGame = () => {
  let gameActive = true;
  //event listener for start-game button
  document.getElementById("start-game").addEventListener("click", function () {
    //The size of matrix and the quantity of mines
    const size = parseInt(document.getElementById("size").value);
    const mines = parseInt(document.getElementById("mines").value);

    //matrix generation
    let [minesIndexes, minesMatrix] = minesGeneration(size, mines);
    minesMatrix = numbersCalculation(minesMatrix, minesIndexes, size);

    //grid visually creation
    gridCreation(size);
    const allGridItems = document.querySelectorAll('[class^="grid-item-"]');

    openCells(size, minesMatrix, allGridItems, minesIndexes);
    flagCell(size, allGridItems);
  });
  const pauseGame = () => {
    gameActive = false;
    //clearInterval(timer); // Stop the timer
    const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
    allGridItems.forEach((item) => (item.style.pointerEvents = "none")); // Disable clicks
  };
  const resumeGame = () => {
    gameActive = true;
    //startTimer(); // Restart the timer
    const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
    allGridItems.forEach((item) => (item.style.pointerEvents = "auto")); // Enable clicks
  };
  document.getElementById("pause-game").addEventListener("click", pauseGame);
  document.getElementById("resume-game").addEventListener("click", resumeGame);
};

startGame();
