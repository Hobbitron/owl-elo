import { Team } from "./team";
import { MapResult } from "./map";
import { Maps } from "./maps";

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
    "LJT": "lijaingTower",
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
    public mapWins: number;
    public mapLosses: number;
    public score: number;
    public winner: Team;
    public homeTeam: Team;
    public awayTeam: Team;
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
    public firstMap: Map;
    public secondMap: Map;
    public thirdMap: Map;
    public fourthMap: Map;
    public tieBreakerMap: Map;
    public maps: Maps;
    
    constructor(atts: Array<string>) {
        this.id = parseInt(atts[0]);
        this.week = parseInt(atts[1]);
        this._homeTeam = atts[2];
        this._awayTeam = atts[3];
        this.setMap(atts[4]);
        this._doradoScore = atts[4];
        this._templeOfAnubisScore = atts[5];
        this._iliosScore = atts[6];
        this._numbaniScore = atts[7];
        this._eichenwaldeScore = atts[8];
        this._junkertownScore = atts[9];
        this._horizonLunarColonyScore = atts[10];
        this._lijiangTowerScore = atts[11];
        this._oasisScore = atts[12];
        this.Init();
    }
    private setMap(score: string) {
        var mapName = mapsLookup[score.split(":")[0]];
        var homeScore = parseInt(score.split(":")[1]);
        var awayScore = parseInt(score.split(":")[2]);        
        var m = new MapResult(homeScore, awayScore, mapName, this.homeTeam.id, this.awayTeam.id);
        if (!this.maps) {
            this.maps = new Maps();
        }
        this.maps.push(m);
    }
    private Init() {
        var m: Map;
        if (this._doradoScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._templeOfAnubisScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._iliosScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._numbaniScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._eichenwaldeScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._junkertownScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._horizonLunarColonyScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._lijiangTowerScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
        if (this._oasisScore) {
            m = new Map(this._doradoScore, "dorado");
            this.doradoScore = m.score;
        }
    }
}