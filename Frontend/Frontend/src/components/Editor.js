import "./Editor.css";
import React, { useState, useEffect, useRef } from 'react';
import { Remarkable } from 'remarkable';
import {openDB} from 'idb';
import { SaveIcon,FolderOpenIcon,PlusIcon,Trash2Icon, Trash } from "lucide-react";

const md = new Remarkable();
const DB_NAME="notesDB";
const STORE_NAME="files";

export async function initDB() {
    return openDB(DB_NAME,1,{
        upgrade(db){
            if(!db.objectStoreNames.contains(STORE_NAME) || !db.objectStoreNames.contains('canvas')) {
                db.createObjectStore(STORE_NAME,{keyPath:'filename'});
                db.createObjectStore('canvas',{keyPath:'filename'});
            }
        },
    });
}


export const loadMarkdown=async (name)=>{
  const db=await initDB();
  const index=db.transaction('files').store.index('name');
  return index.get(name);
};
export const getAllMarkdown=async ()=>{
  const db=await initDB();
  return db.getAll('files');
};

export function Editor() {

    const [markdown,setMarkdown]=useState("");
    const [preview,setPreview]=useState("");
    const [showModal,setShowModal]=useState(false);
    const [showSaveModal,setSaveModal]=useState(false);

    const [filename,setFilename]=useState("untitled.md");
    const [fileList,setFileList]=useState([]);
    const textareaRef=useRef(null);
    const dbRef=useRef(null);

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

    useEffect(()=>{
        setPreview(md.render(markdown));
    },[markdown]);

    async function handleNewFile(name){
        const tx=dbRef.current.transaction(STORE_NAME,"readonly");
        const store =tx.objectStore(STORE_NAME);
        const file=await store.get(name);
        if (markdown!==file.content)alert("Changes are not saved !!!");
        else {
            setMarkdown("");
            setFilename("untitled.md");
        }
    };

    async function openFile(name) {
        const tx=dbRef.current.transaction(STORE_NAME,"readonly");
        const store =tx.objectStore(STORE_NAME);
        const file=await store.get(name);
        if(file) {
            setFilename(file.filename);
            setMarkdown(file.content);
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    async function saveFile(name,content) {
        if (!filename || filename==="untitled.md"){
            alert("Please enter a filename before saving");
            return;
        }
        const tx=dbRef.current.transaction(STORE_NAME,"readwrite");
        const store=tx.objectStore(STORE_NAME);
        await store.put({filename:name,content});
        await tx.done;
        await loadFileList();
        alert(`File ${filename} Saved`);
        setSaveModal(false);
    }

    async function deleteFile(name){
        const tx=dbRef.current.transaction(STORE_NAME,"readwrite");
        const store=tx.objectStore(STORE_NAME);
        await store.delete(name);
        await tx.done;
        await loadFileList();
        if (name===filename){
            handleNewFile();
        }
    };

    return (
        <div className="main">
            <div className="bottom-bar">
                <button onClick={()=>handleNewFile(filename)}><PlusIcon size={28}></PlusIcon></button>{" "}
                <button onClick={()=>setShowModal(true)}><FolderOpenIcon size={28}></FolderOpenIcon></button>{" "}
                <button onClick={()=>setSaveModal(true)}><SaveIcon size={28}></SaveIcon></button>{" "}
                <button onClick={()=>{setShowModal(true)}}><Trash2Icon size={28}></Trash2Icon></button>{" "}
            </div>
            <div className="tab-bar">
                <input 
                    type="text"  
                    className="file-name"
                    value={filename}
                    onChange={(e)=>setFilename(e.target.value)}
                />
            </div>
            <div className="workspace">
                <textarea
                    ref={textareaRef}
                    className="editor"
                    value={markdown}
                    onChange={(e)=>setMarkdown(e.target.value)}
                ></textarea>
                <div
                    className="preview"
                    dangerouslySetInnerHTML={{__html:preview}}
                ></div>
            </div>
            { showModal && (
                <div className="modal">
                    <div className="modal-container">
                        <h2>Select a File</h2>
                        <ul>
                            {fileList.map((file)=>(
                                <li key={file}>
                                    <span onClick={()=>openFile(file)} style={{cursor:'pointer',flexGrow:1}}>{file}</span>
                                    <button onClick={()=>{deleteFile(file)}} className="delete-button"><Trash size={14}></Trash></button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={()=>setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
            { showSaveModal && (
                <div className="modal">
                    <div className="modal-container">
                        <h2>Save File</h2>
                        <input type="text" value={filename} onChange={(e)=>setFilename(e.target.value)}></input>
                        <div className="buttons">
                        <button onClick={()=>saveFile(filename,markdown)} >Save</button>
                        <button onClick={()=>setSaveModal(false)} >Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
            // const handleOpenFile=async ()=> {
            //     const name=prompt(`Open file:\n Available files:\n ${fileList.join("\n")}`);
            //     if (name && fileList.includes(name)){
            //         await openFile(name);
            //     }else if(name){
            //         alert("File not Found");
            //     }
            // };
        
            // const handleSaveFile=async ()=>{
            //     setFilename(prompt("Filename:",filename));
            //     setFilename()
            //     await saveFile(filename,markdown);
            //     alert(`Saved ${filename} to IndexedDB`);
            //     console.log("Saved");
            // };
        
            // const handleSaveAsFile=async ()=>{
            //     const newName=prompt("Save As",filename);
            //     if(newName){
            //         setFilename(newName);
            //         await saveFile(newName,markdown);
            //         alert(`Saved As: ${newName}`);
            //     }
            // };
        
