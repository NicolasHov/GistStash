import React, { Component } from "react"
import { Link, Location, Locations } from "react-router-component"
import Editor from "rich-markdown-editor"
import MonacoEditor from "react-monaco-editor"
import "./App.css"

const USERNAME = "yvan-sraka"
const TOKEN = "9d5e442ee1cac5bad6af83b8fa91211fb25c0cae"
const HEADERS = new Headers({
  "Authorization": `token ${TOKEN}`,
  "Content-Type": "application/x-www-form-urlencoded"
});

const GistList = (props) =>
  <div className="mdc-list-group">{props.dataSource.map(item =>
    <Gist key={item.id} {...item} deleteGist={props.deleteGist} />)}</div>

const Gist = (props) =>
  <FileList {...props.files} />
/*
  <h3 className="mdc-list-group__subheader">
    {props.description || "Untitled"}
    <button className="mdc-icon-button material-icons" onClick={() =>
      props.deleteGist(props.id)}>delete</button>
  </h3>
*/

const FileList = (props) =>
  <ul className="mdc-list">
    {Object.keys(props).map(key => <File key={key} {...props[key]} />)}
    <li role="separator" className="mdc-list-divider"></li>
  </ul>

const File = (props) =>
  <li><Link className="mdc-list-item"
    href={`/file/${props.raw_url}`}>{props.filename}</Link></li>

const FileView = (props) =>
  props._[0].substr(props._[0].length - 3).toLowerCase() === ".md" ?
    <MD url={props._[0]} /> : <Code url={props._[0]} />

class Raw extends Component {
  constructor(props) {
    super(props)
    this.state = { dataSource: "" }
    this.request = new XMLHttpRequest()
  }

  componentDidMount() {
    this.request.onreadystatechange = (e) => {
      if (this.request.readyState !== 4) return
      if (this.request.status === 200)
        this.setState({ dataSource: this.request.responseText })
    }
    this.request.open("GET", this.props.url)
    this.request.send()
  }

  componentWillUnmount() {
    this.request.abort()
  }

  render() {
    return <p>{this.state.dataSource}</p>
  }
}

class Code extends Raw {

  render() {
    const options = {
      selectOnLineNumbers: true,
      minimap: {
        enabled: false
      }
    }

    return <div>
      <MonacoEditor
        className="MonacoEditor"
        theme="vs-dark"
        value={this.state.dataSource}
        options={options}
        onChange={(value) => this.setState({ dataSource: value })}
      />
      <button className="Stash mdc-fab mdc-fab--extended">
        <span className="material-icons mdc-fab__icon">save</span>
        <span className="mdc-fab__label">Stash</span>
      </button>
    </div>
  }
}

class MD extends Raw {
  render() {
    /*
    const createGist = (content) =>
      fetch(`https://api.github.com/gists`, { 
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          "description": "",
          "public": true,
          "files": {
            "README.md": {
              "content": content
            }
          }
        })
      }).then((response) => response.json())
        .then((responseJson) => this.props.newGist(responseJson))
    */

    return <div>
      {this.state.dataSource ?
        <Editor className="Editor" defaultValue={this.state.dataSource}
          onChange={(callback) => this.setState({ dataSource: callback() })}
          autoFocus={true} dark={true} />
        : <div className="Editor" />}
      <button className="Stash mdc-fab mdc-fab--extended">
        <span className="material-icons mdc-fab__icon">save</span>
        <span className="mdc-fab__label">Stash</span>
      </button>
    </div>

    /*
      <button className="Button" onClick={() =>
        createGist(this.state.dataSource)}>New gist</button>
    */
  }
}


class MainView extends Component {
  constructor(props) {
    super(props)
    this.state = { dataSource: [] }

    fetch(`https://api.github.com/users/${USERNAME}/gists`, {
      method: "GET",
      headers: HEADERS
    }).then((response) => response.json())
      .then((responseJson) => this.setState({ dataSource: responseJson }))
  }

  render() {
    /*
    const newGist = (responseJson) => this.setState({
      dataSource: [responseJson].concat(this.state.dataSource)
    })
    */

    const deleteGist = (id) =>
      fetch(`https://api.github.com/gists/${id}`, {
        method: "DELETE",
        headers: HEADERS
      }).then(() =>
        this.setState({
          dataSource: this.state.dataSource.filter(item =>
            item.id !== id)
        }))

    return (
      <div className="App">
        <GistList className="GistList"
          {...this.state} deleteGist={(id) => deleteGist(id)} />
        <button className="NewGist mdc-fab mdc-fab--extended">
          <span className="material-icons mdc-fab__icon">edit</span>
          <span className="mdc-fab__label">New Gist</span>
        </button>
      </div>
    )
  }
}


/*
const EditorView = (props) =>
  <GistStash newGist={(responseJson) => props.newGist(responseJson)} />
*/

const App = () =>
  <Locations hash>
    <Location path="/" handler={MainView} />
    <Location path="/file/(*)" handler={FileView} />
  </Locations>

export default App
