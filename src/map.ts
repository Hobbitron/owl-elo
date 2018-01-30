import * as maplist from "./maplist";

export class MapResult {    
    public score: number;    
    public mapType: string;
    public id: number;
    public winningTeamid: number;
    public losingTeamid: number;
    public tie: boolean = false;
    public homeTeamELO: number;
    public awayTeamELO: number;    

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
    }

    private calcScore() {                     
        var x = this.homePoints;
        var y = this.awayPoints;
        this.mapType = maplist[this.mapName];
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
    }
}