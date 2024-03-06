import 'components/App.scss';
import NonogramGrid from './NonogramGrid/NonogramGrid';
import { Nonogram, Marking } from 'modules/Nonogram';
import { useEffect, useState } from 'react';
import GameController from 'components/GameController/GameController';
import PlayController from 'components/PlayController/PlayController';
import useTimer from 'components/utils/useTimer';
import AppHeader from 'components/AppHeader/AppHeader';
import About from 'components/About/About';
const enum MarkLock {
    UNSET = 0,
    ROW = 1,
    COL = 2,
}
const App = () => {
    const [nonogram, setNonogram] = useState(() => new Nonogram(10));
    const [nonogramHistory, setNonogramHistory] = useState<Nonogram[]>([]);
    const [mouseDown, setMouseDown] = useState(false);
    const [marking, setMarking] = useState(Marking.MARKING);
    const { seconds, resetTimer } = useTimer(true);
    const [clickCoords, setClickCoords] = useState({ row: 0, column: 0 });
    const [markLock, setMarkLock] = useState(MarkLock.UNSET);

    useEffect(() => {
        const handleMouseUp = () => {
            if (mouseDown) {
                setMouseDown(false);
            }
        };
        document.addEventListener('mouseup', handleMouseUp);
    });

    const handleUndo = () => {
        if (nonogramHistory.length > 0) {
            const previousNonogram = nonogramHistory.pop();
            if (previousNonogram) {
                setNonogram(previousNonogram);
                setNonogramHistory([...nonogramHistory]); // Update the history state
            }
        }
    };

    const handleMouseDown = (x: number, y: number) => {
        setNonogramHistory([...nonogramHistory, new Nonogram(nonogram)]);

        const updatedGrid = new Nonogram(nonogram);
        const newMarking = updatedGrid.click(x, y);
        setMarking(newMarking);
        setNonogram(updatedGrid);

        // Set mouse state
        setMouseDown(true);
        setClickCoords({ row: y, column: x });
        setMarkLock(MarkLock.UNSET);
    };

    const handleMouseOver = (x: number, y: number) => {
        if (mouseDown) {
            if (x === clickCoords.column && y === clickCoords.row) {
                return;
            }
            if (markLock === MarkLock.UNSET) {
                if (x === clickCoords.column) {
                    setMarkLock(MarkLock.COL);
                } else if (y === clickCoords.row) {
                    setMarkLock(MarkLock.ROW);
                }
            }
            if (markLock === MarkLock.COL) {
                x = clickCoords.column;
            } else if (markLock === MarkLock.ROW) {
                y = clickCoords.row;
            }

            const updatedGrid = new Nonogram(nonogram as Nonogram);
            updatedGrid.setCell(x, y, marking);
            setNonogram(updatedGrid);
        }
    };
    const handleGenerate = (size: number) => {
        setNonogram(new Nonogram(size));
        resetTimer();
    };
    const handleReset = () => {
        const newNonogram = new Nonogram(nonogram);
        newNonogram.reset();
        setNonogram(newNonogram);
    };

    return (
        <div className="App">
            <AppHeader />
            <div className="App-content">
                <div className="ControlField">
                    <GameController handleGenerate={handleGenerate} handleReset={handleReset} />
                    <PlayController progress={nonogram.progress} seconds={seconds} handleUndo={handleUndo} undoActive={nonogramHistory.length > 0} />
                    <About />
                </div>
                <NonogramGrid nonogram={nonogram} onMouseDownHandler={handleMouseDown} onMouseOverHandler={handleMouseOver} />
            </div>
        </div>
    );
};

export default App;
