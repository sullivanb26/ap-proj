try {
const items = {
  "bonus" : { desc: "This item gives an additional $10 per roll" }
}
const elems = {
  roll: document.getElementById('rollBtn'),
  nRolls: document.getElementById('nRolls'),
  money: document.getElementById('money'),
  round: document.getElementById('round'),
  add: document.getElementById('add'),
  dice: document.getElementsByClassName('die'),
  tooltip: document.getElementById('tooltip')
}
let rolls = 0;
let maxRolls = 10;
let money = 0;
let round = 1;
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function roll() {
  if (rolls < maxRolls) {
    let tempMoney = money;
    for (let num = 0; num < elems.dice.length; num++) {
      const die = elems.dice[num];
      const roll = getRandomInt(1, 6);
      die.innerHTML = roll;
      money += roll;
    }
    rolls += 1;
    elems.nRolls.innerHTML = rolls;
    elems.money.innerHTML = money;
    elems.add.innerHTML = money - tempMoney;
    if (rolls == maxRolls) {
      elems.roll.innerHTML = "New Round";
    }
  } else {
    round += 1;
    elems.round.innerHTML = round;
    elems.roll.innerHTML = "Roll";
    rolls = 0;
    elems.nRolls.innerHTML = rolls;
  }
}
function tooltip(type) {
  // alert(type);
  elems.tooltip.innerHTML = `<span>${}</span><hr><span>${}</span>`
}
for (let i = 0; i < document.getElementsByClassName('item').length; i++) {
  const elem = document.getElementsByClassName('item')[i];
  elem.onmousemove = function(){tooltip(this.getAttribute('itemType'))};
  elem.onmouseleave = function(){closeTooltip()};
}
} catch (error) {
 alert(error); 
}