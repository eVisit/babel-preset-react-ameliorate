import React from 'react';

class MyTestComponent extends React.Component {
  render() {
    var opts = { test: true, derp: 'something', func: () => {} };

    return (
      <div hello={true} {...opts}>
        <React.Fragment>
          <span stuff>Hello world!</span>
          <derp/>
        </React.Fragment>
      </div>
    );
  }
}
