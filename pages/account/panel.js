import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import AccountDetails from '@/components/Panel/AccountDetails';
import PasswordManagement from '@/components/Panel/PasswordManagement';
import EmailManagement from '@/components/Panel/EmailManagement';
import LoginActivity from '@/components/Panel/LoginActivity';

import {checkToken} from '@/lib/authentication';
import {account, loginHistory} from '@/lib/database';

import censorIp from '@/utils/censorIp';

import {
    Col,
    Nav,
    Row,
    Tab
} from 'react-bootstrap';

import styles from '@/styles/Panel.module.css';

export async function getServerSideProps({ req, res }){
    const authHeader = req.headers['cookie']
    const token = authHeader && authHeader.split('token=')[1];
    if (token == null){
        return {
            redirect: {
                destination: '/account/login',
                permanent: false,
            },
        }
    }
    try{
        const {username} = await checkToken(token);
        const accountQuery =  await account.findOne({
            include: [loginHistory],
            where: {
                username: username
            }
        });
        
        if(!accountQuery){
            return {
                redirect: {
                    destination: '/account/logout',
                    permanent: false,
                },
            }
        }
        const loginHistoryQuery = accountQuery.login_histories;

  
        
        return {
            props: {
                user: username,
                accountDetails: {
                    'username': accountQuery.username,
                    'email': accountQuery.email,
                    'createdAt': accountQuery.created_at.toString(),
                    'apiKey': accountQuery.api_key ? accountQuery.api_key : 'Not Activated'
                },
                loginHistory: loginHistoryQuery.map((loginRecord) => ({
                    'ipAddress': loginRecord.ip_address,
                    'loginDate': loginRecord.login_date.toString()
                })).reverse(),
                lastLoginIP: loginHistoryQuery.length === 0 ? 'N/A' : censorIp(loginHistoryQuery[loginHistoryQuery.length-1].ip_address),
                lastLoginDate: loginHistoryQuery.length === 0 ? 'N/A' : loginHistoryQuery[loginHistoryQuery.length-1].login_date.toString(),
            }
        }
    }
    catch(e){
        console.log(e)
        return {
            redirect: {
                destination: '/account/login',
                permanent: false,
            },
        }
    }
};


export default function Panel(props){
    return (
        <>
            <Layout user={props.user}>
                <AccountPrompt headerText='Panel' width={'900px'} height={'485px'}>
                    <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                        <Row id='account-panel-row'>
                            <Col sm={3} className={styles['panel-sidebar-border']}>
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item >
                                        <Nav.Link className={styles['panel-nav-link']} eventKey="first">Account Details</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className={styles['panel-nav-item']}>
                                        <Nav.Link className={styles['panel-nav-link']} eventKey="second">Change Password</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className={styles['panel-nav-item']}>
                                        <Nav.Link  className={styles['panel-nav-link']} eventKey="third">Change Email</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className={styles['panel-nav-item']}>
                                        <Nav.Link className={styles['panel-nav-link']} eventKey="fourth">Login History</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="first">
                                    <AccountDetails accountDetails={props.accountDetails} lastLoginDate={props.lastLoginDate} lastLoginIP={props.lastLoginIP}/>
                                </Tab.Pane>
                                <Tab.Pane eventKey="second">
                                    <PasswordManagement/>
                                </Tab.Pane>
                                <Tab.Pane eventKey="third">
                                    <EmailManagement/>
                                </Tab.Pane>
                                <Tab.Pane eventKey="fourth">
                                    <LoginActivity loginHistory={props.loginHistory}/>
                                </Tab.Pane>
                            </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </AccountPrompt>
            </Layout>
        </>
    )
}
