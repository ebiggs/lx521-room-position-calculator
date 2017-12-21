import * as React from 'react';
import { Dispatch } from 'redux';
import { Inputs, UnitFormatter } from '../model';
import { setSweetSpotPosition, setRoomDimensions, setMinWallOffset, setSpeakerSpan, setSweetSpotDirection, setUnitOfMeasure } from '../actions'

export interface ControlPanelProps {
  inputs: Inputs;
  fmt: UnitFormatter;
  dispatch: Dispatch<{}>;
  }
  
  export class ControlPanel extends React.Component<ControlPanelProps> {
  renderSliderField(labelFormatter: (number)=>any, label: string, step: number, min: number, max: number, value: number, onChange: any) {
    return (
      <div>
        <label>{label} = {labelFormatter(value)}</label>
        <div>
          <input 
            type="range" step={step} min={min}
            max={max} 
            value={value}
            onChange={(e) => onChange(e.target.value)}/>
        </div>
      </div>
    )
  }
  
  render() {
    const { inputs, dispatch, fmt } = this.props;
  
    const updateRoomX = 
      (x: number) => dispatch(setRoomDimensions(x, inputs.roomDimensions.y));
    const updateRoomY = 
      (y: number) => dispatch(setRoomDimensions(inputs.roomDimensions.x, y));
    const updateWallOffset = 
      (wall: string) => (offset: number) => dispatch(setMinWallOffset(wall, offset));
    const updateSweetSpotX = 
      (x: number) => dispatch(setSweetSpotPosition(x, inputs.sweetSpot.position.y));
    const updateSweetSpotY = 
      (y: number) => dispatch(setSweetSpotPosition(inputs.sweetSpot.position.x, y));
    const updateSweetSpotDir = 
      (degrees: number) => dispatch(setSweetSpotDirection(degrees));
    const updateSpeakerSpan = 
      (degrees: number) => dispatch(setSpeakerSpan(degrees));
    const updateUnitOfMeasure =
      (uom: string) => dispatch(setUnitOfMeasure(uom));
  
    return (
      <div className="controls">
      <select onChange={ (e) => updateUnitOfMeasure(e.target.value)} value={inputs.unitOfMeasure} >
        <option value="ft">Imperial</option>
        <option value="m">Metric</option>
      </select>
      {this.renderSliderField(fmt.formatDistance, "Room Width", 1/4, 2, 50, inputs.roomDimensions.x, updateRoomX)}
      {this.renderSliderField(fmt.formatDistance, "Room Length", 1/4, 2, 50, inputs.roomDimensions.y, updateRoomY)}
      {this.renderSliderField(fmt.formatDistance, "Sweet Spot X", 1/12, 0, inputs.roomDimensions.x, inputs.sweetSpot.position.x, updateSweetSpotX)}
      {this.renderSliderField(fmt.formatDistance, "Sweet Spot Y", 1/12, 0, inputs.roomDimensions.y, inputs.sweetSpot.position.y, updateSweetSpotY)}
      {this.renderSliderField(fmt.formatAngle, "Sweet Spot Θ", 1, 0, 180, inputs.sweetSpot.direction.angleDeg(), updateSweetSpotDir)}
      {this.renderSliderField(fmt.formatAngle, "Speaker Span", 1, 40, 80, Math.round(inputs.speakerSpan * 180 / Math.PI), updateSpeakerSpan)}
      {this.renderSliderField(fmt.formatDistance, "Top Offset", 1/12, 0, inputs.roomDimensions.minComponent() / 2, inputs.minWallOffsets.top, updateWallOffset("top"))}
      {this.renderSliderField(fmt.formatDistance, "Right Offset", 1/12, 0, inputs.roomDimensions.minComponent() / 2, inputs.minWallOffsets.right, updateWallOffset("right"))}
      {this.renderSliderField(fmt.formatDistance, "Bottom Offset", 1/12, 0, inputs.roomDimensions.minComponent() / 2, inputs.minWallOffsets.bottom, updateWallOffset("bottom"))}
      {this.renderSliderField(fmt.formatDistance, "Left Offset", 1/12, 0, inputs.roomDimensions.minComponent() / 2, inputs.minWallOffsets.left, updateWallOffset("left"))}
    </div>
    );
  }
  }