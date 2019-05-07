import React from 'react';
import classnames from 'classnames';

export class FoldablePanel extends React.Component {
  componentDidUpdate ({ visible: prevVisible }) {
    const { visible, resizingMap } = this.props;
    if (prevVisible !== visible) {
      resizingMap();
    }
  }

  render () {
    const { visible, children, className } = this.props;
    return (
      <div className={classnames({
        [className]: true,
        [`${className}--visible`]: visible,
      })}
      >
        {visible && children}
      </div>
    );
  }
}


export default FoldablePanel;
