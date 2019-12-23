import React, { Component } from "react";
import styled from "styled-components";
import { media } from "../../media/media";




export default class MainCanvas extends Component {
  constructor() {
    super();
  }



  render() {
    return (
      <div style={{
        width          :"100%",
        height         :"100%",
        border         :"none",
        boxShadow      :"0px 4px 4px rgba(0, 0, 0, 0.25)",
        backgroundColor:"rgba(224, 203, 203, 0.32)",
        borderRadius   :"10px"}}>
      </div>
    )
  }
};
