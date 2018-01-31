import { Match } from "./match";
import { MapResult } from "./mapresult";
var Teams = {
    "SFS": {name: "San Francisco Shock", division: "West"},
    "HOU": {name: "Houston Outlaws", division: "West"},
    "DAL": {name: "Dallas Fuel", division: "West"},
    "VAL": {name: "Los Angeles Valiant", division: "West"},
    "GLA": {name: "Los Angeles Gladiators", division: "West"},
    "SEO": {name: "Seoul Dynasty", division: "West"},
    "NYE": {name: "New York Excelsior", division: "West"},
    "BOS": {name: "Boston Uprising", division: "West"},
    "SHD": {name: "Shanghai Dragons", division: "West"},
    "PHI": {name: "Philadelphia Fusion", division: "West"},
    "LON": {name: "London Spitfire", division: "West"},
    "FLA": {name: "Florida Mayhem", division: "West"}    
}

export class Team {
    public name: string;    
    private static nextid: number = 1;
    public id: number;
    public matches: Array<Match>;
    public mapWins: number = 0;
    public mapLosses: number = 0;
    public elo: number = 1500;
    constructor(public abbreviation: string) {
        this.id = Team.nextid++;
        this.name = Teams[abbreviation];
    }
    public addMatch(match: Match) {
        if (!this.matches) {
            this.matches = new Array<Match>();
        }
        this.matches.push(match);
        this.updateElo(match);
    }

    updateElo(match: Match) {

    }

    updateMapElo(res: MapResult) {

    }
}