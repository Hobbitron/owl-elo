import { Match } from "./match";

export class Matches {
    private _matches = new Array<Match>();
    constructor() {        
    }
    public push(m: Match) {
        this._matches.push(m);
    }
}