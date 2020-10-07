import React, { Component } from 'react'
import { BrowserRouter as Router, Link, useParams } from 'react-router-dom'

export default class Join extends Component {

    constructor() {
        super();
        this.state = {
            username: "",
            channel: "",
        }
    }

    render() {
        return (
            <div>
                <h1>Welcome to Youbi And Roro chat</h1>
                <p>Insert you're username and the name of the channel you want to join</p>
                <input type="text" placeholder="Username" onChange={(e) => { this.setState({ username: e.target.value }) }} />
                <input type="text" placeholder="Channel" onChange={(e) => { this.setState({ channel: e.target.value }) }} />
                <Link to={{
                    pathname: "/chat",
                    state: { username: this.state.username, channel: this.state.channel }
                }}>Go !</Link>
            </div>
        );
    }
}