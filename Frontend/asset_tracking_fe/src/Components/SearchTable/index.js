import React, { Component } from "react";
import styled from "styled-components";


import { motion } from "framer-motion";



const RowsContainer = styled.div`
  display:         block;
  border:         none;
  width:          95%;
  height:         100%;
  margin:         10px;
  overflow:       auto;
  overflowX:      hidden;
  justifyContent: center;
  alignItems:     center;
`;

const RowStyle = styled(motion.div)`
  display:          flex;
  width:            95%;
  height:           45px;
  border:           none;
  background-color: rgba(0.1, 0.1, 0.1, 0.1);
  border-radius:    3px;
  margin:           10px;
  flex-direction:   columns;
  justifyContent:   center;
  alignItems:       center;
  fontFamily:       Rajdhani;
  user-select :     none;
  color:            white;
`;


const SearchTableContainer  = styled.div`
  height : 260px;
  width  : 100%;
  border  : none;
  border-radius : 3px;
  background-color : rgba(224, 203, 203, 0.32);
  box-shadow : 0px 4px 4px rgba(0, 0, 0, 0.25);
  display : flex;
  margin-right : 5px;
`;

const SearchTableBox = styled.div`
  display : flex;
  flex-direction : column;
  justify-content : center;
  align-items : center;
  width : 100%;
  user-select: none;
`;


const SearchTableHeaderContainer = styled.div`
  display : flex;
  flex-direction : row;
  justify-content: center;
  align-items: center;
  margin-top : 10px;
  width : 100%;
  user-select: none;
`;





export default class SearchTable extends Component {
  constructor(){
    super();
    this.state = {

  }
}


  renderSpecialComponent = ( signal ) => {
    let rows = []
    for(let i = 0; i < signal; i++) {
      rows.push(this.props.specialComponent);
    }
    return rows;
  }


  handleRowClick = (value) => {
    console.log(value);
    this.props.handleRowClick(value)
  }

  returnRow = (data) => {
      const rows = data.map( (value, index) =>
          <RowStyle 
            whileHover={{ backgroundColor:"rgba(255, 255, 255, 0.1)" }}
            whileTap={{scale:0.99}}
            transition={{duration:0.2}}
            key={index} onClick={() => { this.handleRowClick(value)}} >
            <div style={{display:"flex", justifyContent:"center", alignItems:"center", margin: "10px", width:"100%", fontWeight:"200"}}>
              {value.entity_1}
            </div>
            <div style={{display:"flex", justifyContent:"center", alignItems:"center", margin: "10px", width:"100%", fontWeight:"200"}}>
              {value.entity_2}
            </div>
            {
              value.entity_3 ? 
              <div style={{display:"flex",    justifyContent:"center",  margin: "10px", width:"100%", fontWeight:"200", alignItems:"center"}}>
              <div style={{display:"block", flexDirection:"row",   alignContent:"flex-end" }}>
                {
                  value.entity_3
                }
              </div>
            </div>
            :
            <div>

            </div>
            }
          </RowStyle>
      )
      return rows
  }

  render() {
    return (
      <SearchTableContainer>
            <SearchTableBox>
              <div style={{ userSelect:"none", fontSize:"18px", display:"flex", justifyContent:"start", alignItems:"start", color:"white", fontFamily:"Rajdhani", marginRight:"auto", marginLeft:"10px", padding:"10px"}}>{ this.props.table_type }</div>
              <SearchTableHeaderContainer>
                {
                  this.props.columns.map((value, index) => (
                    <div style={{display:"flex", justifyContent:"center", alignItems:"center", fontSize:"15px", color:"white", fontFamily:"Rajdhani", fontWeight:"300", width:"100%" }}>
                    {value}
                  </div>
                  ))
                }
              </SearchTableHeaderContainer>
              <div style={{display:"block",  border:"none",  width:"95%", height:"100%", margin:"10px", overflow:"auto", overflowX:"hidden", justifyContent:"center"}}>
                {
                  this.returnRow(this.props.rowData)
                }
              </div>
          </SearchTableBox>
     </SearchTableContainer>
    )
  }
}
