import { Team } from './team';

var teams = {
    "SFS": {id: 1, name: "San Francisco Shock", division: "West"},
    "HOU": {id: 2, name: "Houston Outlaws", division: "West"},
    "DAL": {id: 3, name: "Dallas Fuel", division: "West"},
    "VAL": {id: 4, name: "Los Angeles Valiant", division: "West"},
    "GLA": {id: 5, name: "Los Angeles Gladiators", division: "West"},
    "SEO": {id: 6, name: "Seoul Dynasty", division: "West"},
    "NYE": {id: 7, name: "New York Excelsior", division: "West"},
    "BOS": {id: 8, name: "Boston Uprising", division: "West"},
    "SHD": {id: 9, name: "Shanghai Dragons", division: "West"},
    "PHI": {id: 10, name: "Philadelphia Fusion", division: "West"},
    "LON": {id: 11, name: "London Spitfire", division: "West"},
    "FLA": {id: 12, name: "Florida Mayhem", division: "West"}    
}

export class Teams {
    private static _teams = new Array<Team>();
    constructor() {        
    }
    public static get SFS(): Team {
        return this.GetTeam("SFS");       
    }
    public static get HOU(): Team {
        return this.GetTeam("HOU");
    }
    public static get DAL(): Team {
        return this.GetTeam("DAL");
    }
    public static get SEO(): Team {
        return this.GetTeam("SEO");
    }
    public static get BOS(): Team {
        return this.GetTeam("BOS");
    }
    public static get VAL(): Team {
        return this.GetTeam("VAL");
    }
    public static get GLA(): Team {
        return this.GetTeam("GLA");
    }
    public static get SHD(): Team {
        return this.GetTeam("SHD");
    }
    public static get LON(): Team {
        return this.GetTeam("LON");
    }
    public static get PHI(): Team {
        return this.GetTeam("PHI");
    }
    public static get FLA(): Team {
        return this.GetTeam("FLA");
    }
    public static get NYE(): Team {
        return this.GetTeam("NYE");
    }
    public static GetTeam(abbreviation: string): Team {
        let t = this._teams.find(t => t.abbreviation === abbreviation);
        if (t) {
            return t;
        }
        t = new Team(abbreviation, teams[abbreviation].name);
        this._teams.push(t);
        return t;
    }
    public static GetStandings() {
        return this._teams.sort((a,b) => {
            return a.elo > b.elo ? -1 : 1;
        })
    }

    public static toString() {
        var ret = [];        
        for (let i = 0;i < this._teams.length;i++) {
            ret.push(this._teams[i].getJson());
        }
        return JSON.stringify(ret,null,2);
    }
}