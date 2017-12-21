export class Vec2 {
  
  constructor(readonly x: number, readonly y: number) { }

  toPojo() {
    return ({ x: this.x, y: this.y })
  }

  toString(formatter: (number) => string) {
    return `(${formatter(this.x)}, ${formatter(this.y)})`;
  }

  minus(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  plus(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  scale(s: number): Vec2 {
    return new Vec2(s * this.x, s* this.y);
  }

  dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vec2): number {
    return (this.x * v.y) - (this.y * v.x);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  minComponent(): number {
    return Math.min(this.x, this.y);
  }

  angleRads(): number {
    return Math.atan2(this.y, this.x);
  }

  angleDeg(): number {
    return Math.round(this.angleRads() * 180 / (Math.PI));
  }

  crop(bounds: Vec2): Vec2 {
    return new Vec2(
      Math.min(this.x, bounds.x),
      Math.min(this.y, bounds.y)
    )
  }

  public static fromDegrees(degrees: number) {
    return Vec2.fromRads(degrees * Math.PI / 180);
  }

  public static fromRads(rads: number) {
    return new Vec2(Math.cos(rads), Math.sin(rads))
  }

  public static fromPojo(pojo: {x: number, y: number}) {
    return new Vec2(pojo.x, pojo.y)
  }
}

export type LineSegment = {
  a: Vec2;
  b: Vec2;
}
  
export class Ray2 {
  constructor(readonly position: Vec2, readonly direction: Vec2) {}

  toPojo() {
    return ({ position: this.position.toPojo(), direction: this.direction.toPojo() })
  }

  changePosition(position: Vec2) {
    return new Ray2(position, this.direction);
  }

  changeDirection(direction: Vec2) {
    return new Ray2(this.position, direction);
  }
  
  lineSegmentIntersection(lineSegment: LineSegment, normal: Vec2 = undefined) {
    const isBehind = normal? angleDiff(this.direction.angleDeg(), normal.angleDeg()) <= 90 : false;
    const v1 = this.position.minus(lineSegment.a);
    const v2 = lineSegment.b.minus(lineSegment.a);
    const v3 = new Vec2(-this.direction.y, this.direction.x);
  
    const dot = v2.dot(v3);
    const isParallel = Math.abs(dot) < 0.000001;
  
    const t1 = v2.cross(v1) / dot;
    const t2 = (v1.dot(v3)) / dot;
  
    const isOnSegment = t1 >= 0.0 && (t2 >= 0.0 && t2 <= 1.0);
  
    return (!isBehind && !isParallel && isOnSegment) ? (
      v2.scale(t2).plus(lineSegment.a)
     ) : (
       undefined
     );
  }

  public static fromPojo(pojo: { position: {x: number, y: number}, direction: {x: number, y: number} }) {
    return new Ray2(Vec2.fromPojo(pojo.position), Vec2.fromPojo(pojo.direction));
  }
}

export type radians = number;

export type Inputs = {
  unitOfMeasure: string;
  sweetSpot: Ray2;
  roomDimensions: Vec2;
  minWallOffsets: { top: number, right: number, bottom: number, left: number };
  speakerSpan: radians;
}

export type Specification = {
  isToSpec: boolean,
  value: number,
}

export type Specifications = {
  left: { toeInDistance: Specification, backWallOffset: Specification, sideWallOffset: Specification }
  right: { toeInDistance: Specification, backWallOffset: Specification, sideWallOffset: Specification }
  area: Specification,
  speakerSeparation: Specification,
  listeningDistance: Specification 
}

export class Reflection {
  public imagePos: Vec2;
  public reflectPos: Vec2;
  public wallIsect: Vec2;

  constructor(readonly line: LineSegment, readonly pt: Vec2, private sweetSpot: Vec2) {
      const isXPlane = line.a.x === line.b.x
      this.wallIsect = isXPlane ? new Vec2(line.a.x, pt.y) : new Vec2(pt.x, line.a.y);
      this.imagePos = pt.minus(this.wallIsect).scale(-1).plus(this.wallIsect);
      const reflectionRay = new Ray2(this.imagePos, sweetSpot.minus(this.imagePos));
      this.reflectPos = reflectionRay.lineSegmentIntersection(line)
  }
}

export type Reflections = {back: Reflection , side: Reflection }

export type Output = { pos: Vec2, toeIn: { pos: Vec2, deg: number },  reflections: Reflections }

export type OutputPair = { left: Output, right: Output };

export function sweetSpotDirSegment(sweetSpot: Ray2): LineSegment {
  const a = sweetSpot.direction.scale(-100).plus(sweetSpot.position);
  const b = sweetSpot.direction.scale(100).plus(sweetSpot.position);
  return { a, b }
}

export function angleDiff(a1: number, a2: number) {
  return 180 - Math.abs(Math.abs(a1 - a2) - 180); 
}

export function normalizeDegrees(degrees: number) {
  const mod = degrees % 360;
  return mod > 180 ? mod - 360 : mod;
}

export class UnitFormatter {
  formatDistance: (number) => string;
  formatDistanceSquared: (number) => string;
  
  constructor(readonly unitOfMeasure: string) {
    this.formatDistance = (this.unitOfMeasure === 'ft' ? this.formatImperial :  this.formatMetric)
    this.formatDistanceSquared = (this.unitOfMeasure === 'ft' ? this.formatImperialSquared :  this.formatMetricSquared)
  }

  formatMetric(ft: number) {
    if (!ft) return 'N/A';
    const cm = Math.round(ft / 3.28 * 100)
    return cm >= 100 ? cm / 100 + "m" : cm + 'cm';
  }

  formatMetricSquared(sqft: number) {
    if (!sqft) return 'N/A';
    const sqcm = Math.round(sqft / .10764)
    return sqcm >= 100 ? sqcm / 100 + "m²" : sqcm + ' cm²';
  }

  formatImperialSquared(value) {
    if(!value) return 'N/A';
    const sqft = Math.round(value)
    return sqft + " ft²";
  }
  
  formatImperial(value: number) {
    if (!value) return 'N/A';
    var ft = Math.floor(value);
    const remainder = value - ft;
    var inches = Math.round(remainder / (1.0/12))
    if (inches == 12) {
      ft = ft + 1;
      inches = 0;
    }
    return ft + "' " + inches + '"';
  }

  formatAngle(value: number) {
    return Math.round(value) + "°";
  }
}