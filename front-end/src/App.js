import Header from './components/header/header'
import Maintree from './components/central_tree_design/Central_main'
import Upload from './components/upload/upload_new'
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Maintree />
      <Upload />
    </div>
  );
}

export default App;
