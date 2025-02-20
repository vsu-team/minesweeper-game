const disableGrid = () => {
  const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
  allGridItems.forEach((item) => item.classList.add("game-over"));
};

const revealAllBombs = (allGridItems, minesIndexes, size) => {
  for (let [x, y] of minesIndexes) {
    const index = x * size + y;
    allGridItems[index].textContent = "💣";
  }
  displayIncorrectFlags(allGridItems, minesIndexes, size);
  disableGrid();
};

const displayIncorrectFlags = (allGridItems, minesIndexes, size) => {
  for (let i = 0; i < allGridItems.length; i++) {
    const cellState = allGridItems[i].getAttribute("data-state");
    let isMine = false;
    for (let j = 0; j < minesIndexes.length; j++) {
      const [x, y] = minesIndexes[j];
      const mineIndex = x * size + y;
      if (mineIndex === i) {
        isMine = true;
        break;
      }
    }
    if (/*(cellState === "flagged" || cellState === "question")*/ cellState === "flagged" && !isMine) {
      allGridItems[i].textContent = "❌";
    }
  }
};

// Check if the user has won
const checkWin = (revealedCells, size, mines) => {
  return revealedCells === size * size - mines;
};

const minesGeneration = (size, mines, minesMatrix, rowIndex, colIndex) => {
  // const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
  let i = 0;
  //the array for keeping the indexes of mines random generation of mines
  let minesIndexes = [];
  while (i < mines) {
    let first_index = Math.floor(Math.random() * size); // mine 1st coordinate
    let second_index = Math.floor(Math.random() * size); // mine 2nd coordinate

    console.log(first_index, second_index);

    let first_click_neighbors = [];
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

const zeroReveal = (x, y, allGridItems, visited, minesMatrix, size, revealedCells) => {
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
            allGridItems[numIndex].classList.add("click-number");
            revealedCells.count++;
          }
          
        }
      }
    }
  }
};

//reveals the content of cell
const openCells = (size, mines, minesMatrix, allGridItems) => {
  let revealedCells = {count: 0};
  //array for differentiated opened and not opened cells
  let visited = Array.from({ length: size }, () => new Array(size).fill(0));
  let first_click = true;
  let minesIndexes = [];

  for (let index = 0; index < size * size; index++) {
    allGridItems[index].addEventListener("click", () => {
      //getting indexes from className
      let parts = allGridItems[index].className.split("-");
      let rowIndex = parseInt(parts[2]);
      let colIndex = parseInt(parts[3]);

      if (first_click) {
        first_click = false;
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
          size,
          revealedCells
        );
        //controling the cell which is number
      } else {
        allGridItems[index].textContent = minesMatrix[rowIndex][colIndex];
        allGridItems[index].classList.add("click-number");
        visited[rowIndex][colIndex] = 1;
        revealedCells.count++;
      }
      if (checkWin(revealedCells.count, size, mines)) {
        alert("You win!");
        disableGrid();
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

    //matrix generation, initial matrix is filled with 0s
    const minesMatrix = Array.from({ length: size }, () =>
      new Array(size).fill(0)
    );

    //grid visually creation
    gridCreation(size);
    const allGridItems = document.querySelectorAll('[class^="grid-item-"]');

    openCells(size, mines, minesMatrix, allGridItems);
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
