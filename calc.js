var fs = require('fs');
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('data.txt')
});

var maplist = JSON.parse(fs.readFileSync('maps.json', "utf-8"))
//console.log(maplist);
var mapRecords = {};
var standings = [];
var data = [];
var teamData = {};
const baseElo = 1500;
const eloConst = 400;
//const maps = ['dorado', 'templeOfAnubis', 'ilios', 'numbani', 'eichenwalde', 'junkertown', 'horizonLunarColony', 'lijiangTower', 'oasis'];

//Read the file
lineReader.on('line', function(line) {
    if (line[0] === "W") {
        return;
    }
    var arr = [];
    var idx = 0;
    //Convert to CSV
    for (var i = 0; i < line.length; i++) {
        arr[idx] = "";
        while (!/\s/g.test(line[i]) && i < line.length) {
            arr[idx] += line[i];
            i++;
        }
        idx++;
    }
    //Push data to an array
    data.push(arr);
    //Calculate the team's data from the match
    calcTeamData(arr);
});
lineReader.on('close', function(a) {
    //Update standings
    calcStandings();
    //Update highest/lowest performers per map
    calcMapRecords();
    //Save the data
    writeData();

    projectMatchup('FLA', 'LON', ['dorado', 'templeOfAnubis', 'ilios', 'numbani']);
});

function getEloKeys(team) {
    console.log(team);
    var x = Object.keys(team).filter(function(a) {
        if (a.indexOf('elo') > 0) {
            return true;
        }
        return false;
        if (a === 'opponent' && a !== 'week' && a !== 'points') {
            return false;
        }
        if (a === 'week') {
            return false;
        }
        if (a === 'points') {
            return false;
        }
        if (a == 'name') {
            return false;
        }
        if (a == '')
        return true;
    });    
}

function calcTeamData(arr) {


    //Create the data point with the match data and Strength of Victory per match
    var datapoint = {
        'opponent': arr[2],
        'week': arr[0],
        'points': 0
        // 'dorado': calcGameData(arr[3], 'dorado'),
        // 'templeOfAnubis': calcGameData(arr[4], 'templeOfAnubis'),
        // 'ilios': calcGameData(arr[5], 'ilios'),
        // 'numbani': calcGameData(arr[6], 'numbani'),
        // 'eichenwalde': calcGameData(arr[7], 'eichenwalde'),
        // 'junkertown': calcGameData(arr[8], 'junkertown'),
        // 'horizonLunarColony': calcGameData(arr[9], 'horizonLunarColony'),
        // 'lijiangTower': calcGameData(arr[10], 'lijiangTower'),
        // 'oasis': calcGameData(arr[11], 'oasis'),
    };
        //Initialize the opponent's record
        var oppdatapoint = {
            'opponent': arr[1],
            'week': arr[0],
            'points': 0
        }
    var keys = Object.keys(maplist);
    if (datapoint.opponent === 'HOU') {
        var a = 3;
    }
    for (var i = 3;i < keys.length + 3;i++) {

        var mapname = keys[i-3];
        if (mapname) {
            var mapResult = calcGameData(arr[i],mapname)
            if (!mapResult) {
                continue;
            }
            //console.log(mapResult);
            if (mapResult.winner === 0) {
                datapoint.points++;                                
            } else if (mapResult.winner === 1) {
                oppdatapoint.points++;                
            }
            datapoint[mapname] = mapResult;
            oppdatapoint[mapname] = mapResult;
        }        
    }

    //Check to see if we've already recorded records for the teams, and init them if needed
    if (!teamData[arr[1]]) {
        teamData[arr[1]] = { name: arr[1], elo: baseElo };
        teamData[arr[1]].matchData = [];
    }
    if (!teamData[arr[2]]) {
        teamData[arr[2]] = { name: arr[2], elo: baseElo };
        teamData[arr[2]].matchData = [];
    }

    //Add the match data to the team
    teamData[arr[1]].matchData.push(datapoint);
    teamData[arr[2]].matchData.push(oppdatapoint);
    if (datapoint.points > oppdatapoint.points) {
        datapoint.winner = 1;
        oppdatapoint.loser = 1;
    } else if (datapoint.points === oppdatapoint.points) {
        datapoint.tie = 1;
        oppdatapoint.tie = 1;
    } else {
        oppdatapoint.winner = 1;
        datapoint.loser = 1;
    }
    //Update ELO for teams
    adjustElo(arr[1], datapoint);
}

function calcGameData(data, mapname) {
    //If it's an empty record bail
    if (!data || data == "") {
        return;
    }
    //Split on the colon    
    var x = parseInt(data.split(':')[0]);
    var y = parseInt(data.split(':')[1]);
    var maxpoint = maplist[mapname].maxPoints;
    //If the points are equal, it was a tie, and strength of victory is 0
    if (x == y) {
        return 2;
    }

    if (x > y) {
        var windiff = (x - y + Math.floor(x / maxpoint) - Math.floor(y / maxpoint));
        var modifiedWinDiff = windiff / (maxpoint + 1);
        return {winner: 0, score: Math.pow(modifiedWinDiff, Math.floor((x + y) / (maxpoint * 2)) + 1)};
    } else {
        var windiff = (y - x + Math.floor(y / maxpoint) - Math.floor(x / maxpoint));
        var modifiedWinDiff = windiff / (maxpoint + 1);
        return {winner: 1, score: Math.pow(modifiedWinDiff, Math.floor((x + y) / (maxpoint * 2)) + 1)};
    }
}

function adjustElo(teamName, matchData) {
    //get local handles to the teams
    var team1 = teamData[teamName];
    var team2 = teamData[matchData.opponent];
    
    var team1Adjustments = 0;
    var team2Adjustments = 0;
    //Need to track the number of wins to adjust elo
    var team1Wins = 0;
    var team2Wins = 0;

    //Go through each map for the match and update the team's map elo
    for (var key in matchData) {      
        console.log(getEloKeys(team1));        
        if (key != 'opponent' && key != 'week' && key != 'points' && key != 'win') {
            if (!team1[key + 'elo']) {
                team1[key + 'elo'] = baseElo;
            }
            if (!team2[key + 'elo']) {
                team2[key + 'elo'] = baseElo;
            }
            var winningTeam;
            if (matchData.winner) {
                winningTeam = team1;
                losingTeam = team2;
                team1Wins++;
            } else if (matchData.loser) {
                winningTeam = team2;
                losingTeam = team1;
                team2Wins++;
            }            
            if (matchData[key].score === 0) {
                winningTeam = team1[key + 'elo'] > team2[key + 'elo'] ? team1 : team2;
                losingTeam = team1[key + 'elo'] < team2[key + 'elo'] ? team1 : team2;
            }
            var adjustment = calcElo(winningTeam[key + 'elo'], losingTeam[key + 'elo'], matchData[key].score);
            //who gets the positive adjustment, who gets negative
            winningTeam[key + 'elo'] += adjustment;
            losingTeam[key + 'elo'] -= adjustment;
            if (winningTeam == team1) {
                team1Adjustments += adjustment;
            } else {
                team1Adjustments -= adjustment;
            }
            if (losingTeam == team2) {
                team2Adjustments -= adjustment;
            } else {
                team2Adjustments += adjustment;
            }
        }
    }
    if (team2Wins > team1Wins) {
        var adjustment = calcElo(team2.elo, team1.elo, team2Wins / (team1Wins + team2Wins));
        team1.elo -= adjustment;
        team2.elo += adjustment;
        //console.log(-1 * adjustment, team1Adjustments);
        //console.log(adjustment, team2Adjustments);
    } else if (team2Wins < team1Wins) {
        var adjustment = calcElo(team1.elo, team2.elo, team1Wins / (team1Wins + team2Wins));
        team2.elo -= adjustment;
        team1.elo += adjustment;
        //console.log(adjustment, team1Adjustments);
        //console.log(-1 * adjustment, team2Adjustments);
    }
}

function calcStandings() {
    for (var key in teamData) {
        var wins = 0;
        var losses = 0;
        var team = teamData[key];
        var totalGames = team.matchData.length;
        for (var i = 0; i < totalGames; i++) {
            var matchData = team.matchData[i];                                    
            if (matchData.winner) {
                wins++;
            } else if (matchData.tie) {
                console.log('TIE?!');
            } else {
                losses++;                
            }
        }
        team.wins = wins;
        team.losses = losses;
    }
    for (var key in teamData) {
        var standingsRecord = { 'name': teamData[key].name, 'elo': teamData[key].elo, 'wins': teamData[key].wins, 'losses': teamData[key].losses };
        if (standings.length === 0) {
            standings.push(standingsRecord);
        } else {
            var idx = -1;
            for (var i = 0; i < standings.length; i++) {
                if (teamData[key].elo > standings[i].elo) {
                    idx = i;
                    break;
                }
            }
            if (idx === -1) {
                standings.push(standingsRecord);
            } else {
                standings.splice(idx, 0, standingsRecord);
            }
        }
    }
}


function calcMapRecords() {
    for (var key in maplist) {
        var record = { best: 0, bestTeam: "", worst: 9999, worstTeam: "" };
        mapRecords[key] = record;
        for (var key in teamData) {
            var team = teamData[key];
            if (team[key + 'elo'] > record.best) {
                record.best = team[maps[i] + 'elo']
                record.bestTeam = key;
            }
            if (team[key + 'elo'] < record.worst) {
                record.worst = team[maps[i] + 'elo']
                record.worstTeam = key;
            }
        }
    }
}

function writeData() {
    var output = {};
    output.teamData = teamData;
    output.mapData = mapRecords;
    var redditfriendlystandings = "Team|Wins|Losses|ELO\r\n:---|---:|:----:|:--\r\n";
    redditfriendlystandings += standings.reduce(function(p, c, idx, arr) {
        if (p === standings[0]) {
            p = p.name + "|" + p.wins + "|" + p.losses + "|" + p.elo.toString().slice(0, 4) + "\r\n";
        }
        return p + c.name + "|" + c.wins + "|" + c.losses + "|" + c.elo.toString().slice(0, 4) + "\r\n";
    })
    console.log(redditfriendlystandings);
    output.standings = standings;
    fs.writeFile("output.txt", JSON.stringify(output, null, 2), function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

function projectMatchup(team1, team2, maps) {
    var t1 = teamData[team1];
    var t2 = teamData[team2];
    var overall = 0;
    for (var i = 0; i < maps.length; i++) {
        var mapelo = maps[i] + 'elo';
        t1mapelo = t1[mapelo] || 1500;
        t2mapelo = t2[mapelo] || 1500;
        var elodiff = t1mapelo - t2mapelo;
        var a = 1 / (Math.pow(10, (-1 * elodiff) / eloConst) + 1)
        console.log(t1mapelo, t2mapelo, a);
        overall += a;
    }
    overall = overall / maps.length * 100;
    console.log(overall);
}



function calcElo(elo_a, elo_b, strength_of_victory) {
    var a = elo_b - elo_a;
    a = a / eloConst;
    a = 1 + Math.pow(10, a);
    var E_A = 1 / a;
    var adjust = (eloConst / 10) * (strength_of_victory - E_A);
    console.log(adjust);
    return adjust;
}

function calcElo2(r_a, r_b, strength_of_victory) {
    return 1/(1+Math.pow(10,(r_b-r_a)/400));
}

function calcElo3(r_a, s_a, e_a) {
    return r_a + 40 * (s_a - e_a);    
}
var x = calcElo2(1500,1500,1);
var y = calcElo3(1500, .5, x)
console.log(x, y);
console.log('done');

function calcMapPoints(score_attack,score_defense,mapname) {
    var result = {win: 0, loss: 0, tie: 0, score: 0};
    var map = maplist[mapname];
    if (score_attack > score_defense) {
        result.win = 1;
    } else if (score_attack === score_defense) {
        result.tie = 1;        
    } else {
        result.loss = 1;
    }
    var atkPoints = 0;
    var defPoints = 0;
    var partialPoints = 0;
    switch (map.type.toLowerCase()) {
        case "escort":
            atkPoints = Math.floor(score_attack/3)*6;
            partialPonts = score_attack % 3;
            if (partialPonts === 1) {
                atkPoints += 2;
            } else if (partialPonts === 2) {
                atkPoints += 3;
            }
            defPoints = Math.floor(score_defense/3)*6;
            partialPonts = score_defense % 3;
            if (partialPonts === 1) {
                defPoints += 1;
            } else if (partialPonts === 2) {
                defPoints += 2;
            }
        case "hybrid":
            atkPoints = Math.floor(score_attack/3)*6;
            partialPonts = score_attack % 3;
            if (partialPonts === 1) {
                atkPoints++;
            } else if (partialPonts === 2) {
                atkPoints += 2;
            }
            defPoints = Math.floor(score_defense/3)*6;
            partialPonts = score_defense % 3;
            if (partialPonts === 1) {
                defPoints += 3;
            } else if (partialPonts === 2) {
                defPoints += 2;
            }
        case "assault":
        case "control":
        default:
            console.log("We shouldn't be here");
    }
}