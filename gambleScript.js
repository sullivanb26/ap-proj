try {
  const items = {
    PiggyBank: {
      src: "piggyBank.png",
      desc: "Earns an additional $5 per roll",
      rarity: "Common",
    },
    Bonus: {
      src: "bonus.png",
      desc: "Earns an additional $10 per roll",
      rarity: "Common",
    },
    Multiplier: {
      src: "mult.png",
      desc: "Multiplies earnings by +0.1 per item",
      rarity: "Rare",
    },
    DoubleRoll: {
      src: "double.png",
      desc: "Adds an extra die",
      rarity: "Rare",
    },
    LuckyDie: {
      src: "lucky.png",
      desc: "Random bonus between 6-12 each roll",
      rarity: "Epic",
    },
    CashJackpot: {
      src: "jackpot.png",
      desc: "One-time $50 bonus",
      rarity: "Epic",
    },
    GoldRush: {
      src: "goldrush.png",
      desc: "Doubles all cash every 3 rounds",
      rarity: "Legendary",
    },
    DebtDoubler: {
      src: "debt.png",
      desc: "Hard mode. Debt grows faster, but higher dice rolls",
      rarity: "Legendary",
    },
    TaxAudit: {
      src: "taxAudit.png",
      desc: "Lose 20% of total earn each round, but 1% chance to get a tax refund.",
      rarity: "Rare",
    },
    BadLuckDie: {
      src: "badLuckDie.png",
      desc: "Subtract 1-3 from every roll",
      rarity: "Rare",
    },
    LoanShark: {
      src: "loanshark.png",
      desc: "Increase total earn of rolls by 75%, but 25% chance to subtract 20% of total money.",
      rarity: "Rare",
    },
    Inflation: {
      src: "inflation.png",
      desc: "New item costs increase by 50%",
      rarity: "Epic",
    },
  };

  const weights = [25, 20, 10, 10, 8, 4, 3, 2, 3, 3, 3, 2];

  const elems = {
    roll: document.getElementById("rollBtn"),
    nRolls: document.getElementById("nRolls"),
    mRolls: document.getElementById("mRolls"),
    money: document.getElementById("money"),
    round: document.getElementById("round"),
    add: document.getElementById("add"),
    diceContainer: document.querySelector(".dice"),
    tooltip: document.getElementById("tooltip"),
    goal: document.getElementById("goal"),
    inventory: document.getElementById("inventory"),
  };

  let playerInv = [],
    rolls = 0,
    money = 0,
    round = 1,
    refund = 0;
  let maxRolls = 5,
    diceMin = 1,
    diceMax = 6;
  let goal = 50;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randProb(items, weights) {
    const cumulative = weights.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
    const r = Math.random() * cumulative[cumulative.length - 1];
    return Object.keys(items)[cumulative.findIndex((w) => w >= r)];
  }

  function count(list, item) {
    return list.filter((i) => i === item).length;
  }

  function updateDiceVisuals() {
    const totalDice = 6 + count(playerInv, "DoubleRoll");
    elems.diceContainer.innerHTML = "";
    for (let i = 0; i < totalDice; i++) {
      const d = document.createElement("div");
      d.className = "die";
      d.innerText = "1";
      elems.diceContainer.appendChild(d);
    }
  }

  function updateInventoryDisplay() {
    elems.inventory.innerHTML = "";
    for (const item of playerInv) {
      const img = document.createElement("img");
      img.src = `sprites/${items[item].src}`;
      img.alt = item;
      img.setAttribute("type", item);
      img.title = `${item}\n${items[item].desc}`;
      img.onmousemove = (e) => tooltip(item, e);
      img.onmouseleave = () => (elems.tooltip.style.visibility = "hidden");
      elems.inventory.appendChild(img);
    }
  }

  function updateGoal() {
    elems.goal.innerText = `$${goal}`;
  }

  function roll() {
    const diceElems = document.querySelectorAll(".die");
    if (rolls < maxRolls) {
      let earnMoney = 0;
      diceElems.forEach((die) => {
        const rollVal = getRandomInt(diceMin, diceMax);
        die.innerText = rollVal;
        earnMoney += rollVal;
      });

      rolls++;
      earnMoney += count(playerInv, "Bonus") * 10;
      earnMoney += count(playerInv, "PiggyBank") * 5;
      earnMoney = (1 + 0.1 * count(playerInv, "Multiplier")) * earnMoney;

      if (count(playerInv, "LuckyDie")) {
        const bonus = getRandomInt(6, 12);
        earnMoney += bonus;
        showFloating("Lucky +" + bonus);
      }
      if (playerInv.includes("CashJackpot")) {
        earnMoney += 50;
        playerInv = playerInv.filter((i) => i !== "CashJackpot");
        showFloating("Jackpot +50!");
      }
      
      if (count(playerInv, "BadLuckDie")) earnMoney -= getRandomInt(1, 3)*diceElems.length;
      
      if (count(playerInv, "LoanShark")) {
        if (Math.random() > 0.25) {
          earnMoney *= 1.75;
          earnMoney = Math.floor(earnMoney);
        } else {
          money += earnMoney;
          money *= 0.8;
        }
      } else {
        earnMoney = Math.floor(earnMoney);
        money += earnMoney;
      }
      if (Math.random() > (0.01*count(playerInv, "TaxAudit")) && count(playerInv, "TaxAudit") > 0) {
        refund += money*.2;
        money = Math.floor(money * 0.8);
      } else if (count(playerInv, "TaxAudit") > 0) {
        money = money + refund;
        refund = 0;
      }
      money = Math.floor(money);
      elems.nRolls.innerText = rolls;
      elems.mRolls.innerText = maxRolls;
      elems.money.innerText = `$${money}`;
      elems.add.innerText = `+$${earnMoney}`;
      updateInventoryDisplay();

      if (rolls === maxRolls) elems.roll.innerText = "New Round";
    } else {
      if (money >= goal) {
        money -= goal;
        round++;
        rolls = 0;
        diceMax = 6 + count(playerInv, "DebtDoubler");

        let increaseFactor = 1.3 + 0.1 * count(playerInv, "DebtDoubler");
        goal = Math.floor(goal * increaseFactor);
        updateGoal();

        if (count(playerInv, "GoldRush") && round % 3 === 0) {
          money *= 2;
          showFloating("GOLD RUSH! 2X Money!", "gold");
        }

        elems.roll.innerText = "Roll";
        elems.round.innerText = round;
        elems.nRolls.innerText = rolls;
        elems.mRolls.innerText = maxRolls;
        elems.money.innerText = `$${money}`;
        elems.add.innerText = "";
        newItem();
        updateDiceVisuals();
      } else {
        alert("You didn't reach the goal and lost!");
        location.reload();
      }
    }
  }

  function showFloating(text, color = "lawngreen") {
    const float = document.createElement("div");
    float.innerText = text;
    Object.assign(float.style, {
      position: "absolute",
      top: "20%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: color,
      color: "black",
      padding: "1rem",
      borderRadius: "1rem",
      zIndex: 1000,
    });
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 2000);
  }

  function tooltip(type, evt) {
    elems.tooltip.style.visibility = "visible";
    elems.tooltip.innerHTML = `<span>${type}</span><hr><span>${items[type].desc}</span>`;
    elems.tooltip.style.left = `${evt.clientX}px`;
    elems.tooltip.style.top = `${evt.clientY}px`;
  }

  function skipItem() {
    money = Math.floor(money * 0.5);
    document.getElementById("newItem").style.visibility = "hidden";
  }

  function newItem() {
    const baseCost = Math.floor(15 + Math.log(playerInv.length + 1) * 10);

    // Define cost multipliers per rarity
    const rarityMultipliers = {
      Common: 1,
      Rare: 1.5,
      Epic: 2.5,
      Legendary: 4,
    };

    document.getElementById("newItem").style.visibility = "visible";
    document.getElementById("skipCost").innerHTML = `Skip $${Math.floor(
      money / 2
    )}`;

    const picks = document.getElementsByClassName("item");
    for (let i = 0; i < picks.length; i++) {
      const elem = picks[i];
      const newType = randProb(items, weights);

      const rarity = items[newType].rarity || "Common";
      const cost = Math.floor(baseCost * (rarityMultipliers[rarity] || 1));

      elem.setAttribute("type", newType);
      elem.setAttribute("cost", cost);
      elem.src = `sprites/${items[newType].src}`;
      elem.parentElement.children[1].innerHTML = `${newType} - <span style='color: lawngreen'>$${cost}</span>`;
    }
  }

  function giveItem(type, cost) {
    if (money >= cost) {
      money -= cost;
      elems.money.innerHTML = `$${money}`;
      document.getElementById("newItem").style.visibility = "hidden";
      playerInv.push(type);
      updateInventoryDisplay();
    }

    diceMax = 6 + count(playerInv, "DebtDoubler");
    updateDiceVisuals();
  }

  document.querySelectorAll(".item").forEach((elem) => {
    elem.onmousemove = (e) => tooltip(elem.getAttribute("type"), e);
    elem.onmouseleave = () => (elems.tooltip.style.visibility = "hidden");
    elem.onclick = () =>
      giveItem(elem.getAttribute("type"), elem.getAttribute("cost"));
  });

  updateDiceVisuals();
  updateInventoryDisplay();
  updateGoal();
  elems.mRolls.innerText = maxRolls;
  elems.money.innerText = `$${money}`;
} catch (e) {
  alert(e);
}
