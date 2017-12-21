import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as React from 'react';
import * as _ from 'lodash';

import {
  Inputs, Vec2, Ray2, LineSegment, OutputPair, Output, Specification, Specifications, Reflection, Reflections,
  normalizeDegrees, angleDiff, UnitFormatter
} from '../../speakerScene/model';

import { ControlPanel } from '../../speakerScene/components/ControlPanel'
import { SpecTables } from '../../speakerScene/components/SpecTables';
import { Diagram } from '../../speakerScene/components/Diagram';

import {
  inputsSelector,
  outputsSelector,
  specificationsSelector
} from '../../speakerScene/selectors';

interface AppProps {
  inputs: Inputs;
  outputs: OutputPair;
  specifications: Specifications;
  dispatch: Dispatch<{}>;
}

class App extends React.Component<AppProps> {

  render() {
    const { inputs, outputs, dispatch, specifications } = this.props;

    const fmt = new UnitFormatter(inputs.unitOfMeasure);

    return (
      <div>
        <a href="https://github.com/ebiggs/lx521-room-position-calculator"><img className="forkme" src="https://camo.githubusercontent.com/8b6b8ccc6da3aa5722903da7b58eb5ab1081adee/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f6f72616e67655f6666373630302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_orange_ff7600.png" /></a>
        <h1 className="clearForkMe">LX521 Room Position Calculator</h1>
        <p className="clearForkMe">This is an interactive calculator for performing the placement and toe-in calculations for an LX521 dipole loudspeaker <a href="http://www.linkwitzlab.com/LX521/Description.htm">as described by Siegfried Linkwitz</a>, the speaker's creator.
          Start by dialing in your room dimensions, then where you'd like your sweet spot to be. You can then orient your listening off-axis if you so choose. The "Speaker Span" should ideally stay at 60&deg; creating an equilateral triangle between
          the sweet spot and the positions of the two dipoles, but this can be modified as well. The point of speaker positioning is at the tweeter. All positions are measured from the bottom-left corner with the X-axis running horizontally and the Y-axis running vertically.
          If you need to bring a speaker inward, adjust the offset corresponding to the wall (top, bottom, left, right) you need to move it away from. Scroll to the bottom to see results.
        </p>
        <ControlPanel inputs={inputs} dispatch={dispatch} fmt={fmt} />
        <Diagram inputs={inputs} outputs={outputs} />
        <SpecTables outputs={outputs} specs={specifications} fmt={fmt} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return ({
    inputs: inputsSelector(state),
    outputs: outputsSelector(state),
    specifications: specificationsSelector(state)
  });
}

export default connect(mapStateToProps)(App);