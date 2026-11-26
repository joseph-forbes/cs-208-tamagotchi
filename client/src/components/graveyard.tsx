import React, { useEffect, useState, type MouseEventHandler } from "react"
import "../styles/graveyard.css";
import { doorOpenSound, goobertSpookSound } from "./audio";
import { load, rooms } from "../App";
import GoobertElement, {type Corpse, type Goobert} from "../Goobert";
import useGooberts, { getDeceased } from "../GoobertContext";

export default function Graveyard() {
    let { doorRefs } = useGooberts();
    const deceased = getDeceased(); //hmmmm... how do I get the array of dead gooberts here
    const [deceasedPage, setDeceasedPage] = useState(0);

    const formattedDeceased: Corpse[][] = [];
    const dist = Math.max(Math.floor(window.innerWidth / 128) - 2, 1);
    for (let i = 0; i < deceased.length; i += dist) {
        formattedDeceased.push(deceased.slice(i, i + dist));
    }
    const deceasedPages: Corpse[][][] = [];
    for (let i = 0; i < formattedDeceased.length; i += 2) {
        deceasedPages.push(formattedDeceased.slice(i, i + 2));
    }

    return(
        <main className="graveyard">
            {/* EXIT TO HUB */}
                <div className="exit-controls" ref={doorRefs.gameRoomHub}>
                    <button 
                        className="graveyard-exit-button " 
                        // Play the door click sound before returning to the Hub.
                        onClick={() => {
                            doorOpenSound.play();
                            load(rooms.hub);
                        }}>

                        <span>BACK TO HUB</span>
                    </button>
                </div>

                <section className="graveyard-memorials" aria-label="Goobert memorials">
                <h1>Goobert Graveyard</h1>

                {deceased.length === 0 ? (
                    <div className="graveyard-empty">
                        <div className="graveyard-empty-stones" aria-hidden="true">
                            <img className="graveyard-stone-display" src="../images/graveyard/headstone0.webp"/>
                            <img className="graveyard-stone-display" src="../images/graveyard/headstone1.webp"/>
                            <img className="graveyard-stone-display" src="../images/graveyard/headstone2.webp"/>
                        </div>
                        <p>No Gooberts have been laid to rest in this session.</p>
                    </div>
                ) : (
                    <>
                        <div className="cemetary-container">
                            {deceasedPages[deceasedPage]!.map((row, j) => {
                                return <div className="cemetary-row" key={j}>
                                    {row.map((goobert, i) => <Headstone goobert={goobert} stoneType={i} key={i} />)}
                                </div>
                            })}
                        </div>
                        {deceasedPage  > 0 && 
                            <img className="prevGraveArrow" src="/images/graveyard/graveyardArrow.webp" 
                                onClick={() => setDeceasedPage(deceasedPage - 1)} 
                                alt="Go back towards the entrance"
                            />
                        } 
                        {deceasedPage < deceasedPages.length - 1 && 
                            <img className="nextGraveArrow" src="/images/graveyard/graveyardArrow.webp" 
                                onClick={() => setDeceasedPage(deceasedPage + 1)}
                                alt="Continue down the graveyard path"
                            />
                        } 
                    </>
                    // <div className="graveyard-grid">
                    //     {deadGooberts.map((goobert, index) => (
                    //         <article className="graveyard-memorial" key={`${goobert.id}-${index}`}>
                    //             <GoobertMemorial goobert={goobert} />
                    //             <div className="graveyard-stone">
                    //                 <span className="graveyard-rip">R.I.P.</span>
                    //                 <span className="graveyard-name">{goobert.name}</span>
                    //             </div>
                    //         </article>
                    //     ))}
                    // </div>
                )}
            </section>
        </main>
    );
}
interface Props {
        goobert: Corpse;
        stoneType: number;
    }
    const Headstone = ({goobert, stoneType}:Props) => {
        const deadGoobert = goobert;
        const [isVisible, setVisible] = useState(false);

        useEffect(() => {
            const timeOut = setTimeout(() => {setVisible(false)}, 2000);

            return () => clearInterval(timeOut);
        }, [isVisible]);

        return(
        <div className="Headstone" 
        onPointerDown={() => {
            setVisible(!isVisible);
            goobertSpookSound.play();
        }}>
            <img src={`../images/graveyard/headstone${stoneType%3}.webp` } />
            <div className="">
                {isVisible && (
                    <div className="">
                        {/* <div>R.I.P. </div> */}
                        <GoobertElement
                                        {...deadGoobert}
                                        isUi={true}
                                        room={rooms.graveyard}
                                        isMutant={false}
                                        
                                        fullness={0}
                                        entertainment={0}
                                        cleanliness={0}
                                        awakeness={0}

                                        sleeping={0}
                                        isDragged={false}
                                        waitTime={0}
                                        target={null}

                                        x={35}
                                        y={-20}
                                        className="goobert-container icon etching"
                                    />
                    </div>
                )}
            </div>
            <div className="engraving">{goobert.name}</div>
        </div>
    )     
}