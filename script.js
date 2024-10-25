const players = [
    {
        name: "Rat👑",
        numStores: 9,
        multipliers: [1.5, 1.5, 2.0, 1.5, 1.5, 1.5, 1.5, 1.25, 1.0]
        
    },
    {
        name: "Öykü",
        numStores: 10,
        multipliers: [2, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.25]
    },
    {
        name: "franny",
        numStores: 10,
        multipliers: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    },
    {
        name: "Sinann",
        numStores: 10,
        multipliers: [1.5, 1.5, 2, 1.25, 1.5, 1.5, 1.5, 1.5, 1.25, 1.25]
    },
    {
        name: "Clawdia",
        numStores: 10,
        multipliers: [2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5]
    },
    {
        name: "Random Bean",
        numStores: 5,
        multipliers: [2, 2, 1.75, 1.5, 1.25]
    }

];

const playerSelect = document.getElementById('playerSelect');
players.forEach((player, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = player.name;
    playerSelect.appendChild(option);
});

document.getElementById('numStores').addEventListener('input', updateStores);

updateStores();

function updateStores() {
    const numStores = parseInt(document.getElementById('numStores').value);
    const storesSection = document.getElementById('storesSection');
    storesSection.innerHTML = '';  // Clear the section
    
    for (let i = 1; i <= numStores; i++) {
        storesSection.innerHTML += `
            <div class="store-input">
                <label for="store${i}Multiplier">Store ${i} Multiplier</label>
                <select id="store${i}Multiplier" required>
                    <option value="1">1</option>
                    <option value="1.25">1.25</option>
                    <option value="1.5">1.5</option>
                    <option value="1.75">1.75</option>
                    <option value="2">2</option>
                </select>
            </div>
        `;
    }
}

function updatePlayerInfo() {
    const selectedIndex = playerSelect.value;
    if (selectedIndex === "") return;

    const selectedPlayer = players[selectedIndex];

    const numStoresDropdown = document.getElementById('numStores');
    numStoresDropdown.value = selectedPlayer.numStores;

    updateStores();

    for (let i = 0; i < selectedPlayer.numStores; i++) {
        const multiplierDropdown = document.getElementById(`store${i + 1}Multiplier`);
        if (multiplierDropdown) {
            multiplierDropdown.value = selectedPlayer.multipliers[i];
        }
    }
}

document.getElementById('playerSelect').addEventListener('change', updatePlayerInfo);

const productionWindows = {
    tofu: 60,  
    beans: 30
};

const dishIngredients = {
    tofuPerDish: 2,  
    beansPerDish: 4,  
    pointsPerDish: 15
};

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hours and ${remainingMinutes} minutes`;
}

function calculatePlan() {
    const goalPoints = parseInt(document.getElementById('goalPoints').value) || 0;
    const tofuUnits = parseInt(document.getElementById('baseRateTofu').value) || 0;
    const beansUnits = parseInt(document.getElementById('baseRateBeans').value) || 0;
    const numStores = parseInt(document.getElementById('numStores').value);

    let tofuProduced = 0;
    let beansProduced = 0;
    let storeAllocations = [];

    let stores = [];
    for (let i = 1; i <= numStores; i++) {
        const storeMultiplier = parseFloat(document.getElementById(`store${i}Multiplier`).value) || 1;
        stores.push({ store: i, multiplier: storeMultiplier });
    }

    // Sort stores by multiplier (highest first)
    stores.sort((a, b) => b.multiplier - a.multiplier);

    // Recipe requirements per dish
    const tofuPerDish = dishIngredients.tofuPerDish;   // 2 units of Pumpkin per dish
    const beansPerDish = dishIngredients.beansPerDish; // 4 units of Eggs per dish

    // Prioritize allocating high-multiplier stores to Pumpkin (Tofu)
    stores.forEach(store => {
        if (tofuProduced < (beansProduced / beansPerDish) * tofuPerDish) {
            // Allocate to Pumpkin if Pumpkin production is lower than needed
            const tofuFromStore = tofuUnits * store.multiplier;
            tofuProduced += tofuFromStore;
            storeAllocations.push({ store: store.store, ingredient: 'Pumpkin', produced: tofuFromStore.toFixed(2) });
        } else {
            // Allocate remaining stores to Eggs
            const beansFromStore = beansUnits * store.multiplier * 2;  // Eggs produce faster
            beansProduced += beansFromStore;
            storeAllocations.push({ store: store.store, ingredient: 'Eggs', produced: beansFromStore.toFixed(2) });
        }
    });

    // Calculate hourly production
    const totalDishesFromPumpkin = Math.floor(tofuProduced / tofuPerDish);
    const totalDishesFromEggs = Math.floor(beansProduced / beansPerDish);
    const totalDishesPerHour = Math.min(totalDishesFromPumpkin, totalDishesFromEggs);  // The limiting factor

    // Calculate how many hours are needed to reach the goal
    const pointsPerHour = totalDishesPerHour * dishIngredients.pointsPerDish;
    const hoursNeeded = Math.ceil(goalPoints / pointsPerHour);

    // Display the results
    displayHourlyResults(storeAllocations, tofuProduced, beansProduced, totalDishesPerHour, pointsPerHour, hoursNeeded);
}

function displayHourlyResults(storeAllocations, totalPumpkinProduced, totalEggsProduced, totalDishesPerHour, pointsPerHour, hoursNeeded) {
    const goalPoints = parseInt(document.getElementById('goalPoints').value) || 0;  // Fetch the dynamic goal points

    // Sort storeAllocations by store number (store.store)
    storeAllocations.sort((a, b) => a.store - b.store);

    document.getElementById('results').innerHTML = `
        <h2>Results</h2>
        <p>Hourly Production: <b>${totalDishesPerHour}</b> dishes, producing <b>${pointsPerHour}</b> points per hour.</p>
        <p>To reach <b>${goalPoints}</b> points, you will need approximately <b>${hoursNeeded}</b> hours.</p>
        <table>
            <tr>
                <th>Store</th>
                <th>Allocated Ingredient</th>
                <th>Produced Units (per hour)</th>
            </tr>
            ${storeAllocations.map(store => `
                <tr>
                    <td>Store ${store.store}</td>
                    <td>${store.ingredient}</td>
                    <td>${store.produced} units</td>
                </tr>
            `).join('')}
        </table>
        <p><strong>Total Eggs Produced Per Hour:</strong> ${totalEggsProduced.toFixed(2)} units</p>
        <p><strong>Total Pumpkin Produced Per Hour:</strong> ${totalPumpkinProduced.toFixed(2)} units</p>
        <p><strong>Total Dishes You Can Make Per Hour:</strong> ${totalDishesPerHour} dishes</p>`;
}

