import { Match } from "./match";

export class Matches {
    private _matches = new Array<Match>();
    constructor(data?: Array<Match>) {
        this._matches = data || new Array<Match>();;
    }
    public push(m: Match) {
        this._matches.push(m);
    }
    public toString(deep?: boolean): string {
        let x = [];
        let returnString = "";
        for (var i = 0;i < this._matches.length;i++) {
            x.push(JSON.parse(this._matches[i].toString()));                        
        }
        return JSON.stringify(x,null,2);
    }
    public get biggestUpsets(): Matches {
        return new Matches(this._matches.sort((a,b)=>{
            return a.scoreDiff > b.scoreDiff ? -1 : 1;
        }))
    }
    public get all(): Array<Match> {
        return this._matches;
    }
}