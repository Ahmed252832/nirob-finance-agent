const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>escape(s).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`\n]+)`/g,'<code>$1</code>');
export function formatChatText(text){
 let html='',paragraph=[],list=null;
 const closeParagraph=()=>{if(paragraph.length){html+='<p>'+paragraph.map(inline).join('<br>')+'</p>';paragraph=[];}};
 const closeList=()=>{if(list){html+='</'+list+'>';list=null;}};
 for(const line of String(text||'').split('\n')){
  const heading=/^#{1,4}\s+(.+)$/.exec(line),item=/^\s*(?:([-*])|\d+\.)\s+(.+)$/.exec(line);
  if(!line.trim()){closeParagraph();closeList();continue;}
  if(heading){closeParagraph();closeList();html+='<h3>'+inline(heading[1])+'</h3>';}
  else if(item){closeParagraph();const type=item[1]?'ul':'ol';if(list!==type){closeList();list=type;html+='<'+type+'>';}html+='<li>'+inline(item[2])+'</li>';}
  else{closeList();paragraph.push(line);}
 }
 closeParagraph();closeList();return html;
}
