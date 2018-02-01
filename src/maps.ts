import {MapResult} from "./mapresult";

export class Maps  {    
    constructor(private items?: Array<MapResult>) {
        if (!items) {
            this.items = new Array<MapResult>();
        }
    }
    public push(map: MapResult) {
        this.items.push(map);
    }
    public wins(id: number): number {
        if (this.items.length === 0) {
            return 0;
        }
        let wins = 0;
        for (let i = 0;i< this.items.length;i++) {
            var map = this.items[i];
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
        if (this.items.length === 0) {
            return 0;
        }
        let losses = 0;
        for (let i = 0;i< this.items.length;i++) {            
            var map = this.items[i];
            if (map.tie) {
                continue;
            }
            if (id === map.losingTeamid) {
                losses++;
            }            
        }
        return losses;
    }    
    public team(id: number): Maps {        
        return new Maps(this.items.filter((m) => {
            if (m.homeTeamid === id || m.awayTeamid === id) {
                return true;
            }
            return false;
        }));
    }
    public get all(): MapResult[] {
        return this.items;
    }
}