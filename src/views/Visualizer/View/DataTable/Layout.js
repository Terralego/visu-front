import React from 'react';
import classnames from 'classnames';

export class Layout extends React.Component {
  componentDidUpdate ({ visible: prevVisible }) {
    const { visible, resizingMap } = this.props;
    if (prevVisible !== visible) {
      resizingMap();
    }
  }

  render () {
    const { visible, children } = this.props;
    return (
      <div className={classnames({
        'data-table': true,
        'data-table--visible': visible,
      })}
      >
        {visible && children}
      </div>
    );
  }
}


export default Layout;
