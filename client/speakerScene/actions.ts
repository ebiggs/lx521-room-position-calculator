import { createAction } from 'redux-actions';

import { Vec2, radians } from './model';

import {
  SET_SWEET_SPOT_POSITION,
  SET_SWEET_SPOT_DIRECTION,
  SET_SPEAKER_SPAN,
  SET_ROOM_DIMENSIONS,
  SET_MIN_WALL_OFFSET,
  SET_UNIT_OF_MEASURE
} from './constants/ActionTypes';

const setSweetSpotPosition = createAction<Vec2, number, number>(
  SET_SWEET_SPOT_POSITION,
  (x: number, y: number) => (new Vec2(x, y))
);

const setSweetSpotDirection = createAction<Vec2, number>(
  SET_SWEET_SPOT_DIRECTION,
  (degrees: number) => Vec2.fromDegrees(degrees)
);

const setSpeakerSpan = createAction<radians, number>(
  SET_SPEAKER_SPAN,
  (degrees: number) => degrees * Math.PI / 180
);

const setRoomDimensions = createAction<Vec2, number, number>(
  SET_ROOM_DIMENSIONS,
  (x: number, y: number) => (new Vec2(x, y))
);

const setMinWallOffset = createAction<{wall: string, offset: number}, string, number>(
  SET_MIN_WALL_OFFSET,
  (wall: string, offset: number) => ({ wall, offset })
);

const setUnitOfMeasure = createAction<string, string>(
  SET_UNIT_OF_MEASURE,
  (unit: string) => unit
);

export {
  setSweetSpotPosition,
  setSweetSpotDirection,
  setSpeakerSpan,
  setRoomDimensions,
  setMinWallOffset,
  setUnitOfMeasure
}
