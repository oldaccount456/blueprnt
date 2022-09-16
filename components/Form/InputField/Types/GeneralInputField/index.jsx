import React from 'react';

export default class GeneralInputField extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            value: '',
        }
    }
    highlight(){
        this.formControlRef.current.style.borderColor = 'red';
    }

    unhighlight(){
        this.formControlRef.current.style.borderColor = '';
    }
    
    updateField(e){
        this.setState({
            value: e.target.value
        });
    }
}