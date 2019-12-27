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
      beacons : [{}],
      centrals: [{}],
      events  : [],
      eventList : [],
      event : []
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
          beacons:  data["beacons"],
          listBoxData : ({"centrals" : data["centrals"], "beacons" : data["beacons"]})
        },() => {
          console.log(( this.state ));
        });
      });
      
    }


  handlePropChange = ( data ) => {
    console.log(data);

    if(data.length === 0) {
      this.setState({
        eventList : []
      })
      return;
    }

    let events = [];
    for(let i = 0; i < data.length; i++) { 
      if (data[i]["type"] === "beacons") {
        let doc = {
          "time_delta" : "6h",
          "beacon_id"  : parseInt(data[i]["id"])
        }
        fetch('http://192.168.0.73:8000/home/fetch_beacon_info', {
          method: 'post',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(doc)
        })
        .then( data => data.json() )
        .then( data => {
          if (data["ack"]) {
            let list = this.state.eventList;
            list.push(data.data.data);
            this.setState({
              eventList : list
            }, () =>{
              console.log(this.state.eventList)
            })
          }
          else {
            console.log("Insert error");
          }
          
        });
      }
      else if ( data[i]["type"] === "central") {
         
          let doc = {
            "time_delta" : "7h",
            "room_id"    : parseInt(data[i]["id"])
          }
          fetch('http://192.168.0.73:8000/home/fetch_room_info', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(doc)
          })
          .then( data => data.json() )
          .then( data => {

            if (data["ack"]) {
              let events = this.state.eventList;
              events.push(data.data.data)
              this.setState({
                eventList : events
              }, () =>{
                console.log(this.state.eventList);
              })
            }
            else {
              console.log("Insert error");
            }
          });
        };
        
        this.setState({
          eventList : events
        }, () => {
          console.log(this.state.eventList);
        })
    }
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

    function returnToken( data, token, token1, token2 ) {
      let buffer = [];
      for(let i = 0; i < data.length; i++) {
        buffer.push( data[i][token][token1][token2] );
      };
      return buffer;
    };

    let buf = {
      rooms : returnToken( data, "centrals", "id", "room" ),
      id    : returnToken( data, "beacons", "id", "name" )
    };
    console.log(buf)
    return buf;
  }



  packDataEventListBox = (data) => {
    
    let buffer = []
    for(let i = 0 ; i < data.length; i++) {
      for(let j = 0; j < data[i].length; j++) {
        let buf = {
          entity_1 : data[i][j]["name"],
          entity_2 : data[i][j]["rname"],
          entity_3 : moment(data[i][j]["ts"]).format('MMM Do YYYY, h:mm:ss a'),
          entity_4 : data[i][j]["orientation"],
          entity_5 : data[i][j]["a"],
          entity_6 : data[i][j]["b"],
          entity_7 : data[i][j]["c"],
          entity_8 : data[i][j]["beacon_id"],
          entity_9 : data[i][j]["room_id"]
        };
        buffer.push(buf);
      }
    };
    return buffer;
  }

  packDataListBox = ( data, type ) => {
    let buffer = []
    for(let i = 0 ; i < data.length; i++) {
      let buf = {
        entity_type : type,
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
      //fetch("http://10.0.0.185:8000/home/fetch_events")
      fetch("http://192.168.0.73:8000/home/fetch_events")
      .then( data => data.json() )
      .then( data => {
        //if(this.state.events.some(item => data.id === item.id)) return;
        console.log(data);
        let events = this.state.events;
        //events.push( data );
        this.setState({
          events: data
        }, () =>{
          console.log(this.state.events);
        });
      })
     }, 10000);
  }

  handleRowClick = ( data ) => {
    
    if (data.entity_type === "beacons") {
      let doc = {
        "time_delta" : "6h",
        "beacon_id"    : parseInt(data["entity_2"], 10)
      }
      fetch('http://192.168.0.73:8000/home/fetch_beacon_info', {
        method: 'post',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(doc)
      })
      .then( data => data.json() )
      .then( data => {
        if (data["ack"]) {
          console.log(data);
        }
        else {
          console.log("Insert error");
        }
      });
    }
    else if(data.entity_type === "central") {
      let doc = {
        "time_delta" : "6h",
        "room_id"    : parseInt(data["entity_2"], 10)
      }
      fetch('http://192.168.0.73:8000/home/fetch_room_info', {
        method: 'post',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(doc)
      })
      .then( data => data.json() )
      .then( data => {
        
        if (data["ack"]) {
          console.log(data);
        }
        else {
          console.log("Insert error");
        }
      });
      }
    }


  handleRowClickEvent = (event) =>  {
    console.log(event);
    this.setState({
      event : event
    })
  }

  render() {
      document.body.style = "background:#562533"
      //this.handleEventFetching();
      return (
        <div style={{width : "100%", height: "fit-content", border:"none"}}>
          <HeaderContainer>
            <Header>
              Asset Tracking
            </Header>
            <FilterContainer>
              <FilterBar options={(this.state.listBoxData)} handlePropChange={this.handlePropChange}>
              </FilterBar>
            </FilterContainer>
          </HeaderContainer>
          <BodyContainer>
            <BodyItemRightTopContainer>
              <SearchTable 
                  rowData={this.packDataListBox(this.state.beacons, "beacons")}
                  table_type={"Beacon list"}
                  columns={["Name", "ID"]}
                  specialComponent={this.specialComponentStatusBar()}
                  handleRowClick = {this.handleRowClick}
                            />
              <SearchTable 
                    rowData={this.packDataListBox(this.state.centrals,"central")}
                    table_type={"Central list"}
                    columns={["Name", "ID", "Room"]}
                    specialComponent={this.specialComponentStatusBar()}
                    handleRowClick = {this.handleRowClick}
                           />
              <ToolBar toAddData={this.handleToAddData}/>
            </BodyItemRightTopContainer>
            <BodyItemRightBottomContainer>
            <SearchTable 
                    rowData={this.packDataEventListBox(this.state.eventList)}
                    table_type={"Event List"}
                    columns={["Beacon ID", "Room", "Time"]}
                    specialComponent={this.specialComponentStatusBar()}
                    handleRowClick={this.handleRowClickEvent}
                            />
              <MainCanvas 
                  
                  positions={this.state.eventList}
                   />
            </BodyItemRightBottomContainer>
          </BodyContainer>
        </div>
      )
    }
};
