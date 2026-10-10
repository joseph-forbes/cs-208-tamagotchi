"use strict";

let rooms = {
  hub: /*#__PURE__*/React.createElement(Hub, null),
  gameRoom: /*#__PURE__*/React.createElement(GameRoom, null),
  shop: /*#__PURE__*/React.createElement(Shop, null),
  bedroom: /*#__PURE__*/React.createElement(Bedroom, null),
  snakeGame: /*#__PURE__*/React.createElement(SnakeGame, null),
  flappyGoobert: /*#__PURE__*/React.createElement(FlappyGoobert, null)
};
class TopElement extends React.Component {
  constructor(props) {
    super(props);
    this.gooberts = [];
    this.room = rooms.hub;
  }
  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SharedAudioManager, null), this.room, this.gooberts.map((goobert, i) => /*#__PURE__*/React.createElement("div", {
      key: i
    }, goobert)));
  }
  load(component) {
    this.room = rooms[component];
    this.setState({
      room: rooms[component]
    });
  }
}
let topElement;
const root = ReactDOM.createRoot(document.getElementById("content"));
function init() {
  topElement = React.createRef();
  root.render(/*#__PURE__*/React.createElement(TopElement, {
    ref: topElement
  }));
}
init();
function load(component) {
  topElement.current.load(component);
}
