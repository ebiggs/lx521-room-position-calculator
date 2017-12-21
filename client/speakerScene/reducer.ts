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

const initialState: Inputs = {
  unitOfMeasure: 'ft',
  speakerSpan: 60 * Math.PI / 180,
  roomDimensions: new Vec2(15, 17),
  minWallOffsets: { top: 2, right: 2, bottom: 2, left: 2 },
  sweetSpot: new Ray2(new Vec2(8, 2), Vec2.fromDegrees(90))
}

export default handleActions<Inputs, Vec2 | number | radians | string | {wall: string, offset: number}>({
  [SET_UNIT_OF_MEASURE]: (state: Inputs, action: Action<string>): Inputs => {
    return ({
      ...state,
      unitOfMeasure: action.payload
    });
  },

  [SET_SWEET_SPOT_POSITION]: (state: Inputs, action: Action<Vec2>): Inputs => {
    const position = action.payload.crop(state.roomDimensions);
    return ({
      ...state,
      sweetSpot: state.sweetSpot.changePosition(position)
    });
  },

  [SET_SWEET_SPOT_DIRECTION]: (state: Inputs, action: Action<Vec2>): Inputs => {
    return ({
      ...state,
      sweetSpot: state.sweetSpot.changeDirection(action.payload)
    });
  },

  [SET_SPEAKER_SPAN]: (state: Inputs, action: Action<radians>): Inputs => {
    return ({
      ...state,
      speakerSpan: action.payload
    });
  },

  [SET_ROOM_DIMENSIONS]: (state: Inputs, action: Action<Vec2>): Inputs => {
    const roomDim = action.payload
    const position = state.sweetSpot.position.crop(roomDim);
    const maxWallOffset = roomDim.minComponent() / 2;
    return ({
      ...state,
      minWallOffsets: _.mapValues(state.minWallOffsets, x => Math.min(x, maxWallOffset)),
      roomDimensions: action.payload,
      sweetSpot: state.sweetSpot.changePosition(position)
    });
  },

  [SET_MIN_WALL_OFFSET]: (state: Inputs, action: Action<{wall: string, offset: number}>): Inputs => {
    const maxWallOffset = state.roomDimensions.minComponent() / 2;
    const offset = Math.min(maxWallOffset, action.payload.offset)
    return ({
      ...state,
      minWallOffsets: {...state.minWallOffsets, [action.payload.wall]: offset }
    });
  },
}, initialState);
