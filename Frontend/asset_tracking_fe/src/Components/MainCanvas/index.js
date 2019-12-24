import React, { Component } from "react";
import styled from "styled-components";
import { media } from "../../media/media";

import Konva from "react-dom";
import {Stage, Layer, Rect, Circle} from "react-konva";




export default class MainCanvas extends Component {
  constructor() {
    super();
  }



  renderRect = () => {
    return (  
         <div style={{width:"80%", height:"80%", backgroundColor:"#503939", display:"flex", borderRadius:"5px", justifyContent:"center", alignItems:"flex-start"}}>
           <div
             style={{
               display:"flex",
               width:"0px",
               height:"0px",
               borderStyle:"solid",
               borderWidth:"90px 100px 0 150px",
               borderColor:"#007bff transparent transparent transparent"
             }}>

            </div>
         </div>
    )
  }


  render() {
   
    return (
      <div 
      id="drawing-canvas"
      style={{  
        width          :"100%",
        height         :"1000px",
        border         :"none",
        boxShadow      :"0px 4px 4px rgba(0, 0, 0, 0.25)",
        backgroundColor:"rgba(224, 203, 203, 0.32)",
        borderRadius   :"10px",
        margin         :"10px",
        display        : "flex",
        justifyContent : "center",
        alignItems     : "center"}}>
          {
            this.renderRect()
          }
      </div>
    )
  }
};
