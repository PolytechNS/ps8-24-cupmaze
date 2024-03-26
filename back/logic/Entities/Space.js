class Space {
    constructor(x, y) {
        this.pos_x = x;
        this.pos_y = y;
        this.isLaid = false;
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

    equals(space){
        return this.pos_x === space.pos_x && this.pos_y === space.pos_y;
    }
}

module.exports = { Space };