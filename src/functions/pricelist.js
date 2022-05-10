const fs = require('fs');
const path = require('path');
const dinoPrices = path.resolve(__dirname, "../json/price-list.json");

function readPricesFile() {
    return JSON.parse(fs.readFileSync(dinoPrices));
}

function savePricesFile(priceList) {
    fs.writeFileSync(dinoPrices, JSON.stringify(priceList, null, 4));
}

async function getDinoPrices  () {
    try {
        var dinoPriceList = JSON.parse(fs.readFileSync(dinoPrices));
        return dinoPriceList;
    } catch ( err ) {
        console.log(err);
        return null;
    }
}

async function changePrice (dinoName, newPrice) {
    try{
      var dinoPriceList = readPricesFile();
      dinoPriceList.forEach(dino => {
          if (dino.ShortName.toLowerCase() == dinoName.toLowerCase()) dino.Price = parseInt(newPrice);
      });
      savePricesFile(dinoPriceList);
      return true;
    } catch(err) {
        console.log(`Could not change the price for dino:\n${err}`);
        return false;
    }
  }

module.exports = { getDinoPrices, changePrice };