class Wall{
    constructor(pos_x, pos_y, isLaid){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.isLaid = isLaid;
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
}

module.exports = { Wall };