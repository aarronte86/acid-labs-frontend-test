import React from 'react';

import { BounceLoader } from 'react-spinners';

const overlayStyle = {
  position: 'fixed',
  justifyContent: 'center',
  alignItems: 'center',
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
  zIndex: 1000,
  display: 'flex',
  backgroundColor: 'rgba(0, 0, 0, 0.2)'
};

export default class LoadingOverlay extends React.Component {
  render() {
    if (this.props.active) {
      return (
        <div className="loading-overlay" style={overlayStyle}>
          <BounceLoader sizeUnit={'px'} size={150} color={'#123abc'} />
        </div>
      );
    }

    return <div />;
  }
}
