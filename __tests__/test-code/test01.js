import React from 'react';

class MyTestComponent extends React.Component {
  render() {
    var opts = { test: true, derp: 'something', func: () => {} };

    return (
      <div hello={true} {...opts}>
        <span stuff>Hello world!</span>
      </div>
    );
  }
}
