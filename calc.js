var fs = require('fs');
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('data.1.txt')
});
var Match = require('./dist/match');
var Teams = require('./dist/teams');
var Matches = require('./dist/matches');

var maplist = JSON.parse(fs.readFileSync('maps.json', "utf-8"))
    //console.log(maplist);
var mapRecords = {};
var standings = [];
var data = [];
var teamData = {};
var Matches = new Matches.Matches();
const baseElo = 1500;
const eloConst = 400;

//Read the file
lineReader.on('line', function(line) {
    if (line[0] === "I") {
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
    var m = new Match.Match(arr);
    data.push(m);
    Matches.push(m);
});
lineReader.on('close', function(a) {
    var upsets = Matches._matches;
    var standardteamelos = {};
    var k = 20;
    var basicelos = {};
    var basic = upsets.map(function(m) {
        var homeWinner = m.mapWins > m.mapLosses;
        var x = {};
        var homeBeforeElo = basicelos[m._homeTeam] || 1500;
        var awayBeforeElo = basicelos[m._awayTeam] || 1500;
        x.winnerElo = m.mapWins > m.mapLosses ? homeBeforeElo : awayBeforeElo;
        x.loserElo = m.mapWins > m.mapLosses ? awayBeforeElo : homeBeforeElo;
        x.score = m.mapWins > m.mapLosses ? m.mapWins.toString() + ":" + m.mapLosses.toString() : m.mapLosses.toString() + ":" + m.mapWins.toString();
        var qA = Math.pow(10, x.winnerElo / 400.0);
        var qB = Math.pow(10, x.loserElo / 400.0);
        var qW = qA / (qA + qB);
        var qL = qB / (qA + qB);
        x.qW = Math.round(k * (1.0 - qW))
        x.qL = Math.round(k * (0.0 - qL))
        x.winnerEloAfter = x.winnerElo + x.qW;
        x.loserEloAfter = x.loserElo + x.qL;
        if (homeWinner) {
            basicelos[m._homeTeam] = x.winnerEloAfter;
            basicelos[m._awayTeam] = x.loserEloAfter;
        } else {
            basicelos[m._homeTeam] = x.loserEloAfter;
            basicelos[m._awayTeam] = x.winnerEloAfter;
        }
        return x;
    });
    console.log(basicelos);
    var standard = upsets.map(function(m) {
        var x = {};
        x.score = m.score;
        x.homeWins = m.mapWins;
        x.awayWins = m.mapLosses;
        x.basicSOV = x.homeWins / (x.homeWins + x.awayWins);
        x.homeBeforeElo = standardteamelos[m._homeTeam] || 1500;
        x.awayBeforeElo = standardteamelos[m._awayTeam] || 1500;
        x.pd = Math.abs(m.mapWins - m.mapLosses);
        x.lpd = Math.log(x.pd + 1);
        var elow = m.mapWins > m.mapLosses ? x.homeBeforeElo : x.awayBeforeElo;
        var elol = m.mapWins > m.mapLosses ? x.awayBeforeElo : x.homeBeforeElo;
        x.eloDiff = x.homeBeforeElo - x.awayBeforeElo;
        x.md = Math.log(Math.abs(x.homeWins - x.awayWins) + 1) * (2.2 / ((elow - elol) * 0.001 + 2.2));
        x.expectedScore = (1 / (1 + Math.pow(10, (x.homeBeforeElo - x.awayBeforeElo) / 400)))
        x.adjustment = (x.basicSOV - x.expectedScore) * k;
        x.homeAfterElo = x.homeBeforeElo + x.adjustment;
        x.awayAfterElo = x.awayBeforeElo - x.adjustment;
        standardteamelos[m._homeTeam] = x.homeAfterElo;
        standardteamelos[m._awayTeam] = x.awayAfterElo;
        return x;
    });
    //console.log(standard);
    //console.log(standardteamelos);
    //console.log(Math.log(2));
    for (var i = 0; i < upsets.length; i++) {
        var m = upsets[i];
        var a = m.mapWins / (m.mapWins + m.mapLosses);
        //console.log(upsets[i].score);
    }
    var a = Teams.Teams.GetStandings();
    for (var i = 0; i < a.length; i++) {
        //console.log(a[i].abbreviation, Math.floor(a[i].elo), a[i].matchWins, a[i].mapWins);
    }

    //Update standings
    // calcStandings();
    // //Update highest/lowest performers per map
    // calcMapRecords();
    // //Save the data
    writeData();

    // projectMatchup('VAL', 'PHI', ['numbani', 'templeOfAnubis', 'oasis', 'dorado']);
    // projectMatchup('FLA', 'GLA', ['eichenwalde', 'horizonLunarColony', 'oasis', 'junkertown']);
    // projectMatchup('HOU', 'SFS', ['numbani', 'templeOfAnubis', 'oasis', 'dorado']);
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
    var matchScore = 0;
    //Check to see if we've already recorded records for the teams, and init them if needed
    if (!teamData[arr[1]]) {
        teamData[arr[1]] = { name: arr[1], elo: baseElo, mapPoints: 0 };
        teamData[arr[1]].matchData = [];
    }
    if (!teamData[arr[2]]) {
        teamData[arr[2]] = { name: arr[2], elo: baseElo, mapPoints: 0 };
        teamData[arr[2]].matchData = [];
    }
    //Create the data point with the match data and Strength of Victory per match
    var datapoint = {
        'opponent': arr[2],
        'week': arr[0],
        'points': 0
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

            if (mapResult === undefined) {
                continue;
            }
            matchScore += mapResult;
            //console.log(mapname, mapResult);
            if (mapResult > 0) {
                teamData[arr[1]].mapPoints++;
                datapoint.points++;
                if (teamData[arr[1]][mapname + 'Points']) {
                    teamData[arr[1]][mapname + 'Points']++;
                } else {
                    teamData[arr[1]][mapname + 'Points'] = 1;
                }
                if (teamData[arr[2]][mapname + 'Losses']) {
                    teamData[arr[2]][mapname + 'Losses']++;
                } else {
                    teamData[arr[2]][mapname + 'Losses'] = 1;
                }
            } else if (mapResult < 0) {
                if (teamData[arr[2]][mapname + 'Points']) {
                    teamData[arr[2]][mapname + 'Points']++;
                } else {
                    teamData[arr[2]][mapname + 'Points'] = 1;
                }
                if (teamData[arr[1]][mapname + 'Losses']) {
                    teamData[arr[1]][mapname + 'Losses']++;
                } else {
                    teamData[arr[1]][mapname + 'Losses'] = 1;
                }
                oppdatapoint.points++;
                teamData[arr[2]].mapPoints++;
            } else {
                datapoint[mapname] = 0;
                oppdatapoint[mapname] = 0;
            }
            datapoint[mapname] = mapResult;
            oppdatapoint[mapname] = -1 * mapResult;
        }
    }


    //Add the match data to the team
    teamData[arr[1]].matchData.push(datapoint);
    teamData[arr[2]].matchData.push(oppdatapoint);
    if (datapoint.points > oppdatapoint.points) {

        matchScore = Math.abs(matchScore) + 4;
        datapoint.score = matchScore;
        oppdatapoint.score = -1 * matchScore;
        datapoint.winner = 1;
        oppdatapoint.loser = 1;
    } else if (datapoint.points === oppdatapoint.points) {
        datapoint.tie = 1;
        oppdatapoint.tie = 1;
    } else {
        matchScore = Math.abs(matchScore) + 4;
        oppdatapoint.score = matchScore;
        datapoint.score = -1 * matchScore;
        oppdatapoint.winner = 1;
        datapoint.loser = 1;
    }
    //console.log(datapoint, oppdatapoint);
    //Update ELO for teams
    adjustElo(arr[1], datapoint);
}

function calcGameData(data, mapname) {
    //If it's an empty record bail
    if (!data || data == "") {
        return;
    }
    var s_o_v = -9999;

    //Split on the colon    
    var x = parseInt(data.split(':')[0]);
    var y = parseInt(data.split(':')[1]);
    var map = maplist[mapname];
    if (x === y) {
        s_o_v = 0;
    } else if (y === 0 || x === 0) {
        if (map.type === 'hybrid' || map.type === 'escort') {
            //max 3 points
            if (x + y === 3) {
                s_o_v = 3;
            } else {
                s_o_v = 2;
            }
        } else {
            //max 2 points available
            if (x + y === 2) {
                s_o_v = 3;
            } else {
                s_o_v = 2;
            }
        }
    } else {
        s_o_v = 1;
    }
    return x >= y ? s_o_v : s_o_v * -1;
}

function adjustElo(teamName, matchData) {
    //get local handles to the teams
    var team1 = teamData[teamName];
    var team2 = teamData[matchData.opponent];

    //Need to track the number of wins to adjust elo
    var team1Wins = 0;
    var team2Wins = 0;

    var winningTeam;
    var losingTeam;



    //Go through each map for the match and update the team's map elo
    for (var key in matchData) {
        if (key != 'opponent' && key != 'week' && key != 'points' && key != 'winner' && key != 'loser' && key != 'tie' && key != "score") {
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
            if (matchData[key] > 0) {
                winningTeam = team1;
                losingTeam = team2;
            } else if (matchData[key] < 0) {
                winningTeam = team2;
                losingTeam = team1;
            } else if (matchData[key] === 0) {
                if (team1[key + 'elo'] > team2[key + 'elo']) {
                    winningTeam = team1;
                    losingTeam = team2;
                } else {
                    winningTeam = team2;
                    losingTeam = team1;
                }
            }

            var e_a = expectedMapScore(winningTeam[key + 'elo'], losingTeam[key + 'elo']);
            var adjustment = eloMapAdjustment(winningTeam[key + 'elo'], winningTeam === team1 ? matchData[key] : -1 * matchData[key], e_a);
            //who gets the positive adjustment, who gets negative
            winningTeam[key + 'elo'] += adjustment;
            losingTeam[key + 'elo'] -= adjustment;

        }
    }
    var adjustment = 0;
    var e_a = expectedMatchScore(team2.elo, team1.elo);
    adjustment = eloMatchAdjustment(team2.elo, matchData.score, e_a);
    team1.elo += adjustment;
    team2.elo -= adjustment;
    matchData.adjustment = adjustment;
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
        var standingsRecord = { 'name': teamData[key].name, 'elo': teamData[key].elo, 'wins': teamData[key].wins, 'losses': teamData[key].losses, 'mapPoints': teamData[key].mapPoints };
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
    fs.writeFile("matches.txt", Matches.toString(), function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    fs.writeFile("teams.txt", Teams.Teams.toString(), function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    // var output = {};
    // output.teamData = teamData;
    // output.mapData = mapRecords;
    // var redditfriendlystandings = "Team|Wins|Losses|ELO|Map Points\r\n:---|---:|:----:|:-:|--------:\r\n";
    // redditfriendlystandings += standings.reduce(function(p, c, idx, arr) {
    //     if (p === standings[0]) {
    //         p = p.name + "|" + p.wins + "|" + p.losses + "|" + p.elo.toString().slice(0, 4) + "|" + p.mapPoints.toString() + "\r\n";
    //     }
    //     return p + c.name + "|" + c.wins + "|" + c.losses + "|" + c.elo.toString().slice(0, 4) + "|" + c.mapPoints.toString() + "\r\n";
    // })
    // var redditfriendlymapstandings = "Map|Best Team|Rating|Weakest Team|Rating\r\n:--|:-------:|:----:|:----------:|-----:\r\n";
    // for (var key in mapRecords) {
    //     var r = mapRecords[key];
    //     if (!r.best) {
    //         continue;
    //     }
    //     var name = r.name[0].toUpperCase();
    //     for (var i = 1; i < r.name.length; i++) {
    //         if (r.name[i].toUpperCase() === r.name[i]) {
    //             name += ' ';
    //         }
    //         name += r.name[i];
    //     }
    //     redditfriendlymapstandings += name + "|" + r.bestTeam + "|" + r.best.toString().slice(0, 4) + "|" + r.worstTeam + "|" + r.worst.toString().slice(0, 4) + "\r\n";
    // }
    // var mdresults = redditfriendlystandings + "\r\n" + redditfriendlymapstandings;
    // fs.writeFile("results.md", mdresults, function(err) {
    //     if (err) {
    //         return console.log(err);
    //     }

    //     console.log("The file was saved!");
    // });
    // output.standings = standings;
    // fs.writeFile("output.txt", JSON.stringify(output, null, 2), function(err) {
    //     if (err) {
    //         return console.log(err);
    //     }

    //     console.log("The file was saved!");
    // });
}

function projectMatchup(team1, team2, maps) {
    console.log(team1, team2);
    var t1 = teamData[team1];
    var t2 = teamData[team2];
    var t1wins = 0;
    var t2wins = 0;
    var overall = 0;
    for (var i = 0; i < maps.length; i++) {
        var mapelo = maps[i] + 'elo';
        t1mapelo = t1[mapelo] || 1500;
        t2mapelo = t2[mapelo] || 1500;
        var elodiff = t1mapelo - t2mapelo;
        var a = 1 / (Math.pow(10, (-1 * elodiff) / eloConst) + 1);
        a = a * 32 - 16;
        overall += Math.floor(a);
        if (elodiff > 0) {
            t1wins++;
        } else {
            t2wins++;
        }
        var t1pl = t1[maps[i] + 'Points'] ? t1[maps[i] + 'Points'] : '0';
        t1pl += ':';
        t1pl += t1[maps[i] + 'Losses'] ? t1[maps[i] + 'Losses'] : '0';
        var t2pl = t2[maps[i] + 'Points'] ? t2[maps[i] + 'Points'] : '0';
        t2pl += ':';
        t2pl += t2[maps[i] + 'Losses'] ? t2[maps[i] + 'Losses'] : '0';
        //console.log(t1pl, t2pl)
        console.log(maps[i], Math.floor(t1mapelo), Math.floor(t2mapelo), t1pl, t2pl, a);
    }
    if (t1wins === t2wins) {
        var mapelo = 'lijiangTowerelo';
        t1mapelo = t1[mapelo] || 1500;
        t2mapelo = t2[mapelo] || 1500;
        var elodiff = t1mapelo - t2mapelo;
        var a = 1 / (Math.pow(10, (-1 * elodiff) / eloConst) + 1);
        a = a * 32 - 16;
        overall += Math.floor(a);
        if (elodiff > 0) {
            t1wins++;
        } else {
            t2wins++;
        }
        console.log('lijiangTower', Math.floor(t1mapelo), Math.floor(t2mapelo), a);
    }
    if (t1wins > t2wins) {
        overall += 4;
    } else {
        overall -= 4;
    }
    var nonAdjOverall = t1.elo - t2.elo;
    nonAdjOverall = Math.floor(((1 / (Math.pow(10, (-1 * nonAdjOverall) / eloConst) + 1)) * 32) - 16);
    if (nonAdjOverall > 0) {
        nonAdjOverall += 4;
    } else {
        nonAdjOverall -= 4;
    }
    console.log(t1.elo, t2.elo, nonAdjOverall);
    //nonAdjOverall *= 100;
    console.log(overall, nonAdjOverall);
}



function expectedMatchScore(r_a, r_b) {
    //console.log(r_a, r_b);
    var e_a = (1 / (1 + Math.pow(10, (r_b - r_a) / 400)))
    e_a *= 32;
    e_a -= 16;
    //console.log(e_a);
    return e_a;
    //return (1 / (1 + Math.pow(10, (r_b - r_a) / 400)));
}

function expectedMapScore(r_a, r_b) {
    //console.log(r_a, r_b);
    var e_a = (1 / (1 + Math.pow(10, (r_b - r_a) / 400)))
    e_a *= 6;
    e_a -= 3;
    //console.log(e_a);
    return e_a;
    //return (1 / (1 + Math.pow(10, (r_b - r_a) / 400)));
}

function eloMapAdjustment(r_a, s_a, e_a) {
    //console.log(r_a, s_a, e_a);
    return 50 * ((s_a - e_a) / 6);
}

function eloMatchAdjustment(r_a, s_a, e_a) {
    //console.log(r_a, s_a, e_a);
    return 32 * ((s_a - e_a) / 32);
}