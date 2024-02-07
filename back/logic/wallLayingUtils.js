import {Wall} from "./Wall";

function isWallPlacementValid(firstWall, secondWall, space) {
    const isLaid = firstWall.getIsLaid() || secondWall.getIsLaid() || space.getIsLaid();
    return !isLaid;
}

module.exports = {isWallPlacementValid};