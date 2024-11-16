interface Point {
  x: number;
  y: number;
  data?: any;
}

interface Boundes {
  x: number;
  y: number;
  width: number;
  height: number;
}

class QuadTree {
  private readonly capacity: number;
  private points: Point[];
  private bounds: Boundes;
  private divided: boolean;
  private northWest?: QuadTree;
  private northEast?: QuadTree;
  private southWest?: QuadTree;
  private southEast?: QuadTree;

  constructor(bounds: Boundes, capacity: number = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  //   ** check is a point lies with int a quadtree bound

  private containsPoint(point: Point): boolean {
    return (
      point.x >= this.bounds.x - this.bounds.width / 2 && // left bound
      point.x <= this.bounds.x + this.bounds.width / 2 && // right bound
      point.y >= this.bounds.y - this.bounds.height / 2 && // top bound
      point.y <= this.bounds.y + this.bounds.height / 2 // bottom bound
    );
  }

  //   *8 sub devide the quadtree into 4 sub quadtree

  private subdivide(): void {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const width = this.bounds.width / 2;
    const height = this.bounds.height / 2;

    //** north west
    const nw = {
      x: x - width / 2,
      y: y + height / 2,
      width: width,
      height: height,
    };

    this.northWest = new QuadTree(nw, this.capacity);

    // ** south west
    const sw = {
      x: x - width / 2,
      y: y - height / 2,
      width: width,
      height: height,
    };

    this.southWest = new QuadTree(sw, this.capacity);

    const ne = {
      x: x + width / 2,
      y: y + height / 2,
      width: width,
      height: height,
    };

    this.northEast = new QuadTree(ne, this.capacity);

    const se = {
      x: x + width / 2,
      y: y - height / 2,
      width: width,
      height: height,
    };

    this.southEast = new QuadTree(se, this.capacity);
    this.divided = true;
  }

  //   ** insert a point into the quadtrees

  insert(point: Point): boolean {
    if (!this.containsPoint(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northWest!.insert(point) ||
      this.northEast!.insert(point) ||
      this.southWest!.insert(point) ||
      this.southEast!.insert(point)
    );
  }

  private intersectsBounds(range: Boundes): boolean {
    return !(
      range.x - range.width / 2 > this.bounds.x + this.bounds.width / 2 ||
      range.x + range.width / 2 < this.bounds.x - this.bounds.width / 2 ||
      range.y - range.height / 2 > this.bounds.y + this.bounds.height / 2 ||
      range.y + range.height / 2 < this.bounds.y - this.bounds.height / 2
    );
  }

  

  //   ** query the quadtree for points that lie within a range

  query(range: Boundes): Point[] {
    let found: Point[] = [];
    if (!this.intersectsBounds(range)) {
      return found;
    }

    for (const point of this.points) {
      if (
        point.x >= range.x - range.width / 2 &&
        point.x < range.x + range.width / 2 &&
        point.y >= range.y - range.height / 2 &&
        point.y < range.y + range.height / 2
      ) {
        found.push(point);
      }
    }

    if (this.divided) {
      found = found.concat(
        this.northWest!.query(range),
        this.northEast!.query(range),
        this.southWest!.query(range),
        this.southEast!.query(range)
      );
    }

    return found;
  }
}

const bounds: Boundes = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};


const quadTree = new QuadTree(bounds, 4);

const point1: Point = { x: 10, y: 10, data: { id: 1, name: "Point 1" }};
const point2: Point = { x: 50, y: 50, data: { id: 2, name: "Point 2" }};
const point3: Point = { x: 80, y: 80, data: { id: 3, name: "Point 3" }};

quadTree.insert(point1);
quadTree.insert(point2);
quadTree.insert(point3);

console.log(quadTree.query({ x: 0, y: 0, width: 100, height: 100 }));