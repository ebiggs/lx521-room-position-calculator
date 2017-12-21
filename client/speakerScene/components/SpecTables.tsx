import * as React from 'react';
import { OutputPair, UnitFormatter, Specifications, Specification } from '../model';

export interface SpecTablesProps {
  specs: Specifications;
  outputs: OutputPair;
  fmt: UnitFormatter;
  }
  
export class SpecTables extends React.Component<SpecTablesProps> {

  checkListItem(spec: Specification, formatter: (number) => string = x=>Math.round(x).toString()) {
    return <span className={spec.isToSpec ? 'testPassed' : 'testFailed'}>{formatter(spec.value)}</span>
  }
  
  render() {
    const { outputs, specs, fmt } = this.props;
    const checkListItem = this.checkListItem;
  
    return (
      <div>
      <div className="derived">
        <table>
          <tbody>
            <tr>
              <th/>
              <th>Specification</th>
              <th>Left Dipole</th><th>Right Dipole</th>
              <th></th>
            </tr>
            <tr>
              <th>Position</th>
              <td>N/A</td>
              <td><span className="testPassed">{outputs.left ? outputs.left.pos.toString(fmt.formatDistance) : 'N/A'}</span></td>
              <td><span className="testPassed">{outputs.right ? outputs.right.pos.toString(fmt.formatDistance) : 'N/A'}</span></td>
            </tr>
            <tr>
              <th>Toe-in Angle</th>
              <td>N/A</td>
              <td><span className="testPassed">{outputs.left && outputs.left.toeIn ? outputs.left.toeIn.deg : "none"}&deg;</span></td>
              <td><span className="testPassed">{outputs.right && outputs.right.toeIn ? outputs.right.toeIn.deg : "none"}&deg;</span></td>
              <td className="description">(The angle to rotate the top baffle inward from the direct signal.)</td>
            </tr>
            <tr>
              <th>Toe-in Distance</th>
              <td>N/A</td>
              <td>{checkListItem(specs.left.toeInDistance, fmt.formatMetric)}</td>
              <td>{checkListItem(specs.right.toeInDistance, fmt.formatMetric)}</td>
              <td className="description">(Distance directly in front of the sweet spot which locates a position to point the top baffle.)</td>
            </tr>
            <tr>
              <th>Back Wall Offset</th>
              <td>&gt; {fmt.formatDistance(4)}</td>
              <td>{checkListItem(specs.left.backWallOffset, fmt.formatDistance)}</td>
              <td>{checkListItem(specs.right.backWallOffset, fmt.formatDistance)}</td>
            </tr>
            <tr>
              <th>Side Wall Offset</th>
              <td>&gt; {fmt.formatDistance(2)}</td>
              <td>{checkListItem(specs.left.sideWallOffset, fmt.formatDistance)}</td>
              <td>{checkListItem(specs.right.sideWallOffset, fmt.formatDistance)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="checklist">
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Specification</th>
              <th>Your Layout</th>
            </tr>
            <tr>
              <th>Room Height</th>
              <td>&gt; {fmt.formatDistance(8)}</td>
              <td>Not Measured</td>
            </tr>
            <tr>
              <th>Room Area</th>
              <td>&gt; {fmt.unitOfMeasure == 'ft' ? '240 ft' : '22.3 m'}<sup>2</sup></td>
              <td>{checkListItem(specs.area, fmt.formatDistanceSquared)}</td>
            </tr>
            <tr>
              <th>Speaker Separation</th>
              <td>&gt; {fmt.formatDistance(8)}</td>
              <td>{checkListItem(specs.speakerSeparation, fmt.formatDistance)}</td>
            </tr>
            <tr>
              <th>Listening Distance</th>
              <td> &gt; {fmt.formatDistance(8)}, &lt; {fmt.formatDistance(18)}</td>
              <td>{checkListItem(specs.listeningDistance, fmt.formatDistance)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    );
  }
}