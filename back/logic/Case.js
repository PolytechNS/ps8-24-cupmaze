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

    equals(caseWanted){
        return this.pos_x === caseWanted.getPos_x() && this.pos_y === caseWanted.getPos_y();
    }

    isAdjacent(caseWanted){
        return (Math.abs(this.pos_x - caseWanted.getPos_x()) === 1 && this.pos_y === caseWanted.getPos_y()) || (Math.abs(this.pos_y - caseWanted.getPos_y()) === 1 && this.pos_x === caseWanted.getPos_x());
    }
}

module.exports = { Case } ;