import * as React from 'react';
import { Dispatch } from 'redux';
import { Inputs, UnitFormatter } from '../model';
import { setSweetSpotPosition, setRoomDimensions, setMinWallOffset, setSpeakerSpan, setSweetSpotDirection, setUnitOfMeasure } from '../actions'
import Slider, { Range } from 'rc-slider';
import * as _ from 'lodash'

import 'rc-slider/assets/index.css';

export interface ControlPanelProps {
  inputs: Inputs;
  fmt: UnitFormatter;
  dispatch: Dispatch<{}>;
}

type FieldState = {
  name: string,
  step: number, 
  min: number, 
  max: () => number,
  value: () => number,
  update: (number) => void,
  format: string
}

type ControlPanelState = {
  fields: { [name: string] : FieldState },
  selectedField: string
}
  
export class ControlPanel extends React.Component<ControlPanelProps, ControlPanelState> {

  constructor(props: ControlPanelProps) {
    super(props);
    const maxOffset = () => this.props.inputs.roomDimensions.minComponent() / 2;
    const inputs = this.props.inputs;
    const dispatch = this.props.dispatch;

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

    const fields = {
      "Room Width" : { name: "Room Width", step: 1/4, min: 2, max: () => 50, value: () => this.props.inputs.roomDimensions.x, update: updateRoomX, format: "distance" },
      "Room Length" : { name: "Room Length", step: 1/4, min: 2, max: () => 50, value: () => this.props.inputs.roomDimensions.y, update: updateRoomY, format: "distance" },
      "Sweet Spot X" : { name: "Sweet Spot X", step: 1/12, min: 0, max: () => this.props.inputs.roomDimensions.x, value: () => this.props.inputs.sweetSpot.position.x, update: updateSweetSpotX, format: "distance" },
      "Sweet Spot Y" : { name: "Sweet Spot Y", step: 1/12, min: 0, max: () => this.props.inputs.roomDimensions.y, value: () => this.props.inputs.sweetSpot.position.y, update: updateSweetSpotY, format: "distance" },
      "Sweet Spot Θ" : { name: "Sweet Spot Θ", step: 1/12, min: 0, max: () => 180, value: () => this.props.inputs.sweetSpot.direction.angleDeg(), update: updateSweetSpotDir, format: "angle" },
      "Speaker Span" : { name: "Speaker Span", step: 1, min: 40, max: () => 80, value: () => Math.round(this.props.inputs.speakerSpan * 180 / Math.PI), update: updateSpeakerSpan, format: "angle" },
      "Top Offset" : { name: "Top Offset", step: 1/12, min: 0, max: maxOffset, value: () => this.props.inputs.minWallOffsets.top, update: updateWallOffset("top"), format: "distance" },
      "Right Offset" : { name: "Right Offset", step: 1/12, min: 0, max: maxOffset, value: () => this.props.inputs.minWallOffsets.right, update: updateWallOffset("right"), format: "distance" },
      "Bottom Offset" : { name: "Bottom Offset", step: 1/12, min: 0, max: maxOffset, value: () => this.props.inputs.minWallOffsets.bottom, update: updateWallOffset("bottom"), format: "distance" },
      "Left Offset" : { name: "Left Offset", step: 1/12, min: 0, max: maxOffset, value: () => this.props.inputs.minWallOffsets.left, update: updateWallOffset("left"), format: "distance" }
    }

    this.state = { fields, selectedField: "Room Width"};
  }

  renderFieldBtn(field: FieldState) {
    const selectField = () => this.setState({... this.state, selectedField: field.name});
    const formatter = field.format === "distance" ? this.props.fmt.formatDistance : this.props.fmt.formatAngle;

    return (
      <button key={field.name} type="button" onClick={selectField}>{field.name} = {formatter(field.value())}</button>
    )
  }

  renderFieldAdjuster() {
    const  field = this.state.fields[this.state.selectedField];

    const ft: number = Math.floor(field.value());
    const inches: number = Math.round((field.value() - ft)*12);
    const totalCm: number = Math.round(field.value() * 30.48);
    const m = Math.floor(totalCm / 100.0);
    const cm: number = totalCm - m*100;

    const updateField = (newValue: number) => { 
      if(newValue >= field.min && newValue <= field.max()) field.update(newValue) 
    };
    
    const ftChange = (ft: number) => updateField(ft + inches/12)

    const inChange = (inches: number) => updateField(ft + inches/12);

    const mChange = (m: number) => updateField((m * 100 + cm) / 30.48);

    const cmChange = (cm: number) => updateField((m * 100 + cm) / 30.48);

    return (
      <div className="adjuster">
        <b>Set {field.name}:</b>
        <br />
        { field.format === 'angle' ? (
          <div style={{marginLeft: 50}}>
            <input type="number" onChange={e => updateField(+e.target.value)} style={{width: 47}} value={ft} />&deg;
          </div>
        ) : (this.props.inputs.unitOfMeasure === "ft" ? (
          <div style={{marginLeft: 20}}>
            <input type="number" onChange={e => ftChange(+e.target.value)} style={{width: 27}} value={ft} />ft
            &nbsp;
            <input type="number" onChange={e => inChange(+e.target.value)} style={{width: 27}} value={inches} />in
          </div>
        ) : (
          <div style={{marginLeft: 20}}>
            <input type="number" onChange={e => mChange(+e.target.value)} style={{width: 27}} value={m} />m
            &nbsp;
            <input type="number" onChange={e => cmChange(+e.target.value)} style={{width: 27}} value={cm} />cm
          </div>
        ))}
        <br /><br />
        <div style={{marginLeft: 60, height: 350}}>
          <Slider 
            min={field.min} 
            max={field.max()} 
            step={field.step} 
            value={field.value()} 
            vertical={true} 
            onChange={updateField}
            trackStyle={{ backgroundColor: 'blue', width: 10 }}
            handleStyle={{
              borderColor: 'blue',
              height: 28,
              width: 28,
              marginLeft: -9,
              marginTop: -14,
              backgroundColor: 'black',
            }}
            railStyle={{ backgroundColor: 'red', width: 10 }}
            />
          </div>
      </div>
    )
  }

  render() {
    const { inputs, dispatch, fmt } = this.props;
    const updateUnitOfMeasure =
      (uom: string) => dispatch(setUnitOfMeasure(uom));

    const buttons = _.map(this.state.fields, f => this.renderFieldBtn(f));
  
    return (
      <div className="controls">
      <select onChange={ (e) => updateUnitOfMeasure(e.target.value)} value={inputs.unitOfMeasure} >
        <option value="ft">Imperial</option>
        <option value="m">Metric</option>
      </select>
      {buttons}
      {this.renderFieldAdjuster()}
    </div>
    );
  }
}