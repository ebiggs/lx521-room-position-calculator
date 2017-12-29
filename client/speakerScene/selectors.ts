import * as _ from 'lodash';
import { createSelector } from 'reselect';
import {
  Inputs, Vec2, Ray2, LineSegment, OutputPair, Output, Specification, Specifications, Reflection, Reflections,
  normalizeDegrees, angleDiff, sweetSpotDirSegment
} from './model';

export const inputsSelector = createSelector(
  state => state['speakerScene'],
  inputState => {
    const theInputs: Inputs = {
      roomDimensions: Vec2.fromPojo(inputState.roomDimensions),
      minWallOffsets: inputState.minWallOffsets,
      sweetSpot: Ray2.fromPojo(inputState.sweetSpot),
      speakerSpan: inputState.speakerSpan,
      unitOfMeasure: inputState.unitOfMeasure
    }
    return theInputs;
  }
);
  
function computeBounds(inputs: Inputs, offsets: { top: number, right: number, bottom: number, left: number }) {
  const o = offsets;
  const bl = new Vec2(o.left, o.bottom);
  const br = new Vec2(inputs.roomDimensions.x - o.right, o.bottom)
  const tr = new Vec2(inputs.roomDimensions.x - o.right, inputs.roomDimensions.y - o.top)
  const tl = new Vec2(o.left, inputs.roomDimensions.y - o.top)
  const top: LineSegment = { a: tl, b: tr };
  const right: LineSegment = { a: tr, b: br };
  const bottom: LineSegment = { a: bl, b: br };
  const left: LineSegment = { a: tl, b: bl };
  
  return { top, right, bottom, left };
}
  
const computeRoomBounds = createSelector(
  inputsSelector,
  inputs => {
    return computeBounds(inputs, { top: 0, right: 0, bottom: 0, left: 0})
  }
);
  
const computeSpeakerBounds = createSelector(
  inputsSelector,
  inputs => {
    return computeBounds(inputs, inputs.minWallOffsets)
  }
);
  
export const outputsSelector = createSelector(
  inputsSelector,
  computeSpeakerBounds,
  computeRoomBounds,
  (inputs, bounds, roomBounds) => {
    const boundNormals = { top: new Vec2(0, -1), right: new Vec2(-1, 0), bottom: new Vec2(0, 1), left: new Vec2(1, 0)}
    const rDir = Vec2.fromRads(inputs.sweetSpot.direction.angleRads() - inputs.speakerSpan / 2);
    const lDir = Vec2.fromRads(inputs.sweetSpot.direction.angleRads() + inputs.speakerSpan / 2);
    const rRay: Ray2 = new Ray2(inputs.sweetSpot.position, rDir);
    const lRay: Ray2 = new Ray2(inputs.sweetSpot.position, lDir);
  
    const rIsect = _.map(bounds, (line, key) => rRay.lineSegmentIntersection(line, boundNormals[key])).filter(pt => !!pt)[0];
    const lIsect = _.map(bounds, (line, key) => lRay.lineSegmentIntersection(line, boundNormals[key])).filter(pt => !!pt)[0];
  
    function computeReflectionPoints(pt: Vec2) {
    return _.map(roomBounds, (line: LineSegment) => new Reflection(line, pt, inputs.sweetSpot.position));
    }
  
    function isToeInGood(deg: number): boolean {
    return deg > 0 && deg < 45 * (2/3);
    }
  
    if(!rIsect || !lIsect) {
    return {
      right: undefined,
      left: undefined
    }
    } else {
    
    const rLen = rIsect.minus(inputs.sweetSpot.position).length();
    const lLen = lIsect.minus(inputs.sweetSpot.position).length();
  
    const len = Math.min(rLen, lLen);
  
    const rPos = rDir.scale(len).plus(inputs.sweetSpot.position);
    const lPos = lDir.scale(len).plus(inputs.sweetSpot.position);
  
    const rSurfaces = computeReflectionPoints(rPos);
    const lSurfaces = computeReflectionPoints(lPos);
  
    const directions = {
      forward: 0, left: 90, back: 180, right: 270
    };
  
    const rWays = _.mapValues(directions, x => normalizeDegrees(x + (rDir.angleDeg())));
    const lWays = _.mapValues(directions, x => normalizeDegrees(x + (lDir.angleDeg())));
    
    const rSide = _.minBy(rSurfaces, (refl: Reflection) => angleDiff(refl.reflectPos.minus(rPos).angleDeg(), rWays.right));
    const rBack = _.minBy(rSurfaces, (refl: Reflection) => angleDiff(refl.reflectPos.minus(rPos).angleDeg(), rWays.forward));
  
    const lSide = _.minBy(lSurfaces, (refl: Reflection) => angleDiff(refl.reflectPos.minus(lPos).angleDeg(), lWays.left));
    const lBack = _.minBy(lSurfaces, (refl: Reflection) => angleDiff(refl.reflectPos.minus(lPos).angleDeg(), lWays.forward));
  
    const rReflections = { back: rBack, side: rSide };
    const lReflections = { back: lBack, side: lSide };
  
    const ssSegment = sweetSpotDirSegment(inputs.sweetSpot);
    const rToeInDir = Vec2.fromDegrees(normalizeDegrees(rSide.reflectPos.minus(rPos).angleDeg() - 90));
    const rToeInDeg = rDir.scale(-1).angleDeg() - rToeInDir.angleDeg();
    const rToeInPos = isToeInGood(rToeInDeg) ? new Ray2(rPos, rToeInDir).lineSegmentIntersection(ssSegment) : undefined;
    const rToeIn = isToeInGood(rToeInDeg) ? { pos: rToeInPos, deg: rToeInDeg } : undefined;
  
    const lToeInDir = Vec2.fromDegrees(normalizeDegrees(lSide.reflectPos.minus(lPos).angleDeg() + 90));
    const lToeInDeg = lToeInDir.angleDeg() - lDir.scale(-1).angleDeg()
    const lToeInPos = isToeInGood(lToeInDeg) ? new Ray2(lPos, lToeInDir).lineSegmentIntersection(ssSegment) : undefined;
    const lToeIn = isToeInGood(lToeInDeg) ? { pos: lToeInPos, deg: lToeInDeg } : undefined;
  
    return {
      right: { pos: rPos, toeIn: rToeIn, reflections:  rReflections },
      left: { pos: lPos, toeIn: lToeIn, reflections: lReflections }
    }
    }
  }
);
  
export const specificationsSelector = createSelector(
  inputsSelector,
  computeRoomBounds,
  outputsSelector,
  (inputs, roomBounds, speakers) => {
    if(speakers.left && speakers.right) {
      const leftToeInDistance = speakers.left.toeIn ? inputs.sweetSpot.position.minus(speakers.left.toeIn.pos).length() : undefined;
      const rightToeInDistance = speakers.right.toeIn ? inputs.sweetSpot.position.minus(speakers.right.toeIn.pos).length() : undefined;
    
      const area = inputs.roomDimensions.x * inputs.roomDimensions.y
    
      const speakerSeparation = speakers.left.pos.minus(speakers.right.pos).length();
    
      const listeningDistance = speakers.left.pos.minus(inputs.sweetSpot.position).length();
    
      const lBackWallOffset = speakers.left.reflections.back.wallIsect.minus(speakers.left.pos).length()
      const rBackWallOffset = speakers.right.reflections.back.wallIsect.minus(speakers.right.pos).length()
    
      const lSideWallOffset = speakers.left.reflections.side.wallIsect.minus(speakers.left.pos).length()
      const rSideWallOffset = speakers.right.reflections.side.wallIsect.minus(speakers.right.pos).length()
    
      const leftSpec = {
        toeInDistance: { isToSpec: true, value: leftToeInDistance },
        backWallOffset: { isToSpec: (lBackWallOffset >= 4), value: lBackWallOffset },
        sideWallOffset: { isToSpec: (lSideWallOffset >= 2), value: lSideWallOffset }
      }
    
      const rightSpec = {
        toeInDistance: { isToSpec: true, value: rightToeInDistance },
        backWallOffset: { isToSpec: (rBackWallOffset >= 4), value: rBackWallOffset },
        sideWallOffset: { isToSpec: (rSideWallOffset >= 2), value: rSideWallOffset }
      }
    
      return {
        left: leftSpec,
        right: rightSpec,
        area: { isToSpec: (area >= 240), value: area },
        speakerSeparation: { isToSpec: (speakerSeparation >= 8), value: speakerSeparation},
        listeningDistance:  { isToSpec: (listeningDistance >= 8 && listeningDistance <= 18), value: listeningDistance}
      }
    } else {
      return {
        left: { toeInDistance: { isToSpec: false, value: undefined }, backWallOffset: { isToSpec: false, value: undefined }, sideWallOffset: { isToSpec: false, value: undefined } },
        right: { toeInDistance: { isToSpec: false, value: undefined }, backWallOffset: { isToSpec: false, value: undefined }, sideWallOffset: { isToSpec: false, value: undefined } },
        area: { isToSpec: false, value: undefined },
        speakerSeparation: { isToSpec: false, value: undefined },
        listeningDistance: { isToSpec: false, value: undefined }
      }
    }
  }
);