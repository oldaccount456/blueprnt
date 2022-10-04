import React from 'react';

export default class GeneralInputField extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            value: '',
        }
    }
    highlight(){
        this.formControlRef.current.style.setProperty("border-color", "red", "important");
    }

    unhighlight(){
        this.formControlRef.current.style.setProperty("border-color", "", "important");

    }
    
    updateField(e){
        this.setState({
            value: e.target.value
        });
    }
}