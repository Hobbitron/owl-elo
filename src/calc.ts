const map_k = 50;
const match_k = 30;
const match_points = 16;
const map_points = 3;

export function expectedMatchScore(r_a: number, r_b: number) {
    var e_a = (1 / (1 + Math.pow(10, (r_b - r_a) / 400)))
    e_a *= (match_points * 2);
    e_a -= match_points;
    return e_a;
}

export function expectedMapScore(r_a: number, r_b: number) {
    var e_a = (1 / (1 + Math.pow(10, (r_b - r_a) / 400)))
    e_a *= (map_points * 2);
    e_a -= map_points;
    return e_a;
}

export function eloMapAdjustment(s_a: number, e_a: number) {    
    return map_k * ((s_a - e_a) / (map_points * 2));
}

export function eloMatchAdjustment(s_a: number, e_a: number) {    
    return match_k * ((s_a - e_a) / (match_points * 2));
}