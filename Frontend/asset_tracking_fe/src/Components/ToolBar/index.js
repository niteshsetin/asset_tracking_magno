import React, { Component } from "react";
import styled from "styled-components";

import { motion } from "framer-motion";
import { withStyles } from "@material-ui/core/styles";
import {FormControl} from "react-bootstrap";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";

import Select from "@material-ui/core/Select";

const styles = theme => ({
  root: {
   display: "flex",
   flexWrap: "wrap",
   color : "white",
 },
 formControl: {
   margin: 10,
   border:"white",
   width   : 250
 },
 selectEmpty: {
   marginTop: theme.spacing.unit * 2
  }
})

const HeaderStyling = styled.div`
  display: flex;
  font-size: 28px;
  color:     white;
  font-family: Rajdhani;
  font-weight: 300;
  width: 100%;
  height: 50px;
  justify-content: center;
  align-items: center;
`;

class ToolBar extends Component {
  constructor(){
    super();
    this.state = {
      beacon_name : "",
      beacon_id   : 0,
      names: ["Beacons", "Centrals"],
      type: "",
      room: ""
    }
  }

  handleNameChange = (e) => {
    console.log(e.target.value);
    this.setState({
      beacon_name : e.target.value
    });
  }

  handleIDChange = (e) => {
    console.log(e.target.value)
    this.setState({
      beacon_id : e.target.value
    });
  }


  handleAddBeacon = () => {

    if (this.state.beacon_name === "" || this.state.beacon_id  === 0 || this.state.type == "") {
      console.log("Empty.");
      return;
    };

    let doc = {
      "type" : this.state.type,
      "id"   : this.state.beacon_id,
      "name" : this.state.beacon_name
    };

    this.state.type === "central" ? doc["room"] = this.state.room : doc["room"] = ""

    fetch('http://192.168.0.73:8000/home/add_beacon', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(doc)
    })
    .then( data => data.json() )
    .then( data => {
      console.log(data);
      if (data["success"]) {
        this.props.toAddData({
                        "name" : this.state.beacon_name, 
                        "id":    this.state.beacon_id, 
                        "type":  this.state.type,
                        "room":  this.state.room
                      });
      }
      else {
        console.log("Insert error");
      }
      
    });
  }

  handleTypeChange = ( e )=> {
    this.setState({
      type: e
    }, () => {console.log(this.state.type)});
  };

  handleRoomChange = ( e ) => {
    this.setState({
      room: e.target.value
    }, () => {console.log(this.state.room)})
  }

  render() {
    const {classes} = this.props;
    return (
      <div style={{
        display:         "block",
        flexDirection:   "row",
        height:          "fit-content",
        width:           "100%",
        border:          "none",
        borderRadius:    "10px",
        backgroundColor: "rgba(224, 203, 203, 0.32)",
        boxShadow:       "0px 4px 4px rgba(0, 0, 0, 0.25)",
        marginRight    : "5px",
        padding:         "10px"
         }}
        >
            <style text="text/css">
              {`
                #bname, #bid {
                  color: white;
                  outline: none;
                }

                ::placeholder {
                      color: white;
                      font-family: Rajdhani;
                      opacity: 0.5;
                    }
                }
              `}
            </style>

            <HeaderStyling>
              <div style={{display:"flex"}}>Beacon Settings</div>
            </HeaderStyling>

            <div style={{display:"flex", flexDirection:"column", width:"100%", height:"auto", border:"none",  justifyContent:"center", alignItems:"center"}}>
              <form className={classes.root}>

                  <Select
                    style={{width:"210px", margin:"15px"}}
                     value={this.state.type}
                     onChange={event => this.handleTypeChange(event.target.value)}
                     id="demo-simple-select"
                  >
                  {
                    [{type:"central"}, {type:"beacons"}].map((value, index) => (
                      <MenuItem key={index} value={value.type}>{value.type}</MenuItem>
                    ))
                  }
                  </Select>

              </form>
              <input onChange={(e)=> this.handleNameChange(e)} type="text" name="bname" id="bname" placeholder ="Beacon Name" style={{backgroundColor:"rgba(0.1, 0.1, 0.1, 0.1)", border:"none", borderRadius: "10px", height:"40px",  marginTop:"-10px", color:"white", padding: "20px"}}/>
              <input onChange={(e)=>this.handleIDChange(e)}    type="text" name="bid" id="bid" placeholder ="Beacon ID" style={{backgroundColor:"rgba(0.1, 0.1, 0.1, 0.1)", border:"none", borderRadius: "10px", height:"40px",  marginTop:"10px", color:"white", padding:"20px"}}/>
              
              
              {
                this.state.type ==="central" ? 
                <input onChange={(e)=>this.handleRoomChange(e)} 
                      type="text" name="room" id="rid" placeholder="Room" 
                      style={{backgroundColor:"rgba(0.1, 0.1, 0.1, 0.1)", border:"none", borderRadius: "10px", height:"40px",  marginTop:"10px", color:"white", padding:"20px"}}/>
                    :
                    <div></div>
              }
              <motion.div onClick={this.handleAddBeacon} whileTap={{scale:0.9}} transition={{duration:0.2}}>
              <button type="button"  id="btn"  className="btn btn-dark" style={{marginTop:"10px", width:"auto", backgroundColor:"rgba(0.1,0.1,0.1,0.3)", border:"none", fontFamily:"Rajdhani", outline:"none"}}>Add</button></motion.div>
            </div>
      </div>
    )
  }
}
export default withStyles(styles)(ToolBar);
