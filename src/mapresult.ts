import { expectedMapScore, eloMapAdjustment} from "./calc";
import * as maplist from "./maplist";

export interface Map {
    
}

export class MapResult {    
    public score: number;    
    public mapType: string;
    public id: number;
    public mapid: number;
    public winningTeamid: number;
    public losingTeamid: number;
    public tie: boolean = false;
    public homeTeamELO: number;
    public awayTeamELO: number;    
    public adjustment: number;    
    public expectedScore: number;
    public scoreDiff: number;

    private static nextid: number = 1;

    constructor(public homePoints: number, public awayPoints: number, public mapName: string,  public homeTeamid: number, public awayTeamid: number) {
        this.calcScore();
        if (this.score > 0) {
            this.winningTeamid = this.homeTeamid;
            this.losingTeamid = this.awayTeamid;
        } else if (this.score < 0) {
            this.winningTeamid = this.awayTeamid;
            this.losingTeamid = this.homeTeamid;
        } else {
            this.tie = true;
        }
        this.id = MapResult.nextid++;
        this.mapid = maplist.default[this.mapName]['id'];
    }

    private calcScore() {                     
        var x = this.homePoints;
        var y = this.awayPoints;
        this.mapType = maplist.default[this.mapName].type;
        if (x === y) {
            this.score = 0;
        } else if (y === 0 || x === 0) {
            if (this.mapType === 'hybrid' || this.mapType === 'escort') {
                //max 3 points
                if (x + y === 3) {
                    this.score = 3;
                } else {
                    this.score = 2;
                }
            } else {
                //max 2 points available
                if (x + y === 2) {
                    this.score = 3;
                } else {
                    this.score = 2;
                }
            }
        } else {
            this.score = 1;
        }
        if (y > x) {
            this.score *= -1;
        }
    }

    public setAdjustment() {
        this.expectedScore = expectedMapScore(this.homeTeamELO, this.awayTeamELO);
        this.adjustment = eloMapAdjustment(this.score, this.expectedScore);
        this.scoreDiff = Math.abs(this.expectedScore - this.score);
    }
}