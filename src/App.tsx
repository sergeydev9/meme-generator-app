import "./App.scss";
import MemeGenerator from "./components/MemeGenerator";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo.jpeg" className="App-logo" alt="logo" />
        <h1>Meme Generator</h1>
      </header>
      <MemeGenerator />
    </div>
  );
}

export default App;
