const players = [
    {
        name: "Rat👑",
        numStores: 9,
        multipliers: [1.5, 1.5, 2.0, 1.5, 1.5, 1.5, 1.5, 1.25, 1.0]
        
    },
    {
        name: "Öykü",
        numStores: 8,
        multipliers: [2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5]
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
    beans: 60
};

// Static data for ingredients per dish
const dishIngredients = {
    tofuPerDish: 3,  
    beansPerDish: 2,  
    pointsPerDish: 50
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

    const dishesNeeded = Math.ceil(goalPoints / dishIngredients.pointsPerDish);
    const totalTofuNeeded = dishesNeeded * dishIngredients.tofuPerDish;
    const totalBeansNeeded = dishesNeeded * dishIngredients.beansPerDish;
    

    let tofuProduced = 0;
    let beansProduced = 0;
    let totalTofuProduced = 0;
    let totalBeansProduced = 0;
    let storeAllocations = [];
    let totalTime = 0;

    let stores = [];
    for (let i = 1; i <= numStores; i++) {
        const storeMultiplier = parseFloat(document.getElementById(`store${i}Multiplier`).value) || 1;
        stores.push({ store: i, multiplier: storeMultiplier });
    }

    stores.sort((a, b) => b.multiplier - a.multiplier);

    let allocateToTofu = true; 
    stores.forEach(store => {
        const tofuFromStore = (tofuUnits * store.multiplier);
        const beansFromStore = (beansUnits * store.multiplier);

        if (allocateToTofu && tofuProduced < totalTofuNeeded) {
            tofuProduced += tofuFromStore;
            storeAllocations.push({ store: store.store, ingredient: 'Tofu', produced: tofuFromStore.toFixed(2) });
        } else if (beansProduced < totalBeansNeeded) {
            beansProduced += beansFromStore;
            storeAllocations.push({ store: store.store, ingredient: 'Beans', produced: beansFromStore.toFixed(2) });
        }

        totalTofuProduced += tofuFromStore;
        totalBeansProduced += beansFromStore;

        allocateToTofu = !allocateToTofu;
    });

    const tofuTimeNeeded = Math.ceil(totalTofuNeeded / totalTofuProduced) * productionWindows.tofu;
    const beansTimeNeeded = Math.ceil(totalBeansNeeded / totalBeansProduced) * productionWindows.beans;
    totalTime = Math.max(tofuTimeNeeded, beansTimeNeeded);  
    displayResults(totalTofuProduced, totalBeansProduced, storeAllocations, totalTime);
}

function displayResults(totalTofuProduced, totalBeansProduced, storeAllocations, totalTime) {
    const formattedTime = formatTime(totalTime); 

    const goalPoints = parseInt(document.getElementById('goalPoints').value) || 0;
    const dishesNeeded = Math.ceil(goalPoints / dishIngredients.pointsPerDish);

    const totalTofuProducedInHours = totalTofuProduced * (totalTime / 60);
    const totalBeanProducedInHours = totalBeansProduced * (totalTime / 60);
    const totalDishesFromTofu = Math.floor(totalTofuProduced / dishIngredients.tofuPerDish);
    const totalDishesFromBeans = Math.floor(totalBeansProduced / dishIngredients.beansPerDish);
    const totalDishes = (Math.min(totalDishesFromTofu, totalDishesFromBeans)); 
    const totalDishesInHours = totalDishes * (totalTime / 60);
    storeAllocations.sort((a, b) => a.store - b.store);

    document.getElementById('results').innerHTML = `
        <h2>Results</h2>
        <p>You will reach <b>${goalPoints}</b> points with <b>${dishesNeeded}</b> dishes in <b>${formattedTime}</b> with the following store allocation:</p>
        <table>
            <tr>
                <th>Store</th>
                <th>Allocated Ingredient</th>
                <th>Produced Units</th>
            </tr>
            ${storeAllocations.map(store => `
                <tr>
                    <td>Store ${store.store}</td>
                    <td>${store.ingredient}</td>
                    <td>${store.produced} units</td>
                </tr>
            `).join('')}
        </table>
        <p><strong>Total Tofu Produced:</strong> ${totalBeanProducedInHours.toFixed(2)} units</p>
        <p><strong>Total Beans Produced:</strong> ${totalTofuProducedInHours.toFixed(2)} units</p>
        <p><strong>Total Dishes You Can Make:</strong> ${totalDishesInHours} dishes (out of ${dishesNeeded} needed)</p>
        <p><strong>Total Time:</strong> ${formattedTime}</p>`;
}