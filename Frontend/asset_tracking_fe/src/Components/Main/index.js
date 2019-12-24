import React, { Component } from "react";
import styled from "styled-components";
import { media } from "../../media/media";
import "../../Fonts/Mont.css";
import { motion } from "framer-motion";

import FilterBar     from  "../FilterBar";
import SearchTable    from "../SearchTable";
import MainCanvas     from "../MainCanvas";
import ToolBar        from "../ToolBar";
import moment from "moment";
import { Responsive, WidthProvider } from "react-grid-layout";
import Two from "two";
const ResponsiveReactGridLayout = WidthProvider(Responsive);



const HeaderContainer = styled.div`
  width : 100%;
  height : auto;
  display: flex;
  justify-content : start;
  align-items     : center;
  flex-direction  : column;
  ${media.phone`
    justify-content : center;
  `};
`;

const Header = styled.div`
  width : 100%;
  height: fit-content%;
  display:flex;
  justify-content  : start;
  align-items      : center;
  font-family  : Rajdhani;
  font-size    : 36px;
  font-weight  : 400;
  color        : white;
  margin-left  : 2%;
  ${media.phone`
    width : auto;
    margin-left: 0%;
  `};
`;

const FilterContainer = styled.div`
  width  : 98%;
  height : 100%;
  display: flex;
  justify-content : center;
  align-items: center;
  
`;

const FilterBox = styled.div`
  display : flex;
  width   : 100%;
  height  : 70%;
  background-color: rgba(224, 203, 203, 0.32);
  border-radius : 5px;
`;
const BodyContainer = styled.div`
  width   : 100%;
  height  : 70%;
  display : flex;
  flex-direction: column;
  justify-content : center;
  align-items: center;
  ${media.phone`
    flex-direction : column;
  `};
`;


const BodyItemLeft = styled.div`
  width   : 15%;
  height  : 100%;
  display : flex;
  margin-right : auto;
  justify-content: center;
  align-items : center;

  ${media.phone`
    width : 100%;
  `};
`;

const BodyItemRight = styled.div`
  width          : 99%;
  height         : 100%;
  display        : flex;
  justify-content: center;
  align-items    : center;
  flex-direction : column;

  ${media.phone`
    width : 100%;
    flex-direction : column;
  `};
`;

const BodyItemRightTopContainer = styled.div`
  display : flex;
  width : 100%;
  height : auto;
  flex-direction : row
  padding: 1%;
  ${media.phone`
    width : 100%;
    flex-direction : column;
  `};
`;

const BodyItemRightBottomContainer = styled.div`
  display : flex;
  width : 100%;
  height : 100%;
  padding: 1%;
  display: flex;
  flex-direction: column;
  justify-content : center;
  align-items: center;
`;

export default class Main extends Component {
  constructor() {
    super();
    this.state = {
      data    : [],
      beacons : [],
      centrals: [],
      events  : []
    };
  }

  componentDidMount() {
    let incoming = fetch("http://192.168.0.73:8000/home")
      .then(data => data.json())
      .then(data => {
        let buffer_1 = [];
        let buffer_2 = [];

        this.setState({
          centrals: data["centrals"],
          beacons: data["beacons"]
        },() => {
          console.log(( this.state ));
        });
      });
      
    }


  handlePropChange = ( data ) => {
    console.log(data);
  }


  specialComponentRSSISignalBar = () => {
     return [1].map((value) => (<div style={{ display:"flex", width:"10px", height: "3px", border:"none", borderRadius:"10px", backgroundColor:"#FEEF69", margin:"2px", alignSelf:"flex-end"}}/>))
  }

  specialComponentStatusBar = () => {
    return [1].map((value) => (<div style={{display:"flex", width: "10px", height:"20px", border:"none", backgroundColor:"#95be95", borderRadius:"2px", margin:"2px"}}></div>) )
  }

  packDataSelectBoxes = ( data ) => {
    /*
      A function written for translating incoming data
      from one frame to another frame.

      param1 : incoming data.
      return : JSON object dataframe.
    */

    function returnToken( data, token ) {
      let buffer = [];
      for(let i = 0; i < data.length; i++) {
        buffer.push( data[i][token] );
      };
      return buffer;
    };

    let buf = {
      names : returnToken( data, "name" ),
      rooms : returnToken( data, "room" ),
      id    : returnToken( data, "id" )
    };
    return buf;
  }



  packDataEventListBox = (data) => {
    
    let buffer = []
    for(let i = 0 ; i < data.length; i++) {
      let buf = {
        entity_1 : data[i]["beacon_id"],
        entity_2 : data[i]["room_id"],
        entity_3 : moment(data[i]["ts"]).format('MMM Do YYYY, h:mm:ss a')
      };
      
      buffer.push(buf);
    };
    
    return buffer;
  }

  packDataListBox = ( data ) => {
    let buffer = []
    for(let i = 0 ; i < data.length; i++) {
      let buf = {
        entity_1 : data[i]["name"],
        entity_2 : data[i]["id"],
        entity_3 : data[i]["room"]
      }; 
      buffer.push(buf);
    };
    
    return buffer;
  }

  handleToAddData = (data) => {
     
    if (data["type"] === "beacons") {
      let buffer = this.state.beacons;
      buffer.push(data);
      this.setState({
        beacons : buffer
      }, () => {console.log(this.state.beacons)});
    }
    else if (data["type"] === "central") {
      let buffer = this.state.centrals;
      buffer.push(data);
      this.setState({
        central: buffer
      }, () => {console.log(this.state.central)})
    }
  }

  handleEventFetching = () => {
    this.timeout = setTimeout(() => {
      fetch("http://192.168.0.73:8000/home/fetch_events")
      .then( data => data.json() )
      .then( data => {
        if(this.state.events.some(item => data.id === item.id)) return;
        console.log(data);
        let events = this.state.events;
        events.push( data );
        this.setState({
          events: events
        }, () =>{
          console.log(this.state.events);
        });
      })
     }, 1000);
  }


  render() {
      document.body.style = "background:#562533"
      this.handleEventFetching();
      return (
        <div style={{width : "100%", height: "fit-content", border:"none"}}>
          <HeaderContainer>
            <Header>
              Asset Tracking
            </Header>
            <FilterContainer>
              <FilterBar options={this.packDataSelectBoxes(this.state.data)} handlePropChange={this.handlePropChange}>
              </FilterBar>
            </FilterContainer>
          </HeaderContainer>
          <BodyContainer>
            <BodyItemRightTopContainer>
              <SearchTable rowData={this.packDataListBox(this.state.beacons)}
                            table_type={"Beacon list"}
                            columns={["Name", "ID"]}
                            specialComponent={this.specialComponentStatusBar()}/>
              <SearchTable rowData={this.packDataListBox(this.state.centrals)}
                           table_type={"Central list"}
                           columns={["Name", "ID", "Room"]}
                           specialComponent={this.specialComponentStatusBar()}/>

              <ToolBar toAddData={this.handleToAddData}/>
            </BodyItemRightTopContainer>
            <BodyItemRightBottomContainer>
            <SearchTable rowData={this.packDataEventListBox(this.state.events)}
                            table_type={"Event List"}
                            columns={["Beacon ID", "Room", "Time"]}
                            specialComponent={this.specialComponentStatusBar()}/>
              <MainCanvas/>
            </BodyItemRightBottomContainer>
          </BodyContainer>
        </div>
      )
    }
};
