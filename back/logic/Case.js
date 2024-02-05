class Case{
    constructor(pos_x, pos_y, isOccupied){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.isOccupied = isOccupied;
    }

    getPos_x(){
        return this.pos_x;
    }

    getPos_y(){
        return this.pos_y;
    }

    getIsOccupied(){
        return this.isOccupied;
    }

    setIsOccupied(isOccupied){
        this.isOccupied = isOccupied;
    }
}

module.exports = { Case } ;