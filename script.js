//event listener for start-game button
document.getElementById("start-game").addEventListener("click", function () {
  //The size of matrix and the count of mines
  const size = parseInt(document.getElementById("size").value);
  const mines = parseInt(document.getElementById("mines").value);

  //matrix generation
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
  let indexes = []; // index array
  let i = 0; // index count variable
  while (i < mines) {
    let first_index = Math.floor(Math.random() * size); // index 1st coordinate
    let second_index = Math.floor(Math.random() * size); // index 2nd coordinate
    if (matrix[first_index][second_index] !== "*") {
      matrix[first_index][second_index] = "*";
      indexes.push([first_index, second_index]);
      i++;
    }
  }

  console.log("Matrix 1");
  for (let row = 0; row < size; row++) {
    console.log(matrix[row]);
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      if (matrix[i][j] != "*") {
        if (i - 1 >= 0) {
          if (j - 1 >= 0 && matrix[i - 1][j - 1] === "*") {
            sum += 1;
          }
          if (matrix[i - 1][j] === "*") {
            sum += 1;
          }
          if (j + 1 < size && matrix[i - 1][j + 1] === "*") {
            sum += 1;
          }
        }
        if (j - 1 >= 0 && matrix[i][j - 1] === "*") {
          sum += 1;
        }
        if (j + 1 < size && matrix[i][j + 1] === "*") {
          sum += 1;
        }
        if (i + 1 < size) {
          if (j - 1 >= 0 && matrix[i + 1][j - 1] === "*") {
            sum += 1;
          }
          if (matrix[i + 1][j] === "*") {
            sum += 1;
          }
          if (j + 1 < size && matrix[i + 1][j + 1] === "*") {
            sum += 1;
          }
        }
        matrix[i][j] = sum;
      }
    }
  }

  console.log("Matrix2");
  for (let row = 0; row < size; row++) {
    console.log(matrix[row]);
  }

  //grid creation visualy
  const gridContainer = document.getElementById("my-grid");
  gridContainer.style.display = "block";
  gridContainer.innerHTML = "";
  for (let i = 0; i < size; ++i) {
    const row = document.createElement("div");
    for (let j = 0; j < size; ++j) {
      const gridItem = document.createElement("div");
      gridItem.className = `grid-item-${i + 1}-${j + 1}`;
      gridItem.textContent = "";
      row.appendChild(gridItem);
    }
    gridContainer.append(row);
  }

  const allGridItems = document.querySelectorAll('[class^="grid-item-"]');
  let count = 0;
  for (let i = 0; i < size * size; ++i) {
    allGridItems[i].addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (count == 0) {
        allGridItems[i].innerHTML =
          '<img class="flag-inside" src="images/flag.png" alt="flag">';
        count++;
      } else if (count == 1) {
        allGridItems[i].innerHTML = "";
        count = 0;
      }
    });
  }
});
