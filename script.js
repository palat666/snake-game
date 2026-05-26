// 游戏变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameSpeed = 10;
let gameInterval;
let isGameOver = false;
let isPaused = false;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 初始化游戏
function initGame() {
    snake = [];
    for (let i = 5; i >= 0; i--) {
        snake.push({ x: i, y: 10 });
    }
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    isPaused = false;
    generateFood();
    drawGame();
    // 自动开始游戏
    gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // 确保食物不会生成在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < snake.length; i++) {
        let segment = snake[i];
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        // 蛇头
        if (i === 0) {
            ctx.fillStyle = '#388E3C';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            ctx.fillStyle = '#4CAF50';
        }
    }
    
    // 绘制食物
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    
    // 游戏结束提示
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '16px Arial';
        ctx.fillText(`最终分数: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('点击重新开始按钮继续', canvas.width / 2, canvas.height / 2 + 30);
    }
}

// 移动蛇
function moveSnake() {
    if (isPaused || isGameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 创建新头部
    const head = { ...snake[0] };
    
    // 根据方向移动头部
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 检查边界碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        // 增加游戏速度
        if (score % 50 === 0) {
            gameSpeed += 1;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
        }
    } else {
        // 移除尾部
        snake.pop();
    }
    
    // 添加新头部
    snake.unshift(head);
    drawGame();
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    drawGame();
}

// 游戏循环
function gameLoop() {
    moveSnake();
}

// 开始游戏
function startGame() {
    if (!isGameOver && !isPaused) return;
    
    if (isPaused) {
        isPaused = false;
        gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
    } else {
        initGame();
    }
}

// 暂停游戏
function pauseGame() {
    if (isGameOver || isPaused) return;
    
    isPaused = true;
    clearInterval(gameInterval);
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    initGame();
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case ' ': // 空格键暂停/继续
            if (isGameOver) {
                restartGame();
            } else {
                isPaused ? startGame() : pauseGame();
            }
            break;
    }
});

// 触摸事件支持（移动端）
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // 防止页面滚动
});

canvas.addEventListener('touchend', (e) => {
    if (isGameOver || isPaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // 确定滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (deltaX < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // 垂直滑动
        if (deltaY > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (deltaY < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
});

// 按钮事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// 初始化游戏
initGame();