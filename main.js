import Block from './block.js'

const container = document.querySelector('.container');
const MY = 20;
const MX = 10;

function blockType() {
    const number = Math.floor(Math.random()*7);
    return Object.entries(Block)[number][0];
}

blockType();

let tempMovingItem;
let movingItem = {
    type: '',
    direction: 0,
    top: 0,
    left: 0,
}

// 실행
init();


function init() {
    drawBoard();
    movingItem.type = blockType();
    tempMovingItem = { ...movingItem };
    renderBlock();
}


// 배경작성
function drawBoard() {
    let boardTag = `<table border=0>`;
    for(let i = 0; i < MY; i++) {
        boardTag += `<tr>`

        for(let j = 0; j < MX; j++) {
            boardTag += `<td id="row${i}col${j}"></td>`
        }

        boardTag += `</tr>`
    }
    boardTag += `</table>`
    container.innerHTML = boardTag;
}
// 렌더링
function renderBlock(movetype = '') {
    // 변수를 사용하기 위해서
    const {type, direction, left, top} = tempMovingItem;
    
    // 기존에 위치한 블럭의 색깔을 없앤다.
    let target = document.querySelectorAll('.moving')
    target.forEach(element => {
        element.classList.remove(type, 'moving');
    })

    // 렌더링
    // 블록 타입에 해당하는 모양이 담긴 배열을 가지고 온다.
    const block = Block[type][direction];
    //Some : 해당 블록중에 selctor로 선택한 아이가 없으면 엘리먼트 중에 하나라도 해당 되면 멈추게 한다.
    block.some(element => {
        let item = document.querySelector(`#row${element[0] + top}col${element[1] + left}`);
        // 움직일 아이템을 선택하지 못했다면 false
        // 가능한 움직임인지 체크 
        checkAvailable(item)
        if(checkAvailable(item) === false) {
            // 원래 임시로 담겨있던 무빙블록아이템으로 다시 반환해준다.
            tempMovingItem = { ...movingItem }
            setTimeout(()=>{
                renderBlock();
                // 움직이는 방향이 top y축 값이면 값을 고정한다.
                if(movetype === 'top') {
                    seizeBlock();
                }
            }, 0)
            // 그리고 멈추기 위해서 리턴해준다.
            return true;
            
        } else {
            // 움직일 수 있으면 클래스를 달아주고
            item.classList.add(type, 'moving'); 
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
    if(item === null || item.classList.contains('seize')) { 
        return false
    }
    return true;
}
// 움직이는 방향 move type, 얼만큼 value
function moveItem(movetype, value) {
    tempMovingItem[movetype] += value
    renderBlock(movetype)
}
function seizeBlock() {
    const block = document.querySelectorAll('.moving');
    block.forEach(element => {
        element.classList.remove('moving');
        element.classList.add('seize');
    })
    checkLine();
}

function moveDirection() {
    tempMovingItem.direction += 1;
    tempMovingItem.direction = (tempMovingItem.direction > 3) ? 0 : tempMovingItem.direction;
    renderBlock();
}
// 새로운 블록을 만드는 변수
function createBlock() {
    const randomType = blockType();
    movingItem.left = 3;
    movingItem.top = 0;
    movingItem.direction = 0;
    movingItem.type = randomType;
    
    renderBlock();
}
// 라인을 체크하는 함수
function checkLine() {
    console.log('체크');
    const tr = container.querySelectorAll('tr')
    // 행
    let match;
    tr.forEach((element)=> {
        const td = element.querySelectorAll('td')
// 열 중에서 하나라도 false 가 되면
        td.some(node => {
            if(!node.classList.contains('seize')) {
                match = false;
                return false;
            }
            else {
                match = true;
                return true;
                
            }
        });
    });
    console.log(match)
    createBlock()

}

window.addEventListener(`keydown`,(e) => {
    switch(e.keyCode) {
        case 38:
            // direction 값을 올리면 다른 배열을 호출해서 모양이 변하게한다.
            console.log('UP')
            moveDirection()
            break;
        case 39:
            console.log('RIGHT')
            moveItem('left', 1);
            break;
        case 40:
            e.preventDefault();
            console.log('DOWN')
            moveItem('top', 1);
            break;
        case 37:
            console.log('LEFT')
            moveItem('left', -1);
            break;
        case 32:
            e.preventDefault();
            console.log('space');
    }
})

const duration = setInterval(() => {
    moveItem('top', 1);
    // checkGameover
}, 500);

clearInterval(duration);
