/// <reference path="./../../../node_modules/@types/mocha/index.d.ts" />

import { expect } from 'chai';

import * as actions from '../actions';

describe('actions', () => {
  it('sets the minimum wall offset', () => {
    const { payload: offset } = actions.setMinWallOffset('top', 4);

    expect(offset.offset).to.eql(4);
  });

  it('sets the room dimensions', () => {
    const { payload: dimensions } = actions.setRoomDimensions(7, 8);

    expect(dimensions.x).to.eql(7);
    expect(dimensions.y).to.eql(8);
  });

  it('sets the speaker span', () => {
    const { payload: rads } = actions.setSpeakerSpan(90);
    expect(rads).to.eql(Math.PI / 2);
  });

  it('set sweet spot direction', () => {
    const { payload: dir } = actions.setSweetSpotDirection(90);

    expect(dir.x).to.eql(0);
    expect(dir.y).to.eql(1);
  });

  it('sets sweet spot position', () => {
    const { payload: dimensions } = actions.setSweetSpotPosition(3, 4);

    expect(dimensions.x).to.eql(3);
    expect(dimensions.y).to.eql(4);
  });
});
