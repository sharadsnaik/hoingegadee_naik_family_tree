import Header from './components/header/header'
import Main_tree from './components/central_tree_design/Central_main'
import Tree from './components/content_tree/Tree'
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Main_tree />
      <Tree />
    </div>
  );
}

export default App;
