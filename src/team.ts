import { Match } from "./match";
import { MapResult } from "./mapresult";
import { Maps } from "./maps";
import { Matches } from "./matches";
import { expectedMatchScore, eloMatchAdjustment, expectedMapScore, eloMapAdjustment} from "./calc";

export class Team {     
    private _homeMaps = new Maps();
    private _awayMaps = new Maps();
    private _homeMatches = new Matches();
    private _awayMatches = new Matches();
    private _mapElo: {[id:string]:number} = {};
    private static nextid: number = 1;
    public id: number;
    public matches: Array<Match>;
    public mapWins: number = 0;
    public mapLosses: number = 0;
    public matchWins: number = 0;
    public matchLosses: number = 0;
    public elo: number = 1500;
    constructor(public abbreviation: string, public name: string) {
        this.id = Team.nextid++;        
    }    
    public addHomeMatch(match: Match) {
        this._homeMatches.push(match);
        this.updateElo(match, true);
    }
    public addAwayMatch(match: Match) {
        this._awayMatches.push(match);
        this.updateElo(match, false);
    }
    public addHomeMap(map: MapResult) {
        this._homeMaps.push(map);
        this.updateMapElo(map, true);
    }
    public addAwayMap(map: MapResult) {
        this._awayMaps.push(map);        
        this.updateMapElo(map, false);
    }
    public get maps(): Maps {
        return new Maps([...this._awayMaps.all, ...this._homeMaps.all]);
    }

    updateElo(match: Match, isHome: boolean) {
        if (this.abbreviation === "SEO") {
            debugger;
        }
        if (isHome) {
            this.elo += match.adjustment;            
        } else {
            this.elo -= match.adjustment;
        }
        if (match.winner === this) {
            this.matchWins++;
        } else {
            this.matchLosses++;
        }
    }

    updateMapElo(res: MapResult, isHome: boolean) {
        if (res.winningTeamid === this.id) {
            this.mapWins++;
        } else if (res.tie) {

        } else {
            this.mapLosses++;
        }
        if (this._mapElo[res.mapName] === undefined) {
            this._mapElo[res.mapName] = 1500;
        }
        if (isHome) {
            this._mapElo[res.mapName] += res.adjustment;
        } else {
            this._mapElo[res.mapName] -= res.adjustment;
        } 
    }

    getMapElo(mapname: string) {
        if (this._mapElo[mapname] === undefined) {
            this._mapElo[mapname] = 1500;
        }
        return this._mapElo[mapname];
    }
}

