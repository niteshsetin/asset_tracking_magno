import React, { Component } from "react";
import styled from "styled-components";
import { media } from "../../media/media";
import { withStyles } from "@material-ui/core/styles";

import moment from "moment";
import { motion } from "framer-motion";
import Tooltip from '@material-ui/core/Tooltip';
import Sketch from "react-p5";
import { FilledInput } from "@material-ui/core";


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

const LightTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: "black",
    color: 'white',
    boxShadow: theme.shadows[1],
    fontSize: 12,
    fontFamily: "Montserrat"
  },
}))(Tooltip);


export default class MainCanvas extends Component {
  constructor() {
    super();
    this.state = {
      event : {}
    }
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps);
    this.setState({
      event : nextProps.positions
    })
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


  setup = (p5, canvasParentRef) => {
    p5.createCanvas(500, 500).parent(canvasParentRef);
  }

  draw = p5 => {
    p5.background(2);
    p5.fill(255, 255, 255);
    p5.ellipse(252/10, 526/10, 20 ,20);
  }

  renderRect = ( value, name ) => {
    return (
      <div style={{width:"100%", height:"600px", padding:"10px", display:"flex", justifyContent: "center", flexDirection:"column", alignItems:"center"}}>
        <RoomHeader>
          {name}
        </RoomHeader>
        <RoomBody ref={"roombody"}>
        <LightTooltip title={(moment(value["ts"])).format("YYYY-MM-DD HH:mm:ss")+" : "+ value["entity_1"] } placement="top-start">
              <Beacon
                animate={{
                  x      : this.getRelativePosition({a: value["entity_6"], b : value["entity_7"]})["x"],
                  y      : this.getRelativePosition({a: value["entity_6"], b : value["entity_7"]})["y"],
                  rotate : value["entity_4"]
                }}
                whileTap={{scale:0.9}}
                whileHover={{scale:1.1, backgroundColor: "green"}}
                transition={{duration : 0.4}}
            />
            </LightTooltip> 
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
          height         :"fit-content",
          border         :"none",
          boxShadow      :"0px 4px 4px rgba(0, 0, 0, 0.25)",
          backgroundColor:"rgba(224, 203, 203, 0.32)",
          flexDirection : "column",
          overflowY     : "auto",
          flexWrap      : "nowrap",
          borderRadius   :"5px",
          margin         :"10px",
          display        : "flex",
          justifyContent : "center"
          }}>
            {
              this.renderRect(this.state.event, this.state.event["entity_2"])
            } 
      </div>
    )
  }
};
