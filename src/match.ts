import { Team } from "./team";
import { Teams } from "./teams";
import { MapResult } from "./mapresult";
import { Maps } from "./maps";
import { expectedMatchScore, eloMatchAdjustment } from "./calc";

enum maps {
    "dorado" = 0,
    "templeOfAnubis",
    "ilios",
    "numbani",
    "eichenwalde",
    "junkertown",
    "horizonLunarColony",
    "lijaingTower",
    "oasis"
}

var mapsLookup = {
    "DOR": "dorado",
    "TOA": "templeOfAnubis",
    "ILI": "ilios",
    "NUM": "numbani",
    "EIC": "eichenwalde",
    "JNK": "junkertown",
    "HLC": "horizonLunarColony",
    "LJT": "lijiangTower",
    "OAS": "oasis"
}

export class Match {
    private _homeTeam: string;
    private _awayTeam: string
    private _doradoScore: string;    
    private _templeOfAnubisScore: string;    
    private _iliosScore: string;    
    private _numbaniScore: string;    
    private _eichenwaldeScore: string;    
    private _junkertownScore: string;    
    private _horizonLunarColonyScore: string;    
    private _lijiangTowerScore: string;    
    private _oasisScore: string;

    public mapCount: number;
    public mapWins: number = 0;
    public mapLosses: number = 0;
    public score: number = 0;
    public scoreDiff: number;
    public winner: Team;
    public loser: Team;
    public homeTeam: Team;
    public awayTeam: Team;
    public homeTeamID: number;
    public awayTeamID: number;
    public templeOfAnubisScore: number;
    public doradoScore: number;
    public iliosScore: number;
    public numbaniScore: number;
    public eichenwaldeScore: number;
    public lijiangTowerScore: number;
    public junkertownScore: number;
    public horizonLunarColonyScore: number;
    public oasisScore: number;
    public week: number;
    public id: number;
    public firstMap: MapResult;
    public secondMap: MapResult;
    public thirdMap: MapResult;
    public fourthMap: MapResult;
    public tieBreakerMap: MapResult;
    public maps: Maps;
    public homeTeamELO: number;
    public awayTeamELO: number;
    public expectedScore: number;
    public adjustment: number;
    
    constructor(atts: Array<string>) {
        this.id = parseInt(atts[0]);
        this.week = parseInt(atts[1]);
        this._homeTeam = atts[2];
        this.homeTeam = Teams.GetTeam(atts[2]);
        this._awayTeam = atts[3];        
        this.awayTeam = Teams.GetTeam(atts[3]);
        this.homeTeamID = this.homeTeam.id;
        this.awayTeamID = this.awayTeam.id;
        this.homeTeamELO = this.homeTeam.elo;
        this.awayTeamELO = this.awayTeam.elo;
        this.firstMap = this.setMap(atts[4]);
        this.secondMap = this.setMap(atts[5]);
        this.thirdMap = this.setMap(atts[6]);
        this.fourthMap = this.setMap(atts[7]);
        if (atts[8]) {
            this.tieBreakerMap = this.setMap(atts[8]);
        }
        this.finalize();
        this.setAdjustment();
        this.homeTeam.addHomeMatch(this);
        this.awayTeam.addAwayMatch(this);
    }
    private setMap(score: string) {
        var splitchar = score.split(":").length > 1 ? ":" : ";";
        var mapName = mapsLookup[score.split(splitchar)[0]];
        if (!mapName) {
            throw "Couldn't find map for: " + score.split(splitchar)[0];
        }
        var homeScore = parseInt(score.split(splitchar)[1]);
        var awayScore = parseInt(score.split(splitchar)[2]);        
        var m = new MapResult(homeScore, awayScore, mapName, this.homeTeam.id, this.awayTeam.id);
        if (!this.maps) {
            this.maps = new Maps();
        }
        if (m.winningTeamid === this.homeTeam.id) {
            this.mapWins++;            
        } else if (m.tie) {

        } else {
            this.mapLosses++;
        }
        this.score += m.score;
        m.homeTeamELO = this.homeTeam.getMapElo(mapName);        
        m.awayTeamELO = this.awayTeam.getMapElo(mapName);
        m.setAdjustment();
        this.maps.push(m);
        this.homeTeam.addHomeMap(m);
        this.awayTeam.addAwayMap(m);        
        return m;
    }    
    private finalize() {
        if (this.mapWins > this.mapLosses) {
            this.winner = this.homeTeam;
            this.loser = this.awayTeam;
            this.score += 4;
        } else {
            this.winner = this.awayTeam;
            this.loser = this.homeTeam;
            this.score -= 4;
        }
    }
    public setAdjustment() {        
        this.expectedScore = expectedMatchScore(this.homeTeamELO, this.awayTeamELO);
        this.adjustment = eloMatchAdjustment(this.score, this.expectedScore);
        this.scoreDiff = Math.abs(this.expectedScore - this.score);
    }
    public toString() {
        let homeTeam = this.homeTeam;
        let awayTeam = this.awayTeam;
        let winner = this.winner;
        let loser = this.loser;
        delete this.homeTeam;
        delete this.awayTeam;
        delete this.winner;
        delete this.loser;
        var returnString = JSON.stringify(this, null, 2);
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.winner = winner;
        this.loser = loser;
        return returnString
    }
}