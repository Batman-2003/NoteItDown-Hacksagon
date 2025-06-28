import './Home.css';
import './App.css';
import { useState,useEffect, useRef } from 'react';
import { Signup } from './components/Signup';
import { Login } from './components/Login';
import { Editor,initDB,getAllMarkdown,loadMarkdown } from './components/Editor';
import { Canvas,getDB,deleteCanvas,getAllCanvas,loadCanvas } from './components/Canvas';
import { HomeIcon, LetterTextIcon, PenBox, PenTool, UserCircle2, UserIcon, UserRoundSearch } from 'lucide-react';
import { openDB } from 'idb';

function App() {
  const [page,setPage]=useState('home');
  return (
    <>
      <div className='nav-bar'>
        <button onClick={()=>setPage('home')}><HomeIcon></HomeIcon></button>
        <button onClick={()=>setPage('Editor')}><LetterTextIcon></LetterTextIcon></button>        
        <button onClick={()=>setPage('Canvas')}><PenBox></PenBox></button>
        <button onClick={()=>setPage('Profile')}><UserCircle2></UserCircle2></button>
      </div>
      {page==='home' && <Home></Home>}
      {page==='Editor' && <Editor></Editor>}
      {page==='Canvas' && <Canvas></Canvas>}
    </>
  );
}
export default App;

async function loadFilesFromIDB(dbName,storeName) {
    const db=await openDB(dbName,1);
    const tx=db.transaction(storeName,'readonly');
    const store=tx.objectStore(storeName);
    const allFiles=await store.getAll();
    return allFiles;
  }

function Home(){
  const [mdfiles,setMdFiles]=useState([]);
  const [canvasFiles,setCanvasFiles]=useState([]);
  const dbRef=useRef(null);
  const [fileList,setFileList]=useState([])
  const STORE_NAME='files';
  useEffect(()=>{
          (async ()=>{
              dbRef.current=await initDB();
              await loadFileList();
          })();
      },[]);
  
    async function loadFileList() {
          const tx=dbRef.current.transaction(STORE_NAME,"readonly");
          const store=tx.objectStore(STORE_NAME);
          const keys=await store.getAllKeys();
          setFileList(keys);
      }

  return (
    <div className='hosme-container'>
      <h1 >Mind Note</h1>
      
      <div className='md-files'>
        {fileList.map((file)=>(
          <div key={file} className='file-card'>
            <p>{file}</p>
          </div>
))}    
      </div>
    </div>
  )
}