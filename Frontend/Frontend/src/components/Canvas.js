import "./Canvas.css";
import React, { useState, useRef, useEffect } from "react";
import { 
    Pen,
    PenLineIcon,
    SquareIcon,
    Circle,
    ArrowLeft,
    TextCursorInput,
    LucideSquareDashedMousePointer,
    Trash2Icon,
    CheckIcon,
    Undo2,
    Redo2,
    Move,
    Plus,
    Save,
    FolderOpen,
    Trash2,
    Delete
 } from "lucide-react";
import {openDB} from 'idb';


export const getDB=()=>openDB('canvas-db',1,{
    upgrade(db){
      if(!db.objectStoreNames.contains('drawings')){
        const store=db.createObjectStore('drawings',{keyPath:'id'});
        store.createIndex('name','name',{unique:true});
      }
    },
  });

const saveCanvas=async (id,name,paths)=>{
  const db=await getDB();
  await db.put('drawings',{
    id,
    name,
    paths,
    createAt:new Date().toISOString(),
  });
};

export const loadCanvas=async (name)=>{
  const db=await getDB();
  const index=db.transaction('drawings').store.index('name');
  return index.get(name);
};
export const getAllCanvas=async ()=>{
  const db=await getDB();
  return db.getAll('drawings');
};
export const deleteCanvas=async (name)=>{
  const db=await getDB();
  const index=db.transaction('drawings').store.index('name');
  await index.delete(name);
};

const TOOL_PEN = "pen";
const TOOL_LINE = "line";
const TOOL_RECT = "rect";
const TOOL_CIRCLE = "circle";
const TOOL_TEXT = "text";
const TOOL_ARROW = "arrow";
const TOOL_SELECT = "select";
const TOOL_PAN="pan";

export  function Canvas() { 
    const canvasRef = useRef(null); 
    const [drawingId,setDrawingId]=useState(null);
    const [drawingName,setDrawingName]=useState('');
    const [tool, setTool] = useState(TOOL_PEN); 
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null); 
    const [paths, setPaths] = useState([])
    const [selectedIds, setSelectedIds] = useState(null)
    const [dragOffset, setDragOffset] = useState(null)
    const [textInput, setTextInput] = useState("")
    const [textPoint, setTextPoint] = useState(null);
    const [currentPath, setCurrentPath] = useState(null);
    const [editingTextId, setEditingTextId] = useState(null);
    const [editingTextValue, setEditingTextValue] = useState('');
    const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [isPanning,setIsPanning]=useState(false);
    const [panStart,setPanStart]=useState({x:0,y:0});
    

    const handleNew=()=>{
      setPaths([]);
      setDrawingId(null);
      setDrawingName('');
    };

    const handleSave=async ()=>{
      const id=drawingId || Date.now();
      const name=prompt('Enter filename:',drawingName || 'untitled');
      await saveCanvas(id,name,paths);
      setDrawingId(id);
      setDrawingName(name);
      alert('Saved');
    }

    const handleOpen=async ()=>{
      const all=await getAllCanvas();
      const choice=prompt('Files:\n'+all.map(d=>`${d.id}: ${d.name}`).join('\n')+'\nEnter Name:');
      const file=await loadCanvas(choice);
      if(file){
        setPaths(file.paths);
        setDrawingId(file.id);
        setDrawingName(file.name);
      }
      else{
        alert('Not Found');
      }
    };

    const handleDelete=async ()=>{
      const all=await getAllCanvas();
      const choice=prompt('Delete file?\n'+all.map(d=>`${d.id}:${d.name}`).join('\n')).join('\n');
      await deleteCanvas(Number(choice));
      alert('Deleted');
    };

// ----------------------------------------Canvas 2-----

const getEventCoords = (e) => { 
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
        return { 
            x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, isTouch: true, };
    }
    else if (e.nativeEvent) { 
        return { 
        x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, isTouch: false, };
    } 
    return {x: 0, y: 0, isTouch: false };
};

const handlePointerDown = (e) => { 
    const { x, y } = getEventCoords(e);

    if(tool===TOOL_SELECT){
        const hit = paths.find(p =>
          p.tool !== TOOL_TEXT &&
          p.start && p.end &&
          x >= Math.min(p.start.x, p.end.x) -10 &&
          x <= Math.max(p.start.x, p.end.x) +10 &&
          y >= Math.min(p.start.y, p.end.y) -10 &&
          y <= Math.max(p.start.y, p.end.y) +10
        );
        
        if (hit) {
          setSelectedIds([hit.id]);
          setDragOffset({ x, y });
          return;
        }
    }

    setSelectedIds([]);
    setIsDrawing(true);

    const id = Date.now();
    const newPath = {
      id,
      tool,
      points: [{ x, y }],
      start: { x, y },
      end: { x, y },
      text: '',
    };

    if (tool === TOOL_TEXT) {
      setEditingTextId(id);
      setEditingTextValue('');
      setTextPosition({ x, y });
      setPaths(prev => [...prev, newPath]);
      return;
    }
    if (tool===TOOL_PAN){
      setIsPanning(true);
      setPanStart({x:e.clientX,y:e.clientY});
      return;
    }

    setCurrentPath(newPath);
    setPaths(prev => {
      const updated = [...prev, newPath];
      setHistory([...history, prev]);
      setRedoStack([]);
      return updated;
    });

};

const handlePointerMove = (e) => { 
    const { x, y } = getEventCoords(e);

    if (dragOffset && selectedIds.length > 0) {
      const dx = x - dragOffset.x;
      const dy = y - dragOffset.y;
      console.log(dx,dy);
      setPaths(prev =>
        prev.map(p => selectedIds.includes(p.id)
          ? {
              ...p,
              start: { x: p.start.x + dx, y: p.start.y + dy },
              end: { x: p.end.x + dx, y: p.end.y + dy },
              points: p.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy }))
            }
          : p
        )
      );
      setDragOffset({ x, y });
      return;
    }

    if (!isDrawing || !currentPath) return;
    setPaths(prev => prev.map(path => {
      if (path.id !== currentPath.id) return path;
      return {
        ...path,
        points: [...path.points, { x, y }],
        end: { x, y },
      };
    }));
    if(tool===TOOL_PAN && isPanning){
      const dx=e.clientX-panStart.x;
      const dy=e.clientY-panStart.y;
      setDragOffset((prev)=>({x:prev.x+dx,y:prev.y+dy}));
      setPanStart({x:e.clientX,y:e.clientY});
      return;
    }
};

const handlePointerUp = () => { 
    setIsDrawing(false);
    setCurrentPath(null);
    setDragOffset(null);
    if(tool===TOOL_PAN){
      setPanStart(null);
      setIsPanning(false);
      return;
    }
};


const hitTest = (path, point) => {
    if (path.tool === TOOL_TEXT) {
        return Math.abs(point.x - path.x) < 50 && Math.abs(point.y - path.y) < 20;
    }
    if(!path.start || !path.end)return alert("Free lines are not draggable!!");
    const withinBox = (a, b, buffer = 10) => {
        return ( 
            point.x >= Math.min(a.x, b.x) - buffer &&
            point.x <= Math.max(a.x, b.x) + buffer &&
            point.y >= Math.min(a.y, b.y) - buffer &&
            point.y <= Math.max(a.y, b.y) + buffer 
        ); 
    };
    return withinBox(path.start, path.end); 
};

const undo = () => { if (history.length > 0) { const last = history[history.length - 1];
    setRedoStack(prev => [paths, ...prev]);
    setPaths(last);
    setHistory(history.slice(0, -1));
} };

const redo = () => { if (redoStack.length > 0) { const next = redoStack[0];
    setHistory(prev => [...prev, paths]);
    setPaths(next);
    setRedoStack(redoStack.slice(1));
} };

useEffect(() => { 
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth=3;
    const drawPath = (path) => {
    if (!path) return;
    ctx.beginPath();
    const { tool, points, start, end, text } = path;
    switch (tool) {
      case TOOL_PEN:
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        break;
      case TOOL_LINE:
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
      case TOOL_RECT:
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case TOOL_CIRCLE:
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case TOOL_ARROW:
        drawArrow(ctx, start, end);
        break;
      case TOOL_TEXT:
        if (text) {
          ctx.font = '16px Monospace';
          const lines = text.split('\n');
          lines.forEach((line, i) => ctx.fillText(line, start.x, start.y + i * 20));
        }
        break;
    }
};
paths.forEach(drawPath);
}, [paths]);

const drawArrow = (ctx, start, end) => { 
    const headlen = 10;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
};

const applyTextEdit = () => { 
    setPaths(prev => prev.map(p => p.id === editingTextId ? { ...p, text: editingTextValue } : p) ); 
    setEditingTextId(null);
    setEditingTextValue('');
};

return (
    <div>
        <div className="toolbar">
            <button onClick={() => setTool(TOOL_PEN)}><Pen></Pen></button>
            <button onClick={() => setTool(TOOL_LINE)}><PenLineIcon></PenLineIcon></button>
            <button onClick={() => setTool(TOOL_RECT)}><SquareIcon></SquareIcon></button>
            <button onClick={() => setTool(TOOL_CIRCLE)}><Circle></Circle></button>
            <button onClick={() => setTool(TOOL_ARROW)}><ArrowLeft></ArrowLeft></button>
            <button onClick={() => setTool(TOOL_TEXT)}><TextCursorInput></TextCursorInput></button>
            <button onClick={() => setTool(TOOL_SELECT)}><LucideSquareDashedMousePointer></LucideSquareDashedMousePointer></button>
            <button onClick={()=>setTool(TOOL_PAN)}><Move/></button>
            <button onClick={undo}><Undo2></Undo2></button>
            <button onClick={redo}><Redo2></Redo2></button>
            <button onClick={() => setPaths([])}><Delete></Delete></button>
            <button onClick={handleNew}><Plus></Plus></button>
            <button onClick={handleSave}><Save></Save></button>
            <button onClick={handleOpen}><FolderOpen></FolderOpen></button>
            <button onClick={handleDelete}><Trash2></Trash2></button>
      </div>
        {editingTextId && (
          <div className="text-dialog"
            style={{left:textPosition?textPosition.x:0,top:textPosition?textPosition.y:0}}>
            <textarea
              value={editingTextValue}
              onChange={(e) => setEditingTextValue(e.target.value)}
              autoFocus
            />
            <button onClick={applyTextEdit} >
              <CheckIcon></CheckIcon>
            </button>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          style={{touchAction:'none'}}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
    </div>
); }



// const getOffset=(e)=>{
//     if(e.touches && e.touches.length>0){
//         const rect=canvasRef.current.getBoundingClientRect();
//         console.log('Touched!!');
//         console.log(e.touches[0].clientX-rect.left,e.touches[0].clientY-rect.top);
//         return {
//             offsetX:e.touches[0].clientX-rect.left,
//             offsetY:e.touches[0].clientY-rect.top,
//         };
//     }
//     const {offsetX,offsetY}=e.nativeEvent;
//     return {offsetX: offsetX, offsetY: offsetY };

// };
// const handleStart = (e) => { 
//     if(e.cancelable) e.preventDefault();
//     const { offsetX, offsetY } = getOffset(e);
//     const clicked = { x: offsetX, y: offsetY };
//     setStartPoint(clicked);
//     if (tool === TOOL_PEN) { 
//         setPaths((prev) => [...prev, { id: Date.now(), tool: TOOL_PEN, points: [clicked] }]);
//     } 
//     if (tool === TOOL_TEXT) { 
//         setTextPoint(clicked);
        
//     }
//     if (tool === TOOL_SELECT) {
//         const hit = paths.find(p => hitTest(p, clicked));
//         if (hit) {
//             setSelectedId(hit.id);
//             if (hit.tool === TOOL_ARROW && hit.cp) {
//                 setDragOffset({ x: clicked.x - hit.cp.x, y: clicked.y - hit.cp.y });
//             }
//             else {
//                 setDragOffset(
//                     { x: clicked.x - hit.start?.x || clicked.x - hit.x, y: clicked.y - hit.start?.y || clicked.y - hit.y }
//                 );
//             }
//         }
//     } setIsDrawing(true);
// };

// const handleMove = (e) => {
//     if(e.cancelable)e.preventDefault();
//     const { offsetX, offsetY } = getOffset(e); 
//     if (!isDrawing) return;

//     if (tool === TOOL_PEN) {
//       setPaths((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].points.push({ x: offsetX, y: offsetY });
//         return updated;
//       });
//     }

//     if (tool === TOOL_SELECT && selectedId) {
//         setPaths((prev) => prev.map(path => {
//             if (path.id !== selectedId) return path;
//             if (path.tool === TOOL_ARROW) {
//               const dx = offsetX - dragOffset.x;
//               const dy = offsetY - dragOffset.y;
//               return { ...path, cp: { x: dx, y: dy } };
//             }
//             else if (path.tool === TOOL_TEXT) {
//               return { ...path, x: offsetX - dragOffset.x, y: offsetY - dragOffset.y };
//             }
//             else {
//                 const dx = offsetX - dragOffset.x;
//                 const dy = offsetY - dragOffset.y;
//                 return {
//                     ...path,
//                     start: { x: dx, y: dy },
//                     end: {
//                       x: dx + (path.end.x - path.start.x),
//                       y: dy + (path.end.y - path.start.y),
//                     },
//                 };
//             }
//         }));
//     }
// };

// const handleUp = (e) => {
//     const { offsetX, offsetY } = getOffset(e);
//     if(!startPoint)return;
//     if ([TOOL_LINE, TOOL_RECT, TOOL_CIRCLE, TOOL_ARROW].includes(tool)) { 
//         const path = { 
//             id: Date.now(),
//             tool,
//             start: startPoint,
//             end: { x: offsetX, y: offsetY },
//         };
//     if (tool === TOOL_ARROW) {
//         path.cp = { 
//             x: (startPoint.x + offsetX) / 2 + 30,
//             y: (startPoint.y + offsetY) / 2 - 30,
//         };
//     } 
//     setPaths((prev) => [...prev, path]);
//     }
//     setIsDrawing(false);
//     setStartPoint(null);
//     setSelectedId(null);
//     setDragOffset(null);
// };

// const hitTest = (path, point) => {
//     if (path.tool === TOOL_TEXT) {
//         return Math.abs(point.x - path.x) < 50 && Math.abs(point.y - path.y) < 20;
//     }
//     if(!path.start || !path.end)return alert("Free lines are not draggable!!");
//     const withinBox = (a, b, buffer = 10) => {
//         return ( 
//             point.x >= Math.min(a.x, b.x) - buffer &&
//             point.x <= Math.max(a.x, b.x) + buffer &&
//             point.y >= Math.min(a.y, b.y) - buffer &&
//             point.y <= Math.max(a.y, b.y) + buffer 
//         ); 
//     };
//     return withinBox(path.start, path.end); 
// };

// const drawArrow = (ctx, from, cp, to) => {
//     if(!from|| !cp || !to || !ctx) return;
//     const headLength = 10;
//     const dx = to.x - from.x;
//     const dy = to.y - from.y;
//     const angle = Math.atan2(dy, dx);
//     ctx.beginPath();
//     ctx.moveTo(from.x, from.y);
//     ctx.quadraticCurveTo(cp.x, cp.y, to.x, to.y);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(to.x, to.y);
//     ctx.lineTo( to.x - headLength * Math.cos(angle - Math.PI / 6),
//                 to.y - headLength * Math.sin(angle - Math.PI / 6));
//     ctx.lineTo( to.x - headLength * Math.cos(angle + Math.PI / 6), 
//                 to.y - headLength * Math.sin(angle + Math.PI / 6));
//     ctx.lineTo(to.x, to.y);
//     ctx.fill();

// };
//     const drawPath = (ctx, path) => {
//         // if (!path) return;
//         ctx.beginPath();
//         if (path.tool === TOOL_PEN) {
//             if(!path.points || path.points.length === 0) return;
//             path.points.forEach((point, i) => {
//                 if (i === 0) ctx.moveTo(point.x, point.y);
//                 else ctx.lineTo(point.x, point.y);
//              });
//         } else if (path.tool === TOOL_LINE) {
//             ctx.moveTo(path.start.x, path.start.y);
//             ctx.lineTo(path.end.x, path.end.y);
//         } else if (path.tool === TOOL_RECT) {
//             ctx.rect(path.start.x, path.start.y, path.end.x - path.start.x, path.end.y - path.start.y);
//         } else if (path.tool === TOOL_CIRCLE) {
//             const radius = Math.hypot(path.end.x - path.start.x, path.end.y - path.start.y);
//             ctx.arc(path.start.x, path.start.y, radius, 0, 2 * Math.PI);
//             ctx.stroke();
//         } else if (path.tool === TOOL_ARROW) {
//             drawArrow(ctx, path.start, path.cp, path.end);
//             return;
//         } else if (path.tool === TOOL_TEXT) {
//             ctx.font = "20px Monospace";
//             const lines=path.text.split('\n');
//             lines.forEach((line,i)=>ctx.fillText(line,path.x,path.y+i*20));
//             // ctx.fillText(path.text, path.x, path.y);
//         }
//         else if(path.tool === TOOL_LINE || path.tool === TOOL_TEXT || path.tool === TOOL_ARROW || path.tool === TOOL_CIRCLE || path.tool === TOOL_RECT){
//             if(!path.start || !path.end ) return;
//         }
//         ctx.stroke();
//     };

// const addText = () => { 
//     if (textPoint && textInput.trim()) { 
//         setPaths((prev) => [
//             ...prev,
//             { id: Date.now(),
//                 tool: TOOL_TEXT,
//                 text: textInput,
//                 x: textPoint.x,
//                 y: textPoint.y
//             }
//         ]);
//         setTextInput(""); setTextPoint(null); 
//     } 
// };

// useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.lineWidth = 3;
//     ctx.lineCap = "round"; paths.forEach((path) => drawPath(ctx, path));
// }, [paths]);
