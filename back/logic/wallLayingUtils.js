function isWallPlacementValid(firstWall, secondWall, space) {
    console.log("space", space);
    const isLaid = firstWall.isLaid || secondWall.isLaid || space.isLaid;
    return !isLaid;
}

module.exports = {isWallPlacementValid};