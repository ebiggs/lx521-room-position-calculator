import { handleActions, Action } from 'redux-actions';

import { Vec2, Ray2, Inputs, radians } from './model';
import {
  SET_SWEET_SPOT_POSITION,
  SET_SWEET_SPOT_DIRECTION,
  SET_SPEAKER_SPAN,
  SET_ROOM_DIMENSIONS,
  SET_MIN_WALL_OFFSET,
  SET_UNIT_OF_MEASURE
} from './constants/ActionTypes';

import * as _ from 'lodash';

export type InputState = {
  unitOfMeasure: string,
  speakerSpan: radians,
  roomDimensions: { x: number, y: number }
  minWallOffsets: {top: number, right: number, bottom: number, left: number }
  sweetSpot: { position:  { x: number, y: number }, direction: { x: number, y: number } } 
}

const initialState: InputState = {
  unitOfMeasure: 'ft',
  speakerSpan: 60 * Math.PI / 180,
  roomDimensions: new Vec2(15, 17).toPojo(),
  minWallOffsets: { top: 2, right: 2, bottom: 2, left: 2 },
  sweetSpot: new Ray2(new Vec2(8, 2), Vec2.fromDegrees(90)).toPojo()
}

export default handleActions<InputState, Vec2 | number | radians | string | {wall: string, offset: number}>({
  [SET_UNIT_OF_MEASURE]: (state: InputState, action: Action<string>): InputState => {
    return ({
      ...state,
      unitOfMeasure: action.payload
    });
  },

  [SET_SWEET_SPOT_POSITION]: (state: InputState, action: Action<Vec2>): InputState => {
    const position = Vec2.fromPojo(action.payload).crop(Vec2.fromPojo(state.roomDimensions));
    return ({
      ...state,
      sweetSpot: { ...state.sweetSpot, position: position.toPojo() }
    });
  },

  [SET_SWEET_SPOT_DIRECTION]: (state: InputState, action: Action<Vec2>): InputState => {
    return ({
      ...state,
      sweetSpot: { ...state.sweetSpot, direction: action.payload.toPojo() }
    });
  },

  [SET_SPEAKER_SPAN]: (state: InputState, action: Action<radians>): InputState => {
    return ({
      ...state,
      speakerSpan: action.payload
    });
  },

  [SET_ROOM_DIMENSIONS]: (state: InputState, action: Action<Vec2>): InputState => {
    const roomDim = action.payload
    const position = Vec2.fromPojo(state.sweetSpot.position).crop(roomDim);
    const maxWallOffset = roomDim.minComponent() / 2;
    return ({
      ...state,
      minWallOffsets: _.mapValues(state.minWallOffsets, x => Math.min(x, maxWallOffset)),
      roomDimensions: action.payload,
      sweetSpot: {...state.sweetSpot, position: position.toPojo() }
    });
  },

  [SET_MIN_WALL_OFFSET]: (state: InputState, action: Action<{wall: string, offset: number}>): InputState => {
    const maxWallOffset = Vec2.fromPojo(state.roomDimensions).minComponent() / 2;
    const offset = Math.min(maxWallOffset, action.payload.offset)
    return ({
      ...state,
      minWallOffsets: {...state.minWallOffsets, [action.payload.wall]: offset }
    });
  },
}, initialState);
