import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const BOARD_SIZE = 20;
const CELL_SIZE = 20; // Each cell is 20px
const MOVE_INTERVAL = 200; // Milliseconds between each move

function App() {
    const [gameState, setGameState] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [direction, setDirection] = useState("RIGHT"); // Default direction is RIGHT
    const [level, setLevel] = useState(1);

    // Fetch the current game state from the backend
    const fetchGameState = async () => {
        try {
            const response = await axios.get("http://localhost:8080/snake-game/state");
            setGameState(response.data);
            setIsGameOver(response.data.gameOver);
            setLevel(response.data.level);
        } catch (error) {
            console.error("Error fetching game state:", error);
        }
    };

    // Reset the game state by calling the reset endpoint
    const resetGame = async () => {
        try {
            const response = await axios.post("http://localhost:8080/snake-game/reset");
            setGameState(response.data); // Update the game state with the reset game
            setIsGameOver(false); // Reset the gameOver state
            setDirection("RIGHT"); // Reset direction to default
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    };

    // Move the snake in the current direction
    const moveSnake = async (dir) => {
        if (isGameOver) return;

        try {
            const response = await axios.post(
                `http://localhost:8080/snake-game/move?direction=${dir}`
            );
            setGameState(response.data);
            setIsGameOver(response.data.gameOver);
            setLevel(response.data.level);
        } catch (error) {
            console.error("Error moving snake:", error);
        }
    };

    // Game loop: Move the snake every MOVE_INTERVAL milliseconds
    useEffect(() => {
        if (!isGameOver) {
            const intervalId = setInterval(() => {
                moveSnake(direction);
            }, MOVE_INTERVAL);

            return () => clearInterval(intervalId); // Clean up the interval on unmount
        }
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
        if (!gameState) return null;

        const { snake, food, obstacles } = gameState;

        return (
            <div className="board">
                {/* Render Snake */}
                {snake.body.map((segment, index) => {
                    const style = {
                        left: `${segment[0] * CELL_SIZE}px`,
                        top: `${segment[1] * CELL_SIZE}px`,
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        transition: `all ${MOVE_INTERVAL}ms linear`,
                    };
                    return (
                        <div
                            key={index}
                            className="snake-cell"
                            style={style}
                            onClick={handleSnakeClick} // Prevent clicks from affecting the game
                        ></div>
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

                {/* Render Obstacles */}
                {obstacles &&
                    obstacles.map((obstacle, index) => {
                        const style = {
                            left: `${obstacle[0] * CELL_SIZE}px`,
                            top: `${obstacle[1] * CELL_SIZE}px`,
                            width: `${CELL_SIZE}px`,
                            height: `${CELL_SIZE}px`,
                        };
                        return <div key={index} className="obstacle-cell" style={style}></div>;
                    })}
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
