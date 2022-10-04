import React from 'react';

import {
    Table,
    Pagination
} from 'react-bootstrap';

const getPaginatedResult = require('@/utils/paginateResult').default;
const censorIp = require('@/utils/censorIp').default;

import styles from '../Panel.module.css'; 

export default class LoginActivity extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            pageNo: 1,
            paginatedLoginResults: getPaginatedResult(props.loginHistory, 6)
        }
    }

    updatePageNo(e){
        this.setState({
            pageNo: e.target.id.split('page-')[1]
        });

    }

    render(){
        const allPastLogins = Object.keys(this.state.paginatedLoginResults).length === 0 ? [] : this.state.paginatedLoginResults[this.state.pageNo].map((login) => (
            <tr id={Math.random()}>
                <td className={styles['table-field']}>{censorIp(login.ipAddress)}</td>
                <td className={styles['table-field']}>{login.loginDate.split("+")[0]}</td>
            </tr>
        ))

        let items = [];
        let max = Object.keys(this.state.paginatedLoginResults).length >= 10 ? 10 : Object.keys(this.state.paginatedLoginResults).length;
        for (let number = Object.keys(this.state.paginatedLoginResults)[0]; number <= max; number++) {
            items.push(
                <Pagination.Item key={number} id={`page-${number}`} className={styles['page-btn']} onClick={this.updatePageNo.bind(this)} active={number == this.state.pageNo}>
                    {number}
                </Pagination.Item>,
            );
        }

        return (
            <>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th className={styles['table-header']}>IP Address</th>
                        <th className={styles['table-header']}>Login Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPastLogins}
                    </tbody>
                </Table>
                <Pagination>{items}</Pagination>
            </>

        )
    }
}