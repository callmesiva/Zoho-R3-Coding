//Problem statement and Intial element positions
// let mapSize = 11; //anything below 26 
// let playerPosition = "CB";
// let villainPosition = ["BH", "DF", "FJ", "JJ"];
// let keyPosition = "FD";
// let bricksPosition = ["DD", "FB", "FF", "GB", "HD"];
// let dynamite = ["ED","FC"];
// let extraPower = ["BD", "CD"];

let mapSize = 21; // Updated map size
let playerPosition = "CB";
let villainPosition = ["BH", "DF", "FJ", "JJ", "PH", "IK", "LK", "MN"];
let keyPosition = "FD";
let bricksPosition = ["DD", "FB", "FF", "GB", "HD", "KK", "LL", "MM", "NN", "OP"];
let dynamite = ["ED", "FC", "PO", "OI"];
let extraPower = ["BD", "CD", "AI", "AJ"];


//Required declarations
let prompt = require("prompt-sync")({ sigint: true }); //used to get input from user
let bombPosition = []; //used to know where bomb is
let initialVillainMove = ["U", "F", "U", "F"]; //Intial villain movement Up or Forward based on odd even positions
let activedDynamite = []; //to push activated dynamite
let activatedPowers = []; //to push activated power
let activeTimeBomb = []; //to push activated timebomb
let currentPlayerPosition = playerPosition; //copy of current player positions to modify further
let gameMap; //main gameMap array

//Map Elements
// * means walls - can't go through it
// P means Player - control movement using below keys dead by explosion or villain touched
// B means Bricks - static but blast when explosion happens
// M means Dynamite - triggered when near by explosion
// V means villain - moves either horizontaly and verically once two or more villain meet each both die
// K means Key - player win once get to the key
// X means Bomb - explode 4 or 8 direction or 1 or 2 tile range based on what power player have
// T means TimeBomb - explode after 3 second once placed
// 1 means extra power 1 - bomb explode range increase 1 tile surrounding to 2 tile surrounding
// 2 means extra power 2 - bomb explode direction increases to addition 4 daigonal directions


//to create main map and place elements
function playGround(mapSize,playerPosition,villainPosition,keyPosition,bricksPosition,bombPosition,extraPower,dynamite) {

  //Key Instruction
  // console.log("Press W to move up:");
  // console.log("Press S to move down:");
  // console.log("Press Q to move upleft:"); 
  // console.log("Press E to move upright:");
  // console.log("Press Z to move downleft:");
  // console.log("Press C to move downright:");
  // console.log("Press X for bomb:");

  //Create an N*N empty array of mapSize
  gameMap = Array.from({ length: mapSize }, () => Array(mapSize).fill(" "));

  //build a wall
  for (let i = 0; i < mapSize; i++) {
    gameMap[0][i] = "*";
    gameMap[i][0] = "*";
    gameMap[mapSize - 1][i] = "*";
    gameMap[i][mapSize - 1] = "*";
  }

  //build a inside wall
  for (let i = 2; i < mapSize - 2; i = i + 2) {
    for (let j = 2; j < mapSize - 2; j = j + 2) {
      gameMap[i][j] = "*";
    }
  }

  //this func is heart of the map to place elements on their positions
  function palceElements(position, value) {
    const [i, j] = position.split("").map((char) => char.charCodeAt(0) - "A".charCodeAt(0));
    gameMap[i][j] = value;
  }

  //below codes are used to call placeElements func of each elements
  palceElements(playerPosition, "P");
  palceElements(keyPosition, "K");

  for (let i = 0; i < villainPosition.length; i++) {
    palceElements(villainPosition[i], "V");
  }

  for (let i = 0; i < bricksPosition.length; i++) {
    palceElements(bricksPosition[i], "B");
  }

  for (let i = 0; i < bombPosition.length; i++) {
    palceElements(bombPosition[i], "X");
  }

  for (let i = 0; i < extraPower.length; i++) {
    if (extraPower[i] == 0) continue;
    else palceElements(extraPower[i], i + 1);
  }

  for (let i = 0; i < dynamite.length; i++) {
    palceElements(dynamite[i], "M");
  }

  for (let i = 0; i < activeTimeBomb.length; i++) {
    palceElements(activeTimeBomb[i], "T");
  }

  //print upper alphabat row
  console.log("  " + Array.from({ length: mapSize }, (v, i) => String.fromCharCode("A".charCodeAt(0) + i)).join(" "));

  //print each row of gameMap array with staring alphabat value
  for (let i = 0; i < mapSize; i++) {
    console.log(String.fromCharCode("A".charCodeAt(0) + i) + " " + gameMap[i].join(" "));
  }
}

//bomb detonate logic of all 8 direction
function bombDetonate(currBombPosition, flag) {
  //convert alphabat position to num and assign to multiple varible to handle bomb explode directions
  //for ex currBombPositions = "CB" 1st set a var denote row so take "C" convert into 3 assign to multiple row varible
  //for ex currBombPositions = "CB" 2nd set a var denote col so take "B" convert into 2 assign to multiple col varible
  var U = D = ULR = URR = DLR = DRR = currBombPosition[0].charCodeAt(0) - "A".charCodeAt(0);
  var R = L = ULC = URC = DLC = DRC = currBombPosition[1].charCodeAt(0) - "A".charCodeAt(0);

  //this func used to convert num to alphabat to restore altered positions for ex: i=3, j=2 => returns "CB"
  function crrPosition(i, j) {
    return (String.fromCharCode("A".charCodeAt(0) + i) + String.fromCharCode("A".charCodeAt(0) + j));
  }

  let bombRange = 1;
  //if user get an extra power increase bombblast range
  if (activatedPowers.includes(1)) bombRange = 2;
  //if I call this function for dynamite explode it always 1 tile range
  if (flag) bombRange = 1;

  //handle up side explosion logic
  //need to create requied temp variables for if + or - rows and col straight away it cause mismatches in other directions
  let temp1 = U,tempU;
  for (let up = 0; up < bombRange; up++) {
    tempU = --temp1;
    //any one of the row or col value goes below 0 we need handle to prevent through error
    if (tempU >= 0 && R >= 0) {
      //if we met a wall need break break and go to another direction
      if (gameMap[tempU][R] == "*") {
        break;
      }
      //if we meet a brick while explosion remove brick from brick array
      else if (gameMap[tempU][R] == "B") {
        //we check values in gameMap so even though we remove values from respective array 
        //we need to mark that position 0 or whatever
        //maybe when other iteration that value stil in gameMap so condition going to valid
        //but in array that elements removed its causes serious mismatch in result 
        gameMap[tempU][R] = 0
        let brick = crrPosition(tempU, R);
        let index = bricksPosition.indexOf(brick);
        bricksPosition.splice(index, 1);
      } 
      //if we meet a villain while explosion remove villain from villain array
      else if (gameMap[tempU][R] == "V") {
        gameMap[tempU][R] = 0;
        let villain = crrPosition(tempU, R);
        let index = villainPosition.indexOf(villain);
        villainPosition.splice(index, 1);
      } 
      //if we meet a dynamite mark current position as 0 to avoid infinte recurrsion
      //and remove dynamite from dynamite array and push that position into activeDynamite array
      else if (gameMap[tempU][R] == "M") {
        gameMap[tempU][R] = 0;
        dynamite.splice(dynamite.indexOf(gameMap[tempU][R]), 1);
        activedDynamite.push(crrPosition(tempU, R));
      } 
      //if meet a player return -1 
      else if (gameMap[tempU][R] == "P") {
        return -1;
      }
    }
  }
 
  //same logic of up 
  let temp2 = D,tempD;
  for (let down = 0; down < bombRange; down++) {
    tempD = ++temp2;
    if (tempD >= 0 && R >= 0) {
      if (gameMap[tempD][R] == "*") {
        break;
      } else if (gameMap[tempD][R] == "B") {
        gameMap[tempD][R] = 0;
        let brick = crrPosition(tempD, R);
        let index = bricksPosition.indexOf(brick);
        bricksPosition.splice(index, 1);
      } else if (gameMap[tempD][R] == "V") {
        gameMap[tempD][R] = 0
        let villain = crrPosition(tempD, R);
        let index = villainPosition.indexOf(villain);
        villainPosition.splice(index, 1);
      } else if (gameMap[tempD][R] == "M") {
        gameMap[tempD][R] = 0;
        dynamite.splice(dynamite.indexOf(gameMap[tempD][R]), 1);
        activedDynamite.push(crrPosition(tempD, R));
      } else if (gameMap[tempD][R] == "P") {
        return -1;
      }
    }
  }

  //same logic of up
  let temp3 = R,tempR;
  for (let right = 0; right < bombRange; right++) {
    tempR = ++temp3;
    if (U >= 0 && tempR >= 0) {
      if (gameMap[U][tempR] == "*") {
        break;
      } else if (gameMap[U][tempR] == "B") {
        gameMap[U][tempR] = 0
        let brick = crrPosition(U, tempR);
        let index = bricksPosition.indexOf(brick);
        bricksPosition.splice(index, 1);
      } else if (gameMap[U][tempR] == "V") {
        gameMap[U][tempR] = 0
        let villain = crrPosition(U, tempR);
        let index = villainPosition.indexOf(villain);
        villainPosition.splice(index, 1);
      } else if (gameMap[U][tempR] == "M") {
        gameMap[U][tempR] = 0;
        dynamite.splice(dynamite.indexOf(gameMap[U][tempR]), 1);
        activedDynamite.push(crrPosition(U, tempR));
      } else if (gameMap[U][tempR] == "P") {
        return -1;
      }
    }
  }

  // //same logic of up
  let temp4 = L,tempL;
  for (let left = 0; left < bombRange; left++) {
    tempL = --temp4;
    if (U >= 0 && tempL >= 0) {
      if (gameMap[U][tempL] == "*") {
        break;
      } else if (gameMap[U][tempL] == "B") {
        gameMap[U][tempL] = 0
        let brick = crrPosition(U, tempL);
        let index = bricksPosition.indexOf(brick);
        if(index >=0) bricksPosition.splice(index, 1);
      } else if (gameMap[U][tempL] == "V") {
        gameMap[U][tempL] = 0
        let villain = crrPosition(U, tempL);
        let index = villainPosition.indexOf(villain);
       if(index >=0) villainPosition.splice(index, 1);
      } else if (gameMap[U][tempL] == "M") {
        gameMap[U][tempL] = 0;
        dynamite.splice(dynamite.indexOf(gameMap[U][tempL]), 1);
        activedDynamite.push(crrPosition(U, tempL));
      } else if (gameMap[U][tempL] == "P") {
        return -1;
      }
    }
  }

  //if player gets power 2 the explosion should be another 4 direction
  //same logic of up but need to change row and col for one daigonal movement


  if (activatedPowers.includes(2) || flag) {
    let temp5 = ULR,temp6 = ULC,tempULR,tempULC;
    for (let upLeft = 0; upLeft < bombRange; upLeft++) {
      tempULR = --temp5;
      tempULC = --temp6;
      if (tempULR >= 0 && tempULC >= 0) {
        if (gameMap[tempULR][tempULC] == "*") {
          break;
        } else if (gameMap[tempULR][tempULC] == "B") {
          gameMap[tempULR][tempULC] = 0
          let brick = crrPosition(tempULR, tempULC);
          let index = bricksPosition.indexOf(brick);
          bricksPosition.splice(index, 1);
        } else if (gameMap[tempULR][tempULC] == "V") {
          gameMap[tempULR][tempULC] = 0
          let villain = crrPosition(tempULR, tempULC);
          let index = villainPosition.indexOf(villain);
          villainPosition.splice(index, 1);
        } else if (gameMap[tempULR][tempULC] == "M") {
          gameMap[tempULR][tempULC] = 0;
          dynamite.splice(dynamite.indexOf(gameMap[tempULR][tempULC]), 1);
          activedDynamite.push(crrPosition(tempULR, tempULC));
        } else if (gameMap[tempULR][tempULC] == "P") {
          return -1;
        }
      }
    }

    let temp7 = URR,temp8 = URC,tempURR,tempURC;
    for (let upRight = 0; upRight < bombRange; upRight++) {
      tempURR = --temp7;
      tempURC = ++temp8;
      if (tempURC >= 0 && tempURR >= 0) {
        if (gameMap[tempURR][tempURC] == "B") {
          gameMap[tempURR][tempURC] = 0;
          let brick = crrPosition(tempURR, tempURC);
          let index = bricksPosition.indexOf(brick);
          bricksPosition.splice(index, 1);
        } else if (gameMap[tempURR][tempURC] == "V") {
          gameMap[tempURR][tempURC] = 0;
          let villain = crrPosition(tempURR, tempURC);
          let index = villainPosition.indexOf(villain);
          villainPosition.splice(index, 1);
        } else if (gameMap[tempURR][tempURC] == "M") {
          gameMap[tempURR][tempURC] = 0;
          dynamite.splice(dynamite.indexOf(gameMap[tempURR][tempURC]), 1);
          activedDynamite.push(crrPosition(tempURR, tempURC));
        } else if (gameMap[tempURR][tempURC] == "P") {
          return -1;
        }
      }
    }

  
    let temp9 = DLR,temp10 = DLC,tempDLR,tempDLC;
    for (let downRight = 0; downRight < bombRange; downRight++) {
      tempDLR = ++temp9;
      tempDLC = ++temp10;
      if (tempDLC >= 0 && tempDLR >= 0) {
        if (gameMap[tempDLR][tempDLC] == "B") {
          gameMap[tempDLR][tempDLC] = 0;
          let brick = crrPosition(tempDLR, tempDLC);
          let index = bricksPosition.indexOf(brick);
          bricksPosition.splice(index, 1);
        } else if (gameMap[tempDLR][tempDLC] == "V") {
          gameMap[tempDLR][tempDLC] = 0;
          let villain = crrPosition(tempDLR, tempDLC);
          let index = villainPosition.indexOf(villain);
          villainPosition.splice(index, 1);
        } else if (gameMap[tempDLR][tempDLC] == "M") {
          gameMap[tempDLR][tempDLC] = 0;
          dynamite.splice(dynamite.indexOf(gameMap[tempDLR][tempDLC]), 1);
          activedDynamite.push(crrPosition(tempDLR, tempDLC));
        } else if (gameMap[tempDLR][tempDLC] == "P") {
           console.log("B");
          return -1;
        }
      }
    }

    let temp11 = DRR,temp12 = DRC,tempDRR,tempDRC;
    for (let downleft = 0; downleft < bombRange; downleft++) {
      tempDRR = ++temp11;
      tempDRC = --temp12;
      if (tempDRC >= 0 && tempDRR >= 0) {
        if (gameMap[tempDRR][tempDRC] == "B") {
          gameMap[tempDRR][tempDRC] = 0;
          let brick = crrPosition(tempDRR, tempDRC);
          let index = bricksPosition.indexOf(brick);
          bricksPosition.splice(index, 1);
        } else if (gameMap[tempDRR][tempDRC] == "V") {
          gameMap[tempDRR][tempDRC] = 0;
          let villain = crrPosition(tempDRR, tempDRC);
          let index = villainPosition.indexOf(villain);
          villainPosition.splice(index, 1);
        } else if (gameMap[tempDRR][tempDRC] == "M") {
          gameMap[tempDRR][tempDRC] = 0;
          dynamite.splice(dynamite.indexOf(gameMap[tempDRR][tempDRC]), 1);
          activedDynamite.push(crrPosition(tempDRR, tempDRC));
        } else if (gameMap[tempDRR][tempDRC] == "P") {
          return -1;
        }
      }
    }
  }

  //recurrsive part of activeDynamite we need to recurrsivly call this function until activeDynamite array going to empty
  //if we meet another dynamite while blasting dynamite againg add that into activeDynamite until unless array going to empty
  for (let i = 0; i < activedDynamite.length; i++) {
    let temp = activedDynamite[i];
    //remove the element after pass into that func to empty array
    activedDynamite.splice(i, 1);
    //call function recurrsivly
    bombDetonate(temp, true);
  }
}

//timebomb detonate logic after 3 second
function timeBombDetonate(currentPlayerPosition) {
  console.log("Time bomb set successfully and auto detonate after 3sec",currentPlayerPosition);
  //after the 3sec this function will be executed (ONLY IF CALL STACK IS EMPTY) I'll explain that below
  setTimeout(() => {
    let checkAccidentKill = bombDetonate(activeTimeBomb.pop(), false);
    console.log("Time Bomb Detonate Successfully");
    playGround(mapSize,playerPosition,villainPosition,keyPosition,bricksPosition,bombPosition,extraPower,dynamite);
    if (checkAccidentKill == -1)
      console.log("You accidentally Killed Yourself");
  }, 3000);
}

//handle villain movement all the initial movement are store in initial villain move array
function villainMovement(villainPosition) {
  //loop to the length of villains
  for (let i = 0; i < villainPosition.length; i++) {
    let villainTile = villainPosition[i];
    //convert villain alphabatic positions to numeric
    let crrRow = villainTile[0].charCodeAt(0) - "A".charCodeAt(0);
    let crrCol = villainTile[1].charCodeAt(0) - "A".charCodeAt(0);
    //func to turn numberic positions to alphabat
    function crrPosition(i, j) {
      return (String.fromCharCode("A".charCodeAt(0) + i) + String.fromCharCode("A".charCodeAt(0) + j));
    }

    //even value of array means up and down movement 
    if (i % 2 == 0) {
      let temp1 = crrCol;
      let tempCol = --temp1;
      let temp2 = crrCol;
      let tempCol1 = ++temp2;

      //if there is up movement 
      if (initialVillainMove[i] == "U") {
        //move up until any object other that empty space
        if (gameMap[crrRow][tempCol] == " ") {
          let newVillanMove = crrPosition(crrRow, tempCol);
          villainPosition.splice(i, 1, newVillanMove);
        } 
        //move down if obstracles in up and mark movements as down in a initial movement array to continue downward movement
        else if (gameMap[crrRow][tempCol1] == " ") {
          let newVillanMove = crrPosition(crrRow, tempCol1);
          villainPosition.splice(i, 1, newVillanMove);
          initialVillainMove[i] = "D";
        }
      } 
      //when its comes to another iteration the movement mentioned as down 
      //so follow same step move down until obstracles
      //if met an obstracles move up and mark U in initail array to continue upward movement
      else if (initialVillainMove[i] == "D") {
        if (gameMap[crrRow][tempCol1] == " ") {
          let newVillanMove = crrPosition(crrRow, tempCol1);
          villainPosition.splice(i, 1, newVillanMove);
        } else if (gameMap[crrRow][tempCol] == " ") {
          let newVillanMove = crrPosition(crrRow, tempCol);
          villainPosition.splice(i, 1, newVillanMove);
          initialVillainMove[i] = "U";
        }
      }
    }
    //same logic for odd row instead up and down its going to be forward and backward
    if (i % 2 != 0) {
      let temp1 = crrRow;
      let tempRow = --temp1;
      let temp2 = crrRow;
      let tempRow1 = ++temp2;
      if (initialVillainMove[i] == "F") {
        if (gameMap[tempRow][crrCol] == " ") {
          let newVillanMove = crrPosition(tempRow, crrCol);
          villainPosition.splice(i, 1, newVillanMove);
        } else if (gameMap[tempRow1][crrCol] == " ") {
          let newVillanMove = crrPosition(tempRow1, crrCol);
          villainPosition.splice(i, 1, newVillanMove);
          initialVillainMove[i] = "B";
        }
      } else if (initialVillainMove[i] == "B") {
        if (gameMap[tempRow1][crrCol] == " ") {
          let newVillanMove = crrPosition(tempRow1, crrCol);
          villainPosition.splice(i, 1, newVillanMove);
        } else if (gameMap[tempRow][crrCol] == " ") {
          let newVillanMove = crrPosition(tempRow, crrCol);
          villainPosition.splice(i, 1, newVillanMove);
          initialVillainMove[i] = "F";
        }
      }
    }
  }
}


/*
 * this is main loop and you need a good understanding of how javascript single thread syncronize work 
 * and behaviour of call-stack, call-back queue, eventloop works
 * how async function like settime-out, set-interval works
 * why I use set-Interval here is only for timebomb implementation
 * we need to execute time after 3 sec
 * but if we have never ending loop to get input from user for one move after another move 
 * our settime-out function not executed even after 3 sec
 * once code and function executed then only our async functions execute like settime-out etc
 * may be you think use await to stop where ever but in that case player also can't able to move timebomb detonate player will also die
 * the only way is use set-Interval. inside set-Interval there is one iteration loop
 * after one iternation set-interval terminated. and removed from call stack and our event-loop check is there any function presented in call-back queue
 * if we set a time bomb then after 3 sec our set time-out present in call-back queue it will executed 
 * after it also remove from call-stack. but our set-Interval again presended in call-back queue because it will continuously excuted after 0 intervel
 * this cycle repeats
 */
setInterval(() => {
  for (let i = 0; i < 1; i++) {
    //main gameMap function calling
    playGround(mapSize,playerPosition,villainPosition,keyPosition,bricksPosition,bombPosition,extraPower,dynamite);

    //move villain for each player mover
    villainMovement(villainPosition);
    //if villainPosition has two are more same positions then remove all for if two V meets kill both
    villainPosition = villainPosition.filter(
      (val, index, arr) => arr.indexOf(val) === arr.lastIndexOf(val)
    );

    //main promt to get user movement
    let palyerMove = prompt("Enter Player Movement :").toUpperCase();
 
    //convert current player position to alphabatic to numeric
    let crrRow = currentPlayerPosition[0].charCodeAt(0) - "A".charCodeAt(0);
    let crrCol = currentPlayerPosition[1].charCodeAt(0) - "A".charCodeAt(0);

    //player press x check is there any bomb in player position
    if (palyerMove == "X" && bombPosition[bombPosition.length - 1] == currentPlayerPosition ) {
      console.log("Move Player From Bomb Position First");
      continue;
    }
    //else do and call a function for each selections
     else if (palyerMove == "X") {
      let bombBehaviour = prompt(
        "Press 1 to plant, press 2 to detonate, press 3 to set-timeBomb :"
      );
      //press 1 means plant a bomb
      if (bombBehaviour == 1) {
        //user only allowed to plant 2 bomb plant more only after any one detonate
        if (bombPosition.length <= 1) {
          //to plant a bomb push current player position to bombposition array next time function call there will me x mark on that position
          bombPosition.push(currentPlayerPosition);
          console.log("Bomb has been planted Successfully");
        } else console.log("Maximum Bomb limit Reached");
        continue;
      } 
      //press 2 means detonate,
      else if (bombBehaviour == 2) {
        //check bombPosition array has value if not then no bombs 
        if (bombPosition[0]) {
          let crrBombPositon = bombPosition.pop();
          let checkAccidentKill = bombDetonate(crrBombPositon, false);
          //-1 means player within bomb detonate zone game ends
          if (checkAccidentKill == -1) {
            console.log("You accidentally Killed Yourself");
            break;
          } else {
            console.log("Bomb Detonate Successfully");
            continue;
          }
        } else console.log("No Bombs to Detonate");
        continue;
      }
       //press 3 to set timeBomb call timeBomb func with currentPlayerValue to set the current position
       else if (bombBehaviour == 3) {
        //push that location in activeTimeBomb array
        activeTimeBomb.push(currentPlayerPosition);
        timeBombDetonate(currentPlayerPosition);
        continue;
      } else {
        console.log("Invalid Move");
        continue;
      }
    }

    //player 8 direction movement for each type of key
    switch (palyerMove) {
      case "W":
        crrRow -= 1;
        break;
      case "S":
        crrRow += 1;
        break;
      case "D":
        crrCol += 1;
        break;
      case "A":
        crrCol -= 1;
        break;
      case "E":
        crrRow -= 1;
        crrCol += 1;
        break;
      case "C":
        crrRow += 1;
        crrCol += 1;
        break;
      case "Q":
        crrRow -= 1;
        crrCol -= 1;
        break;
      case "Z":
        crrRow += 1;
        crrCol -= 1;
        break;
      default:
        console.log("Invalid Move");
        break;
    }

    //if we hit a wall
    if (gameMap[crrRow][crrCol] === "*") {
      console.log("You Can't Go Through Wall");
      continue;
    }
    
    //change current player position alphabatic again
    currentPlayerPosition = String.fromCharCode("A".charCodeAt(0) + crrRow) +String.fromCharCode("A".charCodeAt(0) + crrCol);
 
    //if hit a brick
    if (bricksPosition.includes(currentPlayerPosition)) {
      console.log("You Encounter a Brick");
      continue;
    }

    //if hit a key
    if (currentPlayerPosition == keyPosition) {
      console.log("Congrats you win");
      break;
    }

    //check current player position has a villain too
    if (villainPosition.includes(currentPlayerPosition)) {
      console.log("You Encounter a Villain, You Lost");
      break;
    }

    //check current player position has a bomb
    if (bombPosition.includes(currentPlayerPosition)) {
      console.log("Can't Move to Bombs Position until Bomb Detonate ");
      continue;
    }

    //check is there any extra power on the current player direction
    if (extraPower.includes(currentPlayerPosition)) {
      let crrRow = currentPlayerPosition[0].charCodeAt(0) - "A".charCodeAt(0);
      let crrCol = currentPlayerPosition[1].charCodeAt(0) - "A".charCodeAt(0);
      //get which extra power in that current player position
      let index = extraPower.indexOf(currentPlayerPosition);
      //mark that index 0 to skip that position while creating map to avoid place powers again
      extraPower[index] = 0;
      //push that location into activatedPower array
      activatedPowers.push(gameMap[crrRow][crrCol]);
      //after changing currentPlayerPosition assign that into player position again
      playerPosition = currentPlayerPosition;
      continue;
    }
    playerPosition = currentPlayerPosition;
  }
}, 0);
