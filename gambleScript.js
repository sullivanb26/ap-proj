try {
  const items = {
    PiggyBank: {
      src: "piggyBank.png", 
      desc: "Additional $5 per roll",
      rarity: "Common"
    },
    Bonus: {
      src: "bonus.png", 
      desc: "Additional $10 per roll",
      rarity: "Common"
    },
    Multiplier: {
      src: "mult.png",
      desc: "Multiplies outcome by extra 0.1 per item",
      rarity: "Rare"
    },
    DoubleRoll: {
      src: "double.png",
      desc: "Gives an extra roll each turn",
      rarity: "Rare"
    },
    LuckyDie: {
      src: "lucky.png",
      desc: "Randomly rolls a number between 6 and 12",
      rarity: "Epic"
    },
    CashJackpot: {
      src: "jackpot.png",
      desc: "Gives $50 bonus on next roll",
      rarity: "Epic"
    },
    GoldRush: {
      src: "goldrush.png",
      desc: "Doubles total earnings once every 3 rounds",
      rarity: "Legendary"
    },
    DebtDoubler: { // DO A SCALE
      src: "debt.png",
      desc: "Increases the goal increase rate (hard mode) at a significant increase to wealth",
      rarity: "Legendary"
    },

    // NEGATIVES

    TaxAudit: {
      src: "taxAudit.png",
      desc: "Takes 20% of your money every round.",
      rarity: "Rare"
    },
    BadLuckDie: {
      src: "badLuckDie.png",
      desc: "Subtracts a random number between 1 and 3 from your earnings each roll.",
      rarity: "Rare"
    },
    LoanShark: {
      src: "loanshark.png",
      desc: "The loan shark demands his due. Half of every earning is taken.",
      rarity: "Rare"
    },
    Inflation: {
      src: "inflation.png",
      desc: "Everything’s getting more expensive. All new item costs increase by 50%.",
      rarity: "epic"
    },

  };

  const weights = [
    15, // Piggybank
    15, // Bonus
    5,  // Multiplier
    4,  // DoubleRoll
    4,  // LuckyDie
    2,  // CashJackpot
    1,  // GoldRush
    1,  // DebtDoubler
    1,  // TaxAudit
    1,  // BadLuckDie
    1,  // LoanShark
    1,  // Inflation
  ];

  const elems = {
    roll: document.getElementById("rollBtn"),
    nRolls: document.getElementById("nRolls"),
    mRolls: document.getElementById("mRolls"),
    money: document.getElementById("money"),
    round: document.getElementById("round"),
    add: document.getElementById("add"),
    dice: document.getElementsByClassName("die"),
    tooltip: document.getElementById("tooltip"),
    goal: document.getElementById("goal"),
  };

  let playerInv = [];
  let rolls = 0;
  let maxRolls = 10;
  let money = 0;
  let round = 1;
  let goal = 50;
  let diceMin = 1;
  let diceMax = 6;

  console.log(Object.keys(items));

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randProb(items, weights) {
    if (items.length !== weights.length) {
      throw new Error("Items and weights arrays must have the same length.");
    }

    const cumulativeWeights = [];
    let sum = 0;
    for (const weight of weights) {
      sum += weight;
      cumulativeWeights.push(sum);
    }

    const randomNumber = Math.random() * sum;

    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (cumulativeWeights[i] >= randomNumber) {
        return items[i];
      }
    }
    return null;
  }

  function count(list, item) {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (element == item) {
        count += 1;
      }
    }
    return count;
  }

  function roll() {
    if (rolls < maxRolls) {
      let earnMoney = 0;
      for (let num = 0; num < elems.dice.length; num++) {
        const die = elems.dice[num];
        const roll = getRandomInt(diceMin, diceMax);
        die.innerHTML = roll;
        earnMoney += roll;
      }
      rolls += 1;

      // Items Traits
      earnMoney += count(playerInv, "Bonus") * 10; // Bonus
      earnMoney = (count(playerInv, "Multiplier") * 0.1 + 1) * earnMoney; // Multiplier
      if (count(playerInv, "MoneyMultiplier") > 0) {
        earnMoney *= 1.5; // Money Multiplier
      }
      if (count(playerInv, "LuckyDie") > 0) {
        earnMoney += getRandomInt(6, 12); // Lucky Die
      }
      if (count(playerInv, "CashJackpot") > 0) {
        earnMoney += 50; // Cash Jackpot
        playerInv = playerInv.filter(item => item !== "CashJackpot"); // One-time use
      }

      earnMoney = Math.floor(earnMoney * 100) / 100;
      money += earnMoney;
      money = Math.floor(money * 100) / 100;
      elems.nRolls.innerHTML = rolls;
      elems.money.innerHTML = `$${money}`;
      elems.add.innerHTML = `+$${earnMoney}`;

      if (rolls == maxRolls) {
        elems.roll.innerHTML = "New Round";
      }
    } else {
      if (money > goal) {
        money -= goal;
        round += 1;
        elems.round.innerHTML = round;
        elems.roll.innerHTML = "Roll";
        rolls = 0;
        elems.nRolls.innerHTML = rolls;

        let debtFactor = 1.3 + 0.1 * count(playerInv, "DebtDoubler");
        diceMax = 6 + count(playerInv, "DebtDoubler");
        goal = Math.floor(goal * debtFactor);
        elems.goal.innerHTML = `$${goal}`;

        newItem();
      } else {
        lose();
      }
    }
  }

  function tooltip(type, evt) {
    elems.tooltip.style.visibility = "visible";
    elems.tooltip.innerHTML = `<span>${type}</span><hr><span>${items[type].desc}</span>`;
    elems.tooltip.style.left = `${evt.clientX}px`;
    elems.tooltip.style.top = `${evt.clientY}px`;
  }

  function skipItem() {
    money -= Math.floor(money*0.5);
    document.getElementById("newItem").style.visibility = "hidden";
  }

  function newItem() {
    // Gradual cost increase based on items already owned
    let cost = Math.floor(15 + Math.log(playerInv.length + 1) * 10);
    document.getElementById("newItem").style.visibility = "visible";
    document.getElementById("skipCost").innerHTML = `Skip $${money/2}`;
    
    for (let i = 0; i < document.getElementsByClassName("item").length; i++) {
      const element = document.getElementsByClassName("item")[i];
      let newType = randProb(Object.keys(items), weights);
      element.setAttribute("type", newType);
      element.setAttribute("cost", cost);
      element.src = `sprites/${items[newType].src}`;
      element.parentElement.children[1].innerHTML = `${newType} - <span style="color: lawngreen">$${cost}</span>`;
    }
  }

  function giveItem(type, cost) {
    if (money >= cost) {
      money -= cost;
      elems.money.innerHTML = `$${money}`;
      document.getElementById("newItem").style.visibility = "hidden";
      playerInv.push(type);
      console.log(playerInv);
      document.getElementById('inventory').innerHTML += `<img src="${items[type].src}" alt="${type}" type=${type}>`;
    }
    maxRolls = count(playerInv, "DoubleRoll") + 10;
    elems.mRolls.innerHTML = maxRolls;
    diceMax = 6 + count(playerInv, "DebtDoubler");
  }

  for (let i = 0; i < document.getElementsByClassName("item").length; i++) {
    const elem = document.getElementsByClassName("item")[i];
    elem.onmousemove = function (event) {
      tooltip(this.getAttribute("type"), event);
    };
    elem.onmouseleave = function () {
      elems.tooltip.style.visibility = "hidden";
    };
    elem.onmousedown = function () {
      giveItem(this.getAttribute("type"), this.getAttribute("cost"));
    };
  }

  // newItem();
  elems.money.innerHTML = `$${money}`;
} catch (error) {
  alert(error);
}
