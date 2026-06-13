import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface Node { id:string; text:string; x:number; y:number; parentId:string|null; color:string; }
const SK='mm_nodes_v1';
const C='#f97316';
const COLORS=['#f97316','#8b5cf6','#22c55e','#3b82f6','#ec4899','#f59e0b','#06b6d4','#ef4444'];
const ld=():Node[]=>{try{const d=localStorage.getItem(SK);return d?JSON.parse(d):[{id:'root',text:'Central Idea',x:400,y:300,parentId:null,color:C}]}catch{return[{id:'root',text:'Central Idea',x:400,y:300,parentId:null,color:C}]}};

export default function App() {
  const [nodes,setNodes]=useState<Node[]>(ld);
  const [sel,setSel]=useState<string|null>(null);
  const [drag,setDrag]=useState<{id:string;ox:number;oy:number}|null>(null);
  const [zoom,setZoom]=useState(1);
  const [edit,setEdit]=useState<string|null>(null);
  const [editText,setEditText]=useState('');
  const svgRef=useRef<SVGSVGElement>(null);

  const sv=(items:Node[])=>{setNodes(items);localStorage.setItem(SK,JSON.stringify(items))};

  const addChild=()=>{
    if(!sel)return;
    const parent=nodes.find(n=>n.id===sel);
    if(!parent)return;
    const angle=Math.random()*Math.PI*2;
    const dist=140;
    const newNode:Node={id:Date.now().toString(),text:'New Idea',x:parent.x+Math.cos(angle)*dist,y:parent.y+Math.sin(angle)*dist,parentId:sel,color:COLORS[Math.floor(Math.random()*COLORS.length)]};
    sv([...nodes,newNode]);
    setSel(newNode.id);
  };

  const delNode=(id:string)=>{
    if(id==='root')return;
    const toRemove=new Set<string>();
    const collect=(nid:string)=>{toRemove.add(nid);nodes.filter(n=>n.parentId===nid).forEach(c=>collect(c.id))};
    collect(id);
    sv(nodes.filter(n=>!toRemove.has(n.id)));
    setSel(null);
  };

  const startEdit=(id:string)=>{const n=nodes.find(x=>x.id===id);if(n){setEdit(id);setEditText(n.text)}};
  const saveEdit=()=>{if(edit){sv(nodes.map(n=>n.id===edit?{...n,text:editText}:n));setEdit(null)}};

  const onMouseDown=(e:React.MouseEvent,id:string)=>{
    e.stopPropagation();
    const n=nodes.find(x=>x.id===id);
    if(!n)return;
    setSel(id);
    setDrag({id,ox:e.clientX/zoom-n.x,oy:e.clientY/zoom-n.y});
  };

  const onMouseMove=useCallback((e:MouseEvent)=>{
    if(!drag)return;
    sv(nodes.map(n=>n.id===drag.id?{...n,x:e.clientX/zoom-drag.ox,y:e.clientY/zoom-drag.oy}:n));
  },[drag,nodes,zoom]);

  const onMouseUp=useCallback(()=>setDrag(null),[]);

  useEffect(()=>{
    window.addEventListener('mousemove',onMouseMove);
    window.addEventListener('mouseup',onMouseUp);
    return()=>{window.removeEventListener('mousemove',onMouseMove);window.removeEventListener('mouseup',onMouseUp)};
  },[onMouseMove,onMouseUp]);

  const selNode=nodes.find(n=>n.id===sel);

  return (
    <div style={{minHeight:'100vh',background:'#060400',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid '+C+'20',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
        <div>
          <div style={{color:'white',fontWeight:'800',fontSize:'16px',fontFamily:'Inter'}}>MindMap Local</div>
          <div style={{color:'#555',fontSize:'11px',fontFamily:'Inter'}}>{nodes.length} nodes</div>
        </div>
        <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
          <button onClick={()=>setZoom(z=>Math.max(0.3,z-0.1))} style={{padding:'6px',borderRadius:'8px',background:'#ffffff08',border:'1px solid #ffffff10',color:'#aaa',cursor:'pointer'}}><ZoomOut size={14}/></button>
          <span style={{color:'#555',fontSize:'12px',fontFamily:'Inter',minWidth:'36px',textAlign:'center'}}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.min(2,z+0.1))} style={{padding:'6px',borderRadius:'8px',background:'#ffffff08',border:'1px solid #ffffff10',color:'#aaa',cursor:'pointer'}}><ZoomIn size={14}/></button>
          <button onClick={()=>setZoom(1)} style={{padding:'6px',borderRadius:'8px',background:'#ffffff08',border:'1px solid #ffffff10',color:'#aaa',cursor:'pointer'}}><RotateCcw size={14}/></button>
          {sel&&sel!=='root'&&<button onClick={()=>delNode(sel)} style={{padding:'6px',borderRadius:'8px',background:'#ef444420',border:'1px solid #ef444430',color:'#ef4444',cursor:'pointer'}}><Trash2 size={14}/></button>}
          <button onClick={addChild} disabled={!sel} style={{padding:'6px 12px',borderRadius:'8px',background:sel?C:'#333',border:'none',color:'white',fontSize:'12px',cursor:sel?'pointer':'not-allowed',fontFamily:'Inter',display:'flex',alignItems:'center',gap:'4px'}}><Plus size={12}/>Add</button>
        </div>
      </div>
      <div style={{flex:1,position:'relative',overflow:'hidden'}}>
        <svg ref={svgRef} width="100%" height="100%" style={{cursor:'default'}} onClick={()=>setSel(null)}>
          <g transform={'scale('+zoom+')'}>
            {nodes.filter(n=>n.parentId).map(n=>{
              const p=nodes.find(x=>x.id===n.parentId);
              if(!p)return null;
              return <line key={n.id+'_l'} x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke={n.color} strokeWidth={2} strokeOpacity={0.4}/>;
            })}
            {nodes.map(n=>(
              <g key={n.id} onMouseDown={e=>onMouseDown(e,n.id)} onDoubleClick={()=>startEdit(n.id)} style={{cursor:'grab'}}>
                <ellipse cx={n.x} cy={n.y} rx={Math.max(50,n.text.length*5+20)} ry={22}
                  fill={n.id===sel?n.color:n.color+'25'} stroke={n.color} strokeWidth={n.id===sel?2:1} strokeOpacity={n.id===sel?1:0.5}/>
                <text x={n.x} y={n.y+5} textAnchor="middle" fill="white" fontSize={12} fontFamily="Inter" fontWeight={n.id==='root'?700:400}
                  style={{userSelect:'none',pointerEvents:'none'}}>{n.text.length>18?n.text.slice(0,16)+'...':n.text}</text>
              </g>
            ))}
          </g>
        </svg>
        {edit&&(
          <div style={{position:'absolute',bottom:'20px',left:'50%',transform:'translateX(-50%)',background:'#111',border:'1px solid '+C+'40',borderRadius:'12px',padding:'12px 16px',display:'flex',gap:'8px',zIndex:20}}>
            <input autoFocus value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveEdit();if(e.key==='Escape')setEdit(null)}}
              style={{background:'transparent',border:'1px solid '+C+'30',borderRadius:'8px',padding:'8px 12px',color:'white',fontSize:'14px',outline:'none',fontFamily:'Inter',minWidth:'200px'}}/>
            <button onClick={saveEdit} style={{padding:'8px 16px',borderRadius:'8px',background:C,border:'none',color:'white',fontSize:'13px',cursor:'pointer',fontFamily:'Inter'}}>Save</button>
          </div>
        )}
        {!sel&&<div style={{position:'absolute',bottom:'20px',right:'20px',color:'#333',fontSize:'12px',fontFamily:'Inter',textAlign:'right'}}>
          Click node to select • Double-click to edit • Drag to move
        </div>}
      </div>
    </div>
  );
}
