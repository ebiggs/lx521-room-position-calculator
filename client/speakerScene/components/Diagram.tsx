import * as React from 'react';
import { 
  Inputs, OutputPair, Output, UnitFormatter, Specifications, Specification, sweetSpotDirSegment,
  Ray2, Reflection, Vec2
} from '../model';

export interface DiagramProps {
  inputs: Inputs;
  outputs: OutputPair;
 }
  
export class Diagram extends React.Component<DiagramProps> {
  render() {
    const { inputs, outputs } = this.props;

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 800;

    function fmtCoorSystem() {
        const margin = 10;
        const roomAspect = inputs.roomDimensions.x / inputs.roomDimensions.y;
        const viewportAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
        const scale = (roomAspect > viewportAspect) ? (
          (CANVAS_WIDTH - margin) / inputs.roomDimensions.x
        ) : (
          (CANVAS_HEIGHT - margin) / inputs.roomDimensions.y
        );
  
        const xOffset = ((CANVAS_WIDTH / scale) - inputs.roomDimensions.x)/2
        const yOffset = ((CANVAS_HEIGHT / scale) - inputs.roomDimensions.y)/2
        
        const xform = `scale(${scale} -${scale}) translate(${xOffset} -${+inputs.roomDimensions.y + yOffset})`;
        return xform;
      }
  
      function renderSweetSpot(sweetSpot: Ray2) {
        const segment = sweetSpotDirSegment(sweetSpot);
        return (
          <g>
            <circle className="sweetspot" r=".25" cx={sweetSpot.position.x} cy={sweetSpot.position.y} />
            <line className="sweetSpotDir" x1={segment.a.x} y1={segment.a.y} x2={segment.b.x} y2={segment.b.y}></line>
          </g>
        )
      }
  
      function renderReflection(o: Output, r: Reflection, sweetSpot: Vec2, isBack: boolean) {
        const className = isBack ? "reflectedBackSignal" : "reflectedSideSignal";
        return (
          <g>
            <line className={className} x1={o.pos.x} y1={o.pos.y} x2={r.reflectPos.x} y2={r.reflectPos.y}></line>
            <line className={className} x1={r.reflectPos.x} y1={r.reflectPos.y} x2={sweetSpot.x} y2={sweetSpot.y}></line>
          </g>
        )
      }
  
      function renderToeIn(o: Output, sweetSpot: Vec2) {
        return o.toeIn ? (
          <g>
            <circle className="toeInDot" r={.2} cx={o.toeIn.pos.x} cy={o.toeIn.pos.y} />
            <line className="toeInDot" x1={o.toeIn.pos.x} y1={o.toeIn.pos.y} x2={o.pos.x} y2={o.pos.y}></line>
          </g>
        ) : ( 
          <g />
        );
      }
  
      function renderDipole(s: Output, sweetSpot: Vec2) {
        const dipoleR = 1;
        const theta = (s.toeIn ? s.toeIn.pos : sweetSpot).minus(s.pos).angleDeg();
        return (
          <g>
            <g transform={`translate(${s.pos.x} ${s.pos.y}) rotate(${theta})`}>
              <circle className="dipole" r={dipoleR} cx={dipoleR} cy={0} />
              <circle className="dipole" r={dipoleR} cx={-dipoleR} cy={0} />
            </g>
            <line className="directSignal" x1={s.pos.x} y1={s.pos.y} x2={sweetSpot.x} y2={sweetSpot.y}></line>
            {renderReflection(s, s.reflections.back, sweetSpot, true)}
            {renderReflection(s, s.reflections.side, sweetSpot, false)}
            {renderToeIn(s, sweetSpot)}
          </g>
        );
      }

    return (
      <svg className="canvas" width={CANVAS_WIDTH + "px"} height={CANVAS_HEIGHT + "px"}>
        <g transform={fmtCoorSystem()}>
          <rect className="room" x="0" y="0" stroke-alignment="inner" width={inputs.roomDimensions.x} height={inputs.roomDimensions.y} />
          {renderSweetSpot(inputs.sweetSpot)}
          { (outputs.right && outputs.left) ? (
          <g>
            <line className="dipoleConn" x1={outputs.right.pos.x} y1={outputs.right.pos.y} x2={outputs.left.pos.x} y2={outputs.left.pos.y}></line>
            {renderDipole(outputs.right, inputs.sweetSpot.position)}
            {renderDipole(outputs.left, inputs.sweetSpot.position)}
          </g>
          ) : (
            <g />
          )
        }
        </g>
        ,  
      </svg>
    )
  }    
}