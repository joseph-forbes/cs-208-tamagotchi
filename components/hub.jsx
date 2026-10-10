"use strict"

class TestGoobert extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="goobert-container">
                <img id="goobert-legs" src="assets/goobert-parts/Transparent-BG.png"/>
                <img id="goobert-body" src="assets/goobert-parts/Transparent-BG.png"/>
                <img id="goobert-mouth" src="assets/goobert-parts/Transparent-BG.png"/>
                <img id="goobert-eyes" src="assets/goobert-parts/Transparent-BG.png"/>
            </div>
        );
    }
    setBodyType(type){
        this.bodyType = type;
        this.setState({});

        const element = document.getElementById(this.bodyId);
        element.style.backgroundPositionY = (this.bodyType*(-64)) + 'px';
        console.log(this.name + "'s body type set.");
    }

    setBodyColor(){
        const element = document.getElementById(this.bodyId);
        element.style.backgroundPositionX = (this.bodyColor*(-64)) + 'px';
        console.log(this.name + "'s body color set.");
    }

    setLegsType(){
        const element = document.getElementById(this.legId);
        element.style.backgroundPositionY = (this.legType*(-64)) + 'px';
        console.log(this.name + "'s leg type set.");
    }

    setLegsColor(){
        const element = document.getElementById(this.legId);
        element.style.backgroundPositionX = (this.legColor*(-64)) + 'px';
        console.log(this.name + "'s leg color set.");
    }

    setEyes(){
        const element = document.getElementById(this.eyeId);
        element.style.backgroundPositionY = (this.eyeType*(-64)) + 'px';
        console.log(this.name + "'s eye type set.");
    }
    setEyeExpression(){
        const element = document.getElementById(this.eyeId);
        element.style.backgroundPositionX = (this.eyeExpression*(-64)) + 'px';
        console.log(this.name + "'s eye expression set.");
    }

    setMouth(){
        const element = document.getElementById(this.mouthId);
        element.style.backgroundPositionY = (this.mouthType*(-64)) + 'px';
        console.log(this.name + "'s mouth type set.");
    }
    setMouthExpression(){
        const element = document.getElementById(this.mouthId);
        element.style.backgroundPositionX = (this.mouthExpression*(-64)) + 'px';
        console.log(this.name + "'s mouth expression set.");
        
        this.setState({});
    }
}
class Hub extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        return (
            <main id="main" className="hub">
                <div className="tree-container">

                    <img src="hub-images/gooberts_tree.png" 
                        alt="GOOBERTS HUB" 
                        className="pixelated-tree" 
                        id="goobert-tree" />

                    {/* <!--CLickable Areas--> */}
                    <div id="tree-body-area" onClick={changeBodyType}></div>
                    <div id="tree-legs-area" onClick={changeLegType}></div>
                    <div id="tree-mouth-area" onClick={changeMouth}></div>
                    <div id="tree-eyes-area" onClick={changeEyes}></div>
                    <div id="tree-body-color" onClick={changeBodyColor}></div>
                    <div id="tree-legs-color" onClick={changeLegColor}></div>


                    {/* Goobert Container */}
                    <TestGoobert />
                </div>

                <div className="sleep-door-container">
                    <img src="index-images/DreamDoor.webp" alt="BEDROOM" id="sleep-door" onClick={() => {load("bedroom")}} />
                </div>

                <div className="game-door-container">
                    <img src="hub-images/game-door.png" alt="GAME" id="game-door" onClick={() => {load("gameRoom")}} />
                </div>

                <div className="shop-door-container">
                    <img src="hub-images/shop-door.png" alt="SHOP" id="shop-door" onClick={() => {load("shop")}} />
                </div>

                <div className="leave-door-container">
                    <img src="hub-images/leave-door.png" alt="LEAVE" id="leave-door" onClick={() => {window.location.href = "index.html";}}/>
                </div>
                <SettingsPanel 
                    buttonClassName="game-room-settings-button"
                    panelClassName="game-room-settings-panel"
                />
            </main>
        );
    }
}

/* Basic asset index selectors. */
let hubAssets = {
    bodyType: 0,
    bodyColor: 0,
    legType: 0,
    legColor: 0,
    eyeType: 0,
    eyeExpression: 0,
    mouthType: 0,
    mouthExpression: 0
}

/* Controls for the test goobert */
const randomizeFeatures = () => {
    hubAssets.bodyType = Math.floor(Math.random() * 7);
    hubAssets.bodyColor = Math.floor(Math.random() * 7);
    hubAssets.legType = Math.floor(Math.random() * 7);
    hubAssets.legColor = Math.floor(Math.random() * 7);
    hubAssets.eyeType = Math.floor(Math.random() * 10);
    hubAssets.mouthType = Math.floor(Math.random() * 11);
    setBodyType(hubAssets.bodyType);
    setBodyColor(hubAssets.bodyColor);
    setLegsType(hubAssets.legType);
    setLegsColor(hubAssets.legColor);
    setEyes(hubAssets.eyeType);
    setMouth(hubAssets.mouthType);
    console.log("Features randomized.")
}

const changeBodyType = function() {
    hubAssets.bodyType = (hubAssets.bodyType == 6) ? 0 : hubAssets.bodyType + 1;
    setBodyType(hubAssets.bodyType);
}

const changeBodyColor = function() {
    hubAssets.bodyColor = (hubAssets.bodyColor == 6) ? 0 : hubAssets.bodyColor + 1;
    setBodyColor(hubAssets.bodyColor);
}

const changeLegType = function() {
    hubAssets.legType = (hubAssets.legType == 6) ? 0 : hubAssets.legType + 1;
    setLegsType(hubAssets.legType);
}

const changeLegColor = function() {
    hubAssets.legColor = (hubAssets.legColor == 6) ? 0 : hubAssets.legColor + 1;
    setLegsColor(hubAssets.legColor);
}

const changeEyes = function() {
    hubAssets.eyeType = (hubAssets.eyeType == 9) ? 0 : hubAssets.eyeType + 1;
    setEyes(hubAssets.eyeType);
}

const changeEyesExpression = () => {
    hubAssets.eyeExpression = (hubAssets.eyeExpression == 6) ? 0 : hubAssets.eyeExpression + 1;
    setEyeExpression(hubAssets.eyeExpression);
}

const changeMouth = function() {
    hubAssets.mouthType = (hubAssets.mouthType == 10) ? 0 : hubAssets.mouthType + 1;
    setMouth(hubAssets.mouthType);
}

const changeMouthExpression = () => {
    hubAssets.mouthExpression = (hubAssets.mouthExpression == 5) ? 0 : hubAssets.mouthExpression + 1;
    setMouthExpression(hubAssets.mouthExpression);
}

/* The following functions set the features of the test goobert. */
const setBodyType = (assetIndex) => {
    const element = document.getElementById('goobert-body');
    element.style.backgroundPositionY = (hubAssets.bodyType*(-64)) + 'px';
    console.log("Body type set.")
}

const setBodyColor = (assetIndex) => {
    const element = document.getElementById('goobert-body');
    element.style.backgroundPositionX = (assetIndex*(-64)) + 'px';
    console.log("Body color set.")
}

const setLegsType = (assetIndex) => {
    const element = document.getElementById('goobert-legs');
    element.style.backgroundPositionY = (assetIndex*(-64)) + 'px';
    console.log("Leg type set.");
}

const setLegsColor = (assetIndex) => {
    const element = document.getElementById('goobert-legs');
    element.style.backgroundPositionX = (assetIndex*(-64)) + 'px';
    console.log("Leg color set.");
}

const setEyes = (assetIndex) => {
    const element = document.getElementById('goobert-eyes');
    element.style.backgroundPositionY = (assetIndex*(-64)) + 'px';
    console.log("Eye type set.");
}
const setEyeExpression = (assetIndex) => {
    const element = document.getElementById('goobert-eyes');
    element.style.backgroundPositionX = (assetIndex*(-64)) + 'px';
    console.log("Eye expression set.")
}

const setMouth = (assetIndex) => {
    const element = document.getElementById('goobert-mouth');
    element.style.backgroundPositionY = (assetIndex*(-64)) + 'px';
    console.log("Mouth type set.");
}
const setMouthExpression = (assetIndex) => {
    const element = document.getElementById('goobert-mouth');
    element.style.backgroundPositionX = (assetIndex*(-64)) + 'px';
    console.log("Mouth expression set.")
}