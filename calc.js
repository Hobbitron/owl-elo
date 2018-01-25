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

    projectMatchup('SFS', 'LON', ['junkertown', 'horizonLunarColony', 'oasis', 'eichenwalde']);
});

function getEloKeys(team) {
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
    for (var i = 3; i < keys.length + 3; i++) {
        var mapname = keys[i - 3];
        if (mapname) {

            var mapResult = calcGameData(arr[i], mapname)
            if (mapResult === 0) {
                oppdatapoint.points++;
            } else if (mapResult === 1) {
                datapoint.points++;
            }
            datapoint[mapname] = parseInt(mapResult);
            oppdatapoint[mapname] = parseInt(mapResult);
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
    //If the points are equal, it was a tie, and strength of victory is 0
    if (x == y) {
        return .5;
    }

    if (x > y) {
        return 1;
    } else {
        return 0;
    }
}

function adjustElo(teamName, matchData) {
    //get local handles to the teams
    var team1 = teamData[teamName];
    var team2 = teamData[matchData.opponent];

    //Need to track the number of wins to adjust elo
    var team1Wins = 0;
    var team2Wins = 0;

    //Go through each map for the match and update the team's map elo
    for (var key in matchData) {
        if (key != 'opponent' && key != 'week' && key != 'points' && key != 'winner' && key != 'loser') {
            if (isNaN(matchData[key])) {
                continue;
            }
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
            var e_a = expectedScore(winningTeam[key + 'elo'], losingTeam[key + 'elo']);
            var adjustment = eloAdjustment(winningTeam[key + 'elo'], matchData[key], e_a);
            //who gets the positive adjustment, who gets negative
            winningTeam[key + 'elo'] += adjustment;
            losingTeam[key + 'elo'] -= adjustment;
        }
    }
    if (team2Wins > team1Wins) {
        var e_a = expectedScore(team2.elo, team1.elo);
        var adjustment = eloAdjustment(team2.elo, 1, e_a);
        team1.elo -= adjustment;
        team2.elo += adjustment;
    } else if (team2Wins < team1Wins) {
        var e_a = expectedScore(team1.elo, team2.elo);
        var adjustment = eloAdjustment(team1.elo, 1, e_a);
        team2.elo -= adjustment;
        team1.elo += adjustment;
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
    for (var mapkey in maplist) {
        var record = { best: 0, bestTeam: "", worst: 9999, worstTeam: "", name: mapkey };
        mapRecords[mapkey] = record;
        for (var key in teamData) {
            var team = teamData[key];
            if (team[mapkey + 'elo'] > record.best) {
                record.best = team[mapkey + 'elo']
                record.bestTeam = key;
            }
            if (team[mapkey + 'elo'] < record.worst) {
                record.worst = team[mapkey + 'elo']
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
    var redditfriendlymapstandings = "Map|Best Team|Rating|Weakest Team|Rating\r\n:--|:-------:|:----:|:----------:|-----:\r\n";
    for (var key in mapRecords) {
        var r = mapRecords[key];
        if (!r.best) {
            continue;
        }
        var name = r.name[0].toUpperCase();
        for (var i = 1; i < r.name.length; i++) {
            if (r.name[i].toUpperCase() === r.name[i]) {
                name += ' ';
            }
            name += r.name[i];
        }
        redditfriendlymapstandings += name + "|" + r.bestTeam + "|" + r.best.toString().slice(0, 4) + "|" + r.worstTeam + "|" + r.worst.toString().slice(0, 4) + "\r\n";
    }
    var mdresults = redditfriendlystandings + "\r\n" + redditfriendlymapstandings;
    fs.writeFile("results.md", mdresults, function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
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
        overall += a;
        console.log(maps[i], t1mapelo, t2mapelo, a);
    }
    overall = overall / maps.length * 100;
    console.log(overall);
}



function expectedScore(r_a, r_b) {
    return 1 / (1 + Math.pow(10, (r_b - r_a) / 400));
}

function eloAdjustment(r_a, s_a, e_a) {
    return 30 * (s_a - e_a);
}

// function calcMapPoints(score_attack, score_defense, mapname) {
//     var result = { win: 0, loss: 0, tie: 0, score: 0 };
//     var map = maplist[mapname];
//     if (score_attack > score_defense) {
//         result.win = 1;
//     } else if (score_attack === score_defense) {
//         result.tie = 1;
//     } else {
//         result.loss = 1;
//     }
//     var atkPoints = 0;
//     var defPoints = 0;
//     var partialPoints = 0;
//     switch (map.type.toLowerCase()) {
//         case "escort":
//             atkPoints = Math.floor(score_attack / 3) * 12;
//             partialPonts = score_attack % 3;
//             if (partialPonts === 1) {
//                 atkPoints += 2;
//             } else if (partialPonts === 2) {
//                 atkPoints += 6;
//             }
//             defPoints = Math.floor(score_defense / 3) * 12;
//             partialPonts = score_defense % 3;
//             if (partialPonts === 1) {
//                 defPoints += 2;
//             } else if (partialPonts === 2) {
//                 defPoints += 6;
//             }
//             break;
//         case "hybrid":
//             atkPoints = Math.floor(score_attack / 3) * 12;
//             partialPonts = score_attack % 3;
//             if (partialPonts === 1) {
//                 atkPoints += 2;
//             } else if (partialPonts === 2) {
//                 atkPoints += 6;
//             }
//             defPoints = Math.floor(score_defense / 3) * 12;
//             partialPonts = score_defense % 3;
//             if (partialPonts === 1) {
//                 defPoints += 2;
//             } else if (partialPonts === 2) {
//                 defPoints += 6;
//             }
//             break;
//         case "assault":
//             atkPoints = Math.floor(score_attack / 2) * 12;
//             partialPonts = score_attack % 2;
//             if (partialPonts === 1) {
//                 atkPoints += 4;
//             }
//             defPoints = Math.floor(score_defense / 3) * 12;
//             partialPonts = score_defense % 2;
//             if (partialPonts === 1) {
//                 defPoints += 4;
//             }
//             break;
//         case "control":
//             atkPoints = Math.floor(score_attack / 2) * 12;
//             partialPonts = score_attack % 2;
//             if (partialPonts === 1) {
//                 atkPoints += 6;
//             }
//             defPoints = Math.floor(score_defense / 3) * 12;
//             partialPonts = score_defense % 2;
//             if (partialPonts === 1) {
//                 defPoints += 6;
//             }
//             break;
//         default:
//             console.log("We shouldn't be here");
//             break;
//     }
//     console.log(score_attack, score_defense, atkPoints - defPoints, map.type);
//     return atkPoints - defPoints;
// }