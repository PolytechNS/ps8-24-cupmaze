
function isWallPlacementValid(firstWall, secondWall, space) {
    const isLaid = firstWall.isLaid || secondWall.isLaid || space.isLaid;
    return !isLaid;
}

module.exports = {isWallPlacementValid};