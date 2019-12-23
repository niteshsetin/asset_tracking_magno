import React, { Component } from "react";
import styled from "styled-components";
import { media } from "../../media/media";
import "../../Fonts/Mont.css";
import { motion } from "framer-motion";
import { withStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const styles = theme => ({
  root: {
   display: "flex",
   flexWrap: "wrap",
   color : "white"
 },
 formControl: {
   margin: 10,
   border:"white",
   minWidth: 120,
   width   : 120
 },
 selectEmpty: {
   marginTop: theme.spacing.unit * 2
  }
})

const FilterBox = styled.div`
  display : flex;
  width   : 100%;
  height  : auto;
  background-color: rgba(224, 203, 203, 0.32);
  border-radius : 5px;
  justify-content : center;
  align-items: center;
  padding: 10px;
`;

const SelectContainer = styled.div`
  width : 100%;
  height : 80%;
  display : flex;
  flex-direction : row;
  justify-content : center;
  align-items : center;
  ${media.phone`
    flex-direction : column;
  `};
`;

class FilterBar extends Component {
  constructor() {
    super();
    this.state = {
      names : [],
      rooms : [],
      id    : []
    };
  };

   handleNameChange = (event) => {
     let this_ = this;
     this.setState(
       {
         names: event
       }, ()=> {
         //console.log(this.state.names);
         this_.props.handlePropChange( this.state );
       });
   };

   handleRoomChange = (event) => {
     let this_ = this;
     this.setState(
       {
         rooms: event
       }, ()=> {
         //console.log(this.state.rooms);
         this_.props.handlePropChange( this.state );
       });
   };

   handleIDChange = (event) => {
     let this_ = this;
     this.setState(
       {
         id: event
       }, ()=> {
         //console.log(this.state.id);
         this_.props.handlePropChange( this.state );
       });
   };
  render(){
    const {classes} = this.props;

    return (
      <FilterBox>
        <SelectContainer>
          <form className={classes.root}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="demo-controlled-open-select">Name</InputLabel>
              <Select
                 multiple
                 value={this.state.names}
                 onChange={event => this.handleNameChange(event.target.value)}
                 input={<Input id="select-multiple" />}
              >
              {
                this.props.options.names.map((value, index) => (
                  <MenuItem key={index} value={value}>{value}</MenuItem>
                ))
              }
              </Select>
            </FormControl>
          </form>

          <form className={classes.root}>
            <FormControl className={classes.formControl}>
            <InputLabel htmlFor="demo-controlled-open-select">ID</InputLabel>
              <Select
                 multiple
                 value={this.state.id}
                 onChange={event => this.handleIDChange(event.target.value)}
                 input={<Input id="select-multiple" />}
              >
              {
                this.props.options.id.map((value, index) => (
                  <MenuItem key={index} value={value}>{value}</MenuItem>
                ))
              }
              </Select>
            </FormControl>
          </form>
          <form className={classes.root}>
            <FormControl className={classes.formControl}>
            <InputLabel htmlFor="demo-controlled-open-select">Room</InputLabel>
              <Select
                 multiple
                 value={this.state.rooms}
                 onChange={event => this.handleRoomChange(event.target.value)}
                 input={<Input id="select-multiple" />}
              >
              {
                this.props.options.rooms.map((value, index) => (
                  <MenuItem key={index} value={value}>{value}</MenuItem>
                ))
              }
              </Select>
            </FormControl>
          </form>
        </SelectContainer>
      </FilterBox>
    )
  }
}

export default withStyles(styles)(FilterBar);
