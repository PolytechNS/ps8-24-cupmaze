class Wall{
    constructor(pos_x, pos_y, isLaid, inclinaison){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.isLaid = isLaid;
        this.inclinaison = inclinaison;
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

    equals(wall){
        return this.pos_x === wall.getPos_x() && this.pos_y === wall.getPos_y() && this.inclinaison === wall.getInclinaison();
    }

    toString(){
        return "Wall : "+this.pos_x+" "+this.pos_y+" "+this.isLaid+" "+this.inclinaison;
    }
}

module.exports = { Wall };