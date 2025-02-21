# Minesweeper game
Minesweeper is a logic puzzle video game genre generally played on personal computers. The game features a grid of clickable tiles, with hidden "mines" scattered throughout the board.
## 1.Project structure
The game consists of multiple sections.
- Navbar: Displays the logo, the game title and allows user to input its username
- Options section: Provides grid selection.
- Custom option section: The option section is changed to this section after clicking the custom variant. Allows the user to define a custom grid size and mine count.
- Game Section: The main game board where gameplay occurs.
- Result Section: Displays the win/lose message and options to restart or change difficulty.


## 2.Sections breakdown
### 2.1 Navbar
- Contains the game logo and title. Includes a username input field for personalization.
### 2.2 Options Section
Displays grid options:
- 8×8 (10 mines)
- 16×16 (40 mines)
- Provides a "Custom" button to open the custom settings section. Note: Decide the maximum quantity of size and mines.
### 2.3 Custom Settings Section
Allows the player to enter:
- Number of rows and columns which should be equal
- Number of mines
- Contains "Play Game" and "Back" buttons.
### 2.4 Game Section
- Displays the game board dynamically based on the selected settings.
- Flag counter: Tracks remaining flags.
- Timer: Displays elapsed time.
- Controls: Restart, Pause.
### 2.5 Result Section
- Shows win/loss message. 
- Congratulations to the {username} section if the user wins and finds all the mines.
Otherwise, the whole grid is shown with the mines that weren’t found.


## 3. Game Logic
### 3.1 Board Generation
- Creates a grid with the specified size.
- Mines are placed randomly ensuring no overlap.
- Cells are assigned numbers indicating adjacent mines(horizontally, vertically, diagonally).
### 3.2 Cell Interaction
- Clicking a non-mine cell reveals it.
- Clicking a mine triggers a "Game Over".
- Right-clicking a cell places a flag.
- Double right-clicking a cell places a “?”.
- Triple right-clicking a cell makes the cell empty.
### 3.3 Timer
Timer starts when the game begins and stops on win/loss. When the pause button is clicked the timer is stopped.
### 3.4 Winning Condition
The player wins when all non-mine cells are revealed.



## Group tasks

- Figma - Elen Sargsyan, Anahit Bdoyan -- [Figma Design Reference](https://www.figma.com/design/TSpfZAmZ1M0rpFsHofmELh/Untitled?node-id=0-1&m=dev&t=8IViOfKScibxbmm3)
- Navbar - Ani Harutyunyan,Karina Ayvazyan
- Option section -Sargis Arakelyan, Greta Shirinyan, Garik
- Custom settings section - Yurik, Milena, Manukyan Erik
- Main game - Lusine Aydinyan, Elena Aleksanyan, Hayarpi Vardanyan, Lilit Asatryan
- Flag and timer - Poghosyan Erik
- Pause and restart - Mane Gharagyozyan, Lilit Markosyan
- Results section - Erik Abazyan, Artur Grigoryan, Yura Matsakyan

