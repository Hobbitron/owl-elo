import {MapResult} from "./mapresult";

export class Maps extends Array<MapResult> {
    constructor() {
        super();
    }
    public wins(id: number): number {
        if (this.length === 0) {
            return 0;
        }
        let wins = 0;
        for (let i = 0;i< this.length;i++) {
            var map = this[i];
            if (map.tie) {
                continue;
            }
            if (map.winningTeamid === id) {
                wins++;
            }
        }
        return wins;
    }
    public losses(id: number): number {
        if (this.length === 0) {
            return 0;
        }
        let losses = 0;
        for (let i = 0;i< this.length;i++) {            
            var map = this[i];
            if (map.tie) {
                continue;
            }
            if (id === map.losingTeamid) {
                losses++;
            }            
        }
        return losses;
    }
}