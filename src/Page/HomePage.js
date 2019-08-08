import React from 'react';
import { Input, Form, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import '../App.css';
import moment from 'moment';
import Socket from '../utils/Socket';

const Background = styled.div`
    width: 100%;
    height:100%;
    position: fixed;
    background-color: #add9d4;
`

const Chatbox = styled.div`
    position: relative;
    width: 100%;
    height: calc(100vh - 40px);
    overflow: auto;
    padding-left: 16px;
    padding-top: 16px;
`

const Username = styled.div`
    line-height: 20px;
    margin: 0px;
    padding: 0px;
    font-size: 18px;
    font-weight: bold;
    color: darkblue;
`

const Message = styled.div`
    line-height: 20px;
    display: flex;
    justify-content: space-between;
`

const Timestamp = styled.div`
    font-size: 11px;
    color: #808080;
`

const Log = styled.div`
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: white;
    max-width:calc(100vw - 250px);
    width: 100vw;
    padding: 5px;
    animation-name: showBlock;
    animation-duration: 0.5s;
    @keyframes showBlock {
        from { display: block; opacity: 0; }
        to { opacity: 1; }
    }
`

const UserList = styled.div`
    position: fixed;
    top: 0px;
    right: 0px;
    width: 215px;
    height: calc(100vh - 40px);
    background-color: #39BF99;
`

const Users = styled.div`
    width: 180px;
    background-color: #c1ffc1;
    border-radius: 4px;
    margin: auto;
    margin-top: 7px;
    height: auto;
    padding-left: 6px;
    padding-top: 3px;
    padding-bottom: 3px;
    animation-name: showBlock;
    animation-duration: 0.5s;
    @keyframes showBlock {
        from { display: block; opacity: 0; }
        to { opacity: 1; }
    }
`

const Top = styled.div`
    font-size: 20px;
    height: 40px;
    padding-left: 20px;
    padding-top: 7px;
    font-weight: bold;
`

export default class HomePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            textInput: '',
            currentUser: '',
            timestamp: '',
            users: [],
            conversations: []
        }
        Socket.emit('NEW_USER')

        Socket.on('GET_CURRENT_USER', (user) => {
            this.setState({
                currentUser: user.username
            })
        })

        Socket.on('UPDATE_USER_LIST', users => {
            users.map(user => {
                this.setState({ users: [...users].map((user) => user.username) })
            })
        })

        Socket.on('RECEIVE_BROADCAST', data => {
            this.setState({ conversations: [...this.state.conversations, data] })
        })
    }

    handleChange = e => {
        if (this.state.textInput.length <= 500 || e.target.value.length < this.state.textInput.length) {
            let time = Date.now()
            this.setState({
                textInput: e.target.value,
                timestamp: time
            })
        }
        else {
            return (
                alert('Character count exceeded')
            )
        }
    }

    sendMessage = e => {
        e.preventDefault()
        Socket.emit('BROADCAST_MESSAGE',
            {
                username: this.state.currentUser,
                message: this.state.textInput,
                timestamp: this.state.timestamp
            }
        )
        this.setState({
            textInput: '',
        })
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "auto" });
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        return (
            <Background>
                <Chatbox>
                    {this.state.conversations.map(log => {
                        return (
                            <Log>
                                <Username>{log.username}</Username>
                                <Message>
                                    <div>{log.message}</div>
                                    <Timestamp>{moment(log.timestamp).format('lll')}</Timestamp>
                                </Message>
                            </Log>
                        )
                    })}
                    <div style={{ float: "left", clear: "both" }}
                        ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </Chatbox>
                <UserList>
                    <Top>Online</Top>
                    {this.state.users.map(user => {
                        return (
                            <Users>{user}</Users>
                        )
                    })}
                </UserList>
                <Form className="Form" onSubmit={this.sendMessage}>
                    <Input className="input" type='text' value={this.state.textInput} onChange={this.handleChange}></Input>
                    <Button className="button" disabled={this.state.textInput.length == 0 || this.state.textInput.length > 500} color='info'>Send</Button>
                </Form>
            </Background>
        )
    }
}