console.log('Run Main Script');
const timeout = async (time): Promise<void> => await new Promise(resolve => setTimeout(resolve, time));

class GameBuilder {
    startButton: HTMLElement;
    gameWrapper: HTMLElement;
    gameWidthInput: HTMLInputElement;
    gameHeightInput: HTMLInputElement;
    gameFpsInput: HTMLInputElement;

    startGame = false;
    gameTableCurrent: Array<Array<0 | 1>> = [];
    nextGameTable: Array<Array<0 | 1>> = [];
    fps = 20;

    constructor(private size: { width: number, height: number }) {
        this.startButton = document.querySelector('#start-game');
        this.gameWidthInput = document.querySelector('#width');
        this.gameHeightInput = document.querySelector('#height');
        this.gameFpsInput = document.querySelector('#fps');

        this.gameWrapper = document.querySelector('.game-wrapper');

        this.startButton.addEventListener('click', () => {
            this.startGame = !this.startGame;
            this.startButton.innerText = this.startGame === false ? 'Start' : 'Stop';
            this.runGame();
        });

        this.gameWidthInput.addEventListener('change', (event) => {
            this.size.width = parseInt(event.target.value);
            this.init()
        })

        this.gameHeightInput.addEventListener('change', (event) => {
            this.size.height = parseInt(event.target.value);
            this.init()
        })

        this.gameFpsInput.addEventListener('change', (event) => {
            this.fps = parseInt(event.target.value);
            this.init()
        })
    }

    init = (): void => {
        this.initGameTable();
        this.createBoard();
    };

    initGameTable = (): void => {
        this.gameTableCurrent = [];
        for (let i = 1; i <= this.size.height; i++) {
            const row = [];
            for (let j = 1; j <= this.size.width; j++) {
                row.push(0);
            }
            this.gameTableCurrent.push(row);
        }
    };

    createBoard = async (): Promise<void> => {
        this.gameWrapper.innerHTML = '';
        const cellWidth = Math.floor(this.gameWrapper.clientWidth / this.size.width);
        const cellHeight = Math.floor(this.gameWrapper.clientHeight / this.size.height);

        this.gameTableCurrent.forEach((rowItems, rowIndex) => {
            const row = document.createElement('div');
            row.classList.add('row');
            row.setAttribute('row', `${rowIndex}`)
            rowItems.forEach((cellValue, cellIndex) => {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.id = `${rowIndex}-${cellIndex}`;
                cell.style.width = `${cellWidth}px`;
                cell.style.height = `${cellHeight}px`;
                row.appendChild(cell);
                cell.addEventListener('click', this.onClickCellHandler);
            });
            this.gameWrapper.appendChild(row)
        });

    };


    onClickCellHandler = (event): void => {
        const cellHtml: HTMLElement = event.target;
        const cellAddress = cellHtml.id.split('-');
        const cellAddressY = cellAddress[0];
        const cellAddressX = cellAddress[1];

        if (cellHtml.classList.contains('active')) {
            cellHtml.classList.remove('active');
            if (this.startGame === true) {
                this.nextGameTable[cellAddressY][cellAddressX] = 0;
            } else {
                this.gameTableCurrent[cellAddressY][cellAddressX] = 0;

            }

        } else {
            cellHtml.classList.add('active');
            if (this.startGame === true) {
                this.nextGameTable[cellAddressY][cellAddressX] = 1;
            } else {
                this.gameTableCurrent[cellAddressY][cellAddressX] = 1;

            }
        }
    };

    runGame = async () => {
        while (this.startGame === true) {
            this.nextGameTable = JSON.parse(JSON.stringify(this.gameTableCurrent))

            this.gameTableCurrent.forEach( (rowItem, rowIndex) => {
                rowItem.forEach( (cellItem, cellIndex) => {
                    const cellY = rowIndex;
                    const cellX = cellIndex;
                    const cell = document.getElementById(`${cellY}-${cellX}`);
                    this.gameTableCurrent[cellY][cellX] === 0 ? cell.classList.remove('active') : cell.classList.add('active');
                    const neighborhoodItems = this.getNeighborhood(cellY, cellX);
                    const activeNeighborhoods = neighborhoodItems.filter(address =>  this.gameTableCurrent[address[0]][address[1]] !== 0);

                    if (this.gameTableCurrent[cellY][cellX] === 1) {
                        if (activeNeighborhoods.length < 2 ) {
                            this.nextGameTable[cellY][cellX] = 0;
                        } else if (activeNeighborhoods.length === 2 || activeNeighborhoods.length === 3) {
                            this.nextGameTable[cellY][cellX] = 1;
                        }else if (activeNeighborhoods.length > 3) {
                            this.nextGameTable[cellY][cellX] = 0;
                        }
                    } else {
                        if (activeNeighborhoods.length === 3) {
                            this.nextGameTable[cellY][cellX] = 1;
                        }
                    }
                })
            })

            await timeout(Math.floor(1000 / this.fps));
            this.gameTableCurrent = this.nextGameTable;
        }

    };

    getNeighborhood = (y: number, x: number): Array<Array<number>> => {
        const topLeft = y === 0 || x === 0 ? null : [y - 1, x - 1];
        const top = y === 0 ? null : [y - 1, x];
        const topRight = y === 0 || x === this.size.height - 1 ? null : [y - 1, x + 1];
        const right = x === this.size.width - 1 ? null : [y, x + 1];
        const left = x === 0 ? null : [y, x - 1];
        const bottomLeft = y === this.size.height - 1 || x === 0 ? null : [y + 1, x - 1];
        const bottom = y === this.size.height - 1 ? null : [y + 1, x];
        const bottomRight = y === this.size.height - 1 || x === this.size.width - 1 ? null : [y + 1, x + 1];
        return [topLeft, top, topRight, right, left, bottomLeft, bottom, bottomRight].filter(item => item !== null);
    };
}

const game = new GameBuilder({width: 60, height: 60});
game.init();



