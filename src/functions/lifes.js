const fs = require(`fs`);
const path = require(`path`);

async function addLifes (id, lifesToAdd) {
    let userID = id.substring(3, id.length-1);
    try {
        var lifesInfo = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../json/lifes.json")));
        //Search if ID already exists
        for (var i = 0; i < lifesInfo.length; i++) {
            if(userID == lifesInfo[i].id) {
                //Proceed to add lifes
                console.log(`[${id}] user found, adding lifes.`);
                lifesInfo[i].lifes += parseInt(lifesToAdd);
                fs.writeFileSync(path.resolve(__dirname, "../json/lifes.json"), JSON.stringify(lifesInfo, null, 4));
                return true;
            }
        }
        
        console.log(`[${id}] user not found, adding record with ${lifesToAdd} lifes.`);
        lifesInfo.push({
            "id": id,
            "lifes": parseInt(lifesToAdd)
        });
        fs.writeFileSync(path.resolve(__dirname, "../json/lifes.json"), JSON.stringify(lifesInfo, null, 4));
        return true;
    } catch(err){
        console.error(`something went wrong adding lifes to user: \n${err}`);
        return false;
    }
}

async function removeLifes (id, lifesToRemove) {
    let userID = id.substring(3, id.length-1);
    try {
        var lifesInfo = JSON.parse(fs.readFile(path.resolve(__dirname, "../json/lifes.json")));
        for (var i = 0; i < lifesInfo.length; i++) {
            if(userID == lifesInfo[i].id) {
                console.log(`[${id}] user found, removing lifes.`);
                //Proceed to remove lifes
                if ((parseInt(lifesInfo[i].lifes) - parseInt(lifesToRemove)) < 0) {
                    lifesInfo[i].lifes = 0;
                }
                else {
                    parseInt(lifesInfo[i].lifes) -= parseInt(lifesToRemove);
                }
                fs.writeFileSync(path.resolve(__dirname, "../json/lifes.json"), JSON.stringify(lifesInfo, null, 4));
                return true;
            }
        }
        console.log(`[${id}] user not found, adding record with 0 lifes.`);
        lifesInfo.push({
            "id": id,
            "lifes": parseInt(0)
        });
        fs.writeFileSync(path.resolve(__dirname, "../json/lifes.json"), JSON.stringify(lifesInfo, null, 4));
        return true;
    } catch (err) {
        console.error(`something went wrong removing lifes from user: \n${err}`);
        return false;
    }
}

async function getLifes (id) {
    let userID = id.substring(3, id.length-1);
    try {
        var lifesInfo = JSON.parse(fs.readFile(path.resolve(__dirname, "../json/lifes.json")));
        for (var i = 0; i < lifesInfo.length; i++) {
            if(userID == lifesInfo[i].id) {
                console.log(`[${id}] user found.`);
                return lifesInfo[i].lifes;                
            }
        }
        return 0
    } catch (err) {
        console.error(`something went wrong getting lifes file:\n${err}`);
    }
}
module.exports = { addLifes, removeLifes, getLifes }