"use strict";

let rooms = {
	hub: <Hub />,
	gameRoom: <GameRoom />,
	shop: <Shop />,
	bedroom: <Bedroom />,

	snakeGame: <SnakeGame />,
	flappyGoobert: <FlappyGoobert />

}
class TopElement extends React.Component {
	constructor(props) {
		super(props);
		this.gooberts = [];
		this.room = rooms.hub;
	}
	render() {
		return(
			<>
				<SharedAudioManager />

				{this.room}

				{this.gooberts.map((goobert, i) => (
					<div key={i}>
						{goobert}
					</div>
				))}
			</>
		);
	}
	load(component) {
		this.room = rooms[component];
		this.setState({room: rooms[component]});
	}

}
let topElement;
const root = ReactDOM.createRoot(
    document.getElementById("content")
);
function init() {
    topElement = React.createRef();
    root.render(<TopElement ref={topElement} />);
}

init();

function load(component) {
    topElement.current.load(component);
}