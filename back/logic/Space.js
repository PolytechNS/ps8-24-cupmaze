class Space {
    constructor(x, y) {
        this.pos_x = x;
        this.pos_y = y;
        this.isLaid = false;
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
        return this.pos_x === space.getPos_x() && this.pos_y === space.getPos_y();
    }
}

module.exports = { Space };