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

//reveals the content of cell
const openCells = (size, minesMatrix, allGridItems) => {
  for (let index = 0; index < size * size; index++) {
    allGridItems[index].addEventListener("click", () => {
      let parts = allGridItems[index].className.split("-");
      let rowIndex = parseInt(parts[2]);
      let colIndex = parseInt(parts[3]);
      if (minesMatrix[rowIndex][colIndex] === "*") {
        allGridItems[index].textContent = "💣";
      } else {
        allGridItems[index].textContent = minesMatrix[rowIndex][colIndex];
      }
    });
  }
};

//state management of right click
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
    openCells(size, minesMatrix, allGridItems);
    flagCell(size, allGridItems);
  });
};

startGame();
