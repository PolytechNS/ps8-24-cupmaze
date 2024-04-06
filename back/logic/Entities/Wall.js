class Wall{
    constructor(pos_x, pos_y, isLaid, inclinaison){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.isLaid = isLaid;
        this.inclinaison = inclinaison;
        this.player = 0;
    }


    getPos_x(){
        return this.pos_x;
    }

    getPos_y(){
        return this.pos_y;
    }

    getIsLaid(){
        return this.isLaid;
    }

    setIsLaid(isLaid){
        this.isLaid = isLaid;
    }

    getInclinaison(){
        return this.inclinaison;
    }

    setInclinaison(inclinaison) {
        this.inclinaison = inclinaison;
    }

    getPlayer(){
        return this.player;
    }

    setPlayer(player){
        this.player = player;
    }

    equals(wall){
        return this.pos_x === wall.pos_x && this.pos_y === wall.pos_y && this.inclinaison === wall.inclinaison;
    }
}

module.exports = { Wall};