import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const CELL_SIZE = 20; // Each cell is 20px
const MOVE_INTERVAL = 200; // Milliseconds between each move

function App() {
    const [snake, setSnake] = useState(null);
    const [food, setFood] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [direction, setDirection] = useState("RIGHT");

    const resetGame = async () => {
        axios.post("http://localhost:8080/snake-game/reset")
            .then(response => {
                setSnake(response.data.snake);
                setFood(response.data.food)
                setIsGameOver(false);
                setDirection("RIGHT");
            })
            .catch(error => console.error("Error resetting game:", error));
    };

    // Game loop: Move the snake every MOVE_INTERVAL milliseconds
    useEffect(() => {
        if (isGameOver) return;

        const intervalId = setInterval(() => {
            if (isGameOver) return;

            axios.post(`http://localhost:8080/snake-game/move?direction=${direction}`)
                .then(response => {
                    setSnake(response.data.snake);
                    setFood(response.data.food)
                    setIsGameOver(response.data.gameOver);
                })
                .catch(error => console.error("Error moving snake:", error));
        }, MOVE_INTERVAL);

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, [direction, isGameOver]); // Re-run the interval when direction or gameOver changes

    // Handle keypress to change the direction
    const handleKeyPress = (event) => {
        if (isGameOver) return;

        // Prevent the snake from moving in the opposite direction immediately
        switch (event.key) {
            case "ArrowUp":
                if (direction !== "DOWN") setDirection("UP");
                break;
            case "ArrowDown":
                if (direction !== "UP") setDirection("DOWN");
                break;
            case "ArrowLeft":
                if (direction !== "RIGHT") setDirection("LEFT");
                break;
            case "ArrowRight":
                if (direction !== "LEFT") setDirection("RIGHT");
                break;
            default:
                break;
        }
    };

    // Add the keypress event listener on component mount
    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress); // Clean up event listener on unmount
        };
    }, [direction, isGameOver]); // Re-run when direction or gameOver changes

    // Prevent clicks on snake cells from changing direction or causing any other event
    const handleSnakeClick = (event) => {
        event.stopPropagation(); // Stop the event from bubbling up or causing unwanted behavior
    };

    // Render the game board
    const renderBoard = () => {
        if (!snake || !food) return null;

        return (
            <div className="board">
                {/* Render Snake */}
                {snake.body.map((segment, index) => {
                    const isHead = index === 0;
                    const tongueDirectionClass = isHead ? `snake-tongue ${direction.toLowerCase()}` : '';

                    return (
                        <div
                            key={index}
                            className="snake-cell"
                            style={{
                                left: `${segment[0] * CELL_SIZE}px`,
                                top: `${segment[1] * CELL_SIZE}px`,
                                width: `${CELL_SIZE}px`,
                                height: `${CELL_SIZE}px`,
                                transition: `all ${MOVE_INTERVAL}ms linear`,
                            }}
                            onClick={handleSnakeClick} // Prevent clicks from affecting the game
                        >{isHead && <div className={tongueDirectionClass}></div>}
                        </div>
                    );
                })}

                {/* Render Food */}
                <div
                    className="food-cell"
                    style={{
                        left: `${food.x * CELL_SIZE}px`,
                        top: `${food.y * CELL_SIZE}px`,
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                    }}
                ></div>
            </div>
        );
    };

    return (
        <div className="game-container">
            <h1>Snake Game</h1>
            {isGameOver ? (
                <>
                    <h2>Game Over</h2>
                    <button onClick={resetGame}>Restart Game</button>
                </>
            ) : (
                <div className="game-board">{renderBoard()}</div>
            )}
        </div>
    );
}

export default App;
