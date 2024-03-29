import Block from './block.js'
// 돔 셀렉터
const container = document.querySelector('.container');
const currentScore = document.querySelector('.score');
const modalGameOver = document.querySelector('.modal-gameover');
const btnRetry = document.querySelector('.btn-retry');
const modalPause = document.querySelector('.modal-pause');
const finalScore = document.querySelector('.modal-container .score');
const btnArrows = document.querySelectorAll('.btn__arrow');
const btnAction = document.querySelector('.btn__action');

// 게임에 사용되는 변수
const MY = 20;
const MX = 10;
let speed = 500;
let level = 0;
let score = 0;
let tempMovingItem;
let movingItem = {
    type: '',
    direction: 0,
    top: 0,
    left: 3,
}
// 상태변수
let downInterval;
let playing = false;
let isGameover = false;



// 실행
init();
btnRetry.addEventListener('click',init)

function init() {
    // 스코어 초기화
    resetScore();
    // 레벨 초기화
    resetLevel()
    // modal 초기화
    modalGameOver.classList.remove('is-show');
    // 키보드 이벤트 바인딩
    window.addEventListener(`keydown`,keyEvent);
    // 게임 배경만들기
    drawBoard();
    // 랜덤블록 준비하기
    movingItem.type = createType(); 
    // 미리 움직여줄 블록의 속성을 무빙블록에서 복사함
    tempMovingItem = { ...movingItem };
    // 블록만들기 
    createBlock();
}

// 게임 배경 테이블 만들기
function drawBoard() {
    let boardTag = `<table>`;
    for(let i = 0; i < MY; i++) {
        boardTag += `<tr>`

        for(let j = 0; j < MX; j++) {
            boardTag += `<td></td>`
        }
        boardTag += `</tr>`
    }
    boardTag += `</table>`
    container.innerHTML = boardTag;
}

// 랜덤한 블록타입을 만드는 함수
function createType() {
    const block = Object.entries(Block);
    const randomNumber = Math.floor(Math.random()*block.length);
    return block[randomNumber][0]
}

// 새로운 줄을 만드는 함수
function createNewLine() {
    const tbody = document.querySelector('tbody')
    const tr = document.createElement('tr');
    for(let i = 0; i < MX; i++) {
        const td = document.createElement('td');
        tr.prepend(td);
    }
    tbody.prepend(tr);
}

// 블록을 렌더링 하는 함수
function renderBlock(movetype = '') {

    // es6 문법
    const {type, direction, left, top} = tempMovingItem;

    // 기존에 움직였던 블럭을 지워준다.
    let target = document.querySelectorAll('.moving')
    target.forEach(element => {
        element.classList.remove(type, 'moving');
    })

    // 블록 렌더링
    // 블록 타입에 해당하는 모양이 담긴 배열을 가지고 온다.
    const block = Block[type][direction];

    //Some : 해당 블록중에 selctor로 선택한 아이가 없으면 엘리먼트 중에 하나라도 해당 되면 멈추게 한다. 리턴값이 하나라도 true일때 반복을 멈춤다. <=> every
    block.some(element => {
        const y = element[0] + top;
        const x = element[1] + left;
        const item = (document.querySelector('tbody').childNodes[y]) ? document.querySelector('tbody').childNodes[y].childNodes[x] : null
        // 가능한 움직임인지 체크 
        const check = checkAvailable(item);
        if(check) {
            // 움직임 가능할때
            item.classList.add(type, 'moving'); 
        } else {
            // 불가능할때
            // 원래 임시로 담겨있던 무빙블록아이템으로 다시 반환
            tempMovingItem = { ...movingItem }
            
            // 게임종료시 진입 구간
            if(movetype == 'retry') {
                gameOver(score);
                return;
            }
            
            // 무한 콜스택에서 벗어나기 위해 settimeout
            setTimeout(()=>{

                renderBlock('retry');
                // 움직이는 방향이 top y축 값이면 값을 고정
                if(movetype === 'top') {
                    seizeBlock();
                }
            }, 0)
            // 그리고 멈추기 위해서 리턴해준다.
            return true;
        }
    });

    // 렌더링 후에 무빙아이템 정보를 업데이트
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

// 움직일수 있는지 확인하는 함수
function checkAvailable(item) {
    // 움직일려고 하는 엘리먼트가 없거나, 고정된 값이 있으면
    if(!item || item.classList.contains('seize')) { 
        return false
    }
    return true;
}

// 새로운 블록을 만드는 함수 (새로운 블록을 만들때 움직이는 *블록과 임시 블록 둘다* 초기화 시켜야 된다.)
function createBlock() {
    clearInterval(downInterval);
    playing = true;

    downInterval = setInterval(()=>{
        moveItem('top',1);
    },speed)

    movingItem.type = createType(); //랜덤타입을 결정하는 함수
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem}  // Error cod: 초기화를 안시켰으니까 무빙 아이템이 남아 있었음.
    renderBlock();
}

// 블록을 고정하는 함수 (moving 태그를 seize 태그로 교체)
function seizeBlock() {
    const block = document.querySelectorAll('.moving');
    block.forEach(element => {
        element.classList.remove('moving');
        element.classList.add('seize');
    })
    checkLine();
}

// 라인을 체크해서 없애는 함수 (로직: 화면에 있는 tr을 가지고 와서 check 변수를 사용해서 한줄에 있는 모든 td의 클래스가 seize를 가지고 있을때 없애자 )
function checkLine() {

    const tr = document.querySelectorAll('tr');

    tr.forEach(row => {
        let check = true; // 체크를 트리거로 사용한다.
        
        const td = row.childNodes
        td.forEach(col => {
            if(!col.classList.contains('seize')) {
                check = false;
            }
        });

        if(check) {
            row.remove();
            createNewLine();
            score += 100;
            updateScore(score);
            updateLevel(score);
        }

    });
    createBlock()
}


// 움직이는 방향에 포지션값을 더하는 함수 (argument :move type, value)
function moveItem(movetype, value) {
    tempMovingItem[movetype] += value
    renderBlock(movetype)
}

// 블록의 뱡향을 바꾸는 함수 (driection 값을 증가시키고 0,1,2,3 으로 순환시키는 함수)
function moveDirection() {
    tempMovingItem.direction += 1;
    tempMovingItem.direction = (tempMovingItem.direction > 3) ? 0 : tempMovingItem.direction;
    renderBlock();
}

// 키 바인딩 함수
function keyEvent(e) {
    e.preventDefault();
    if(e.keyCode == 27) {
        pauseGame();
        togglepauseModal();
        return
    }

    if(playing) {
        switch(e.keyCode) {
            case 38:
                moveDirection()
                break; 
            // 나머지 값은 블록을 움직인다.
            case 39:
                moveItem('left', 1);
                break;
            case 40:
                moveItem('top', 1);
                break;
            case 37:
                moveItem('left', -1);
                break;
            case 32:
                e.preventDefault();
                dropBlock()
                break;
        }
    }
    
}
// 스페이스바 함수
function dropBlock() {
    playing = true;
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveItem('top',1);
    }, 10 );
}
// ESC 게임멈춤
function pauseGame(){
    if(playing == true) {
        playing = false;
        clearInterval(downInterval);
    } else {
        playing = true;
        downInterval = setInterval(()=>{
            moveItem('top',1);
        }, 500 );
    }
}

function togglepauseModal() {
    if(modalPause.classList.contains('is-show')) {
        modalPause.classList.remove('is-show');
    } else {
        modalPause.classList.add('is-show');
    }
}

function resetScore() {
    score = 0;
    currentScore.innerText = 0;
    finalScore.innerText = 0;
}
// 게임종료
function gameOver() {
    // 한번더 체크하기
    let firstTr = document.querySelector('tr');
    
    firstTr.querySelectorAll('td').forEach(col => {
        if(col.classList.contains('seize') || col.classList.contains('moving')) {
            isGameover = true;
            return;
        }
    })

    if(isGameover) {
        isGameover = false;
        clearInterval(downInterval);
        finalScore.innerText = score;
        modalGameOver.classList.add('is-show');
        window.removeEventListener('keydown',keyEvent);
    }
    
}

// score 업데이트 애니메이션
function updateScore(score) {
    currentScore.classList.add('updating');
    setTimeout(()=>{
        currentScore.innerText = score;
        currentScore.classList.remove('updating')    
    },300)
}

function updateLevel(score) {
    const calculatedLevel = Math.floor(score / 300);
    if(calculatedLevel === level) return;
    level = calculatedLevel;
    speed -=  30;
}

function resetLevel() {
    level = 0
    speed = 500
}

const DIRECTION_FN_MAP = {
    UP: () => moveDirection(),
    LEFT: () => moveItem('left', -1),
    DOWN: () => moveItem('top', 1),
    RIGHT: () => moveItem('left', 1),
}


Array.from(btnArrows).forEach(btn => {
    const [_, direction] = btn.className.split(' ');
    const key = direction.toUpperCase();

    btn.addEventListener('click',DIRECTION_FN_MAP[key])
})

btnAction.addEventListener('click', dropBlock)


