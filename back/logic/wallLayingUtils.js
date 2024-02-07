import {Wall} from "./Wall";

export {isWallPlacementValid}

function isWallPlacementValid(firstWall, secondWall, space) {
    const isLaid = firstWall.getIsLaid() || secondWall.getIsLaid() || space.getIsLaid();
    return !isLaid;
}