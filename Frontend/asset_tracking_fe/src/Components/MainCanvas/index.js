import React, { Component } from "react";
import styled from "styled-components";
import { media } from "../../media/media";

import Konva from "react-dom";
import {Stage, Layer, Rect, Circle} from "react-konva";
import { motion } from "framer-motion";




const RoomHeader = styled.div`
  width   : 100%;
  height  : 10%;
  display : flex;
  color   : white;
  font-family: Rajdhani;
  font-size: 22px;
  font-weight: Medium;
  margin: 5px;
`;   

const RoomBody = styled.div`
  width : 80%;
  height: 80%;
  background-color:#c39797;
  border-radius: 3px;
  display: flex;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const RoomCells = styled.div`
  width : 33%;
  height: 100%;
  border-radius: 3px;
  display: flex;
  justify-content : center;
  align-items: center;
`;

const RoomRows = styled.div`
  width: 100%;
  height: 33%;
  display: flex;
  flexDirection: row;
`;

const Beacon = styled(motion.div)`
  width : 30px;
  height: 30px;
  border-radius: 3px;
  background-color: red;
  opacity: 0.5;
  border : none;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const x = [100, 300, 1300];
const y = [100, 300, 400]
export default class MainCanvas extends Component {
  constructor() {
    super();
  }

  

  getRelativePosition = ( dist ) => {
    let innerWidth = 480;
    let totalDist  = 10;

    if (dist.a > dist.b && dist.a <= (0.3 * totalDist)) {
      // top left.
      return ({
        x : 0, 
        y : 0
      })
    }
    else if (dist.a < dist.b && dist.b <= (0.3 * totalDist)) {
      // top right
      return ({
        x : 1300,
        y : 0
      })
    }
    else if (dist.a === dist.b && dist.b <= (0.3 * totalDist)) {
      // top middle
      return({
        x : 700,
        y : 0
      })
    }
    else if (dist.a > dist.b && dist.a > (0.6 * totalDist) ) {
      // Corner left.
      return {
        x : 1300,
        y : 350
      }
    }
    else if (dist.a < dist.b && dist.b > (0.6 * totalDist) ) {
      //bottom right
      return({
        x : 0,
        y : 350
      })
    }
    else if ( dist.a === dist.b && (dist.a >= (0.6 * totalDist))) {
      // bottom middle
      return({
        x : 700,
        y : 350
      })
    }
    else if ( dist.a === dist.b && (dist.a >= (0.3 * totalDist) && dist.a < (0.6 * totalDist)) ) {
      // middle middle
      return ({
        x : 700, 
        y : 200
      })
    }
    else if ( dist.a < dist.b  && (dist.a >= (0.3 * totalDist) && dist.a < (0.6 * totalDist))) {
      //middle left
      return({
        x : 0, 
        y : 200
      })
    }
    else if (dist.a > dist.b && ( dist.b >= (0.3 * totalDist) && dist.b < (0.6 * totalDist) )) 
    {
      return({
        x : 1300,
        y : 200
      })
    }
    else {
      return({
        x : 700, 
        y : 200
      })
    }
  }

  renderRect = () => {
    return (
      <div style={{width:"100%", height:"100%", padding:"10px", display:"flex", justifyContent: "center", flexDirection:"column", alignItems:"center"}}>
        <RoomHeader>
          {this.props.room_name}
        </RoomHeader>
        <RoomBody ref={"roombody"}>
          <Beacon
            animate={{
              x: this.getRelativePosition( this.props.position )["x"],
              y: this.getRelativePosition( this.props.position )["y"],
              rotate : this.props.orientation
            }}
            whileTap={{scale:0.9}}
            whileHover={{scale:1.1, backgroundColor: "green"}}
            transition={{duration : 0.4}}
          />
        </RoomBody>
      </div>  
    )
  }


  render() {
    return (
      <div 
        id="drawing-canvas"
        style={{  
          width          :"100%",
          height         :"600px",
          border         :"none",
          boxShadow      :"0px 4px 4px rgba(0, 0, 0, 0.25)",
          backgroundColor:"rgba(224, 203, 203, 0.32)",
          flexDirection : "column",
          borderRadius   :"5px",
          margin         :"10px",
          display        : "flex",
          justifyContent : "center"
          }}>
            {
              this.renderRect()
            }
      </div>
    )
  }
};
