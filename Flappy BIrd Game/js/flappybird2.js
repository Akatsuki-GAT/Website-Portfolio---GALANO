//sfx
let sound_scored = new Audio('../sfx/point.mp3');
let flap = new Audio('../sfx/sfx_wing.mp3');
let hit = new Audio ('../sfx/sfx_swoosh.wav');
let oof = new Audio ('../sfx/sfx_die.wav');

//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

let bird_2 = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

//scoring mechanics function
let gameOver = false;
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "../img/midbird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "../img/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "../img/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes, so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
            sound_scored.play();
        }

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            highscore += 0.5;
            pipe.passed = true;      
        }


        if (detectCollision(bird, pipe)) {
            gameOver = true;
            oof.play();
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes the first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="25px sans-serif";
    context.fillText("Score: ",5, 45);
    context.fillText(score, 85, 45);
    context.fillText("High Score: ",5, 105);
    context.fillText(highscore, 145, 105);

    if (gameOver) {
        context.fillStyle = "white";
        context.font="45px sans-serif";
        context.fillText("GAME OVER", 43, 250);
        hit.play();

    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

//sprite bird animation input for KB
function moveBird(e) {
    document.addEventListener('keydown', (e) => {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" ) {
        //jump
        velocityY = -6;
        birdImg = new Image();
        birdImg.src = "../img/midbird.png"
        flap.play();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" ) {
        //jump
        velocityY = -6;
        birdImg = new Image();
        birdImg.src = '../img/upbird.png';
        flap.play();
    }
});


//sprite bird animation input for touchscreen
document.addEventListener('touchstart', (e) => {
    //jump
    velocityY = -6;
    birdImg = new Image();
    birdImg.src = '../img/midbird.png';
    flap.play();
    e.preventDefault(); // Prevent scrolling on touch devices
});

document.addEventListener('touchend', (e) => {
    //jump
    velocityY = -6;
    birdImg = new Image();
    birdImg.src = '../img/upbird.png';
    flap.play();
    e.preventDefault(); // Prevent scrolling on touch devices
});


        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            
        }

        if(score > highscore) {
            highscore++;
        }

    
}


function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}