let logo=document.querySelector('#logo');
let todayList=document.querySelector('[today-display]');
let activityList=document.querySelector('[activity-display]');
let pendingList=document.querySelector('[pending-display]');
let list=document.querySelector('.todayDisplay');
let taskInput=document.querySelector('[task]');
let descInput=document.querySelector('[desc]');
let activityDisplay=document.querySelector('.activDisplay');
let activitySelect=document.querySelector('[activity-display] select');
let dateSelect=document.querySelector('#period');
let queryButton=document.querySelector('[activity-display] button')
let datePeriod=document.querySelector('.date-cc')
let contentActivity=document.querySelector('#content')
let todayContent=document.querySelector('#today-content')

///////////////////////////////////////////////////////////////////////////////////////////
function statusToggle(e){
  e=window.event.target;
  
  while (e&&!e.id){
    e=e.parentNode;

  }

  if(e.id!=undefined){

  var tx = dbRequest.result.transaction('task', 'readwrite')
  var store = tx.objectStore('task');
  let raw=store.get(parseFloat(e.id))
  
  raw.onsuccess=function(){
   var data=raw.result
   if(data.status=='pending'){
   data.status='completed'
   store.put(data,parseFloat(e.id))
  
   TweenMax.to(e.childNodes[2],1,{rotation:360,textContent:'Completed', background:'green'})  }
   else{
    data.status='pending'
    store.put(data,parseFloat(e.id))
    TweenMax.to(e.childNodes[2],1,{rotation:0,textContent:'Pending', background:'red'})
   }}

  }

  
 }
//control the seach drop down

activitySelect.addEventListener('change',e=>{
  if(e.target.value=='pending'){
    activityDisplay.innerHTML='';
     TweenMax.to(dateSelect,0,{display:'none',ease:Back.easeOut});
     dbIndexQuery('status','pending');
    
  }

  if(e.target.value=='completed'){
    activityDisplay.innerHTML='';
    TweenMax.to(dateSelect,0,{display:'none',ease:Back.easeOut});
    dbIndexQuery('status','completed')
    
  }

  if (e.target.value=='period'){
    activityDisplay.innerHTML='';
    TweenMax.to(dateSelect,0.7,{display:'inline-block',ease:Back.easeOut})
    queryButton.disabled=false;

  }
})


queryButton.addEventListener('click',(e)=>{
  activityDisplay.innerHTML='';
  dbIndexQuery('date', datePeriod.value)
  queryButton.disabled=true;
 
})
datePeriod.addEventListener('input',(e)=>{
  queryButton.disabled=false;
})

// to animate the components
function sectionIndic(){
let section=[todayList,activityList];

let content;

function animate(node){
    let heading=node.children[0].children[0]
    TweenMax.to(heading,1,{className:'head'})
    TweenMax.to(node, 1, {flexBasis: 99, ease:Back.easeOut});
    TweenMax.to(content,1,{visibility:'visible'});
    //TweenMax.to(todayContent,1,{visibility:'visible'})
}

function deAnimate(node){
    let heading=node.children[0].children[0]
    TweenMax.to(heading,0.7,{className:'head2'})
    TweenMax.to(node, 0.9, {flexBasis: 1, ease:Back.easeOut});
    TweenMax.to(content,1,{visibility:'hidden'});
    
}
    section.map(node=>{
      if (node==todayList){
        content=todayContent;
      }
      else{ content=contentActivity}
        if(this==node){
            animate(node)
        }
        else{         
            deAnimate(node);
        }   
    })
}
activityList.addEventListener('click',sectionIndic);
todayList.addEventListener('click',sectionIndic);
//pendingList.addEventListener('click',sectionIndic);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let db, tx, store, index;


var dbRequest = window.indexedDB.open('tilldone', 1);

dbRequest.onupgradeneeded = function(e) {
  db = dbRequest.result;
  store = db.createObjectStore('task', {
    autoIncrement: 'true'
  });
  index = store.createIndex('status', 'status', {
    unique: false
  })
  index = store.createIndex('date', 'date', {
    unique: false
  })
}

dbRequest.onerror = function(e) {

  console.log('there was error:' + e.target.errorCode)
}


dbRequest.onsuccess = function(e) {
   db = e.target.result;
   getDb(db,list);
   

    db.onerror = function(e) {

    console.log('ERROR:' + e.target.errorCode)
  }

}
function dbAdd(data){
    var tx = dbRequest.result.transaction('task', 'readwrite')
    var store = tx.objectStore('task');
    store.add(data);
   }

   

   function createLi(time,task,status,display,key) {
     let color;
     if(status=='pending'){
      color='red';
  }
    else{
      color='green';
    }
    let liNode = document.createElement('li');
    liNode.innerHTML=`<div onclick='statusToggle()' id=${key}><div>${time}</div><div task>${task}</div><div style='background:${color}' status >${status}</div></div>`
    
    
    //liNode.appendChild(textNode);
    display.appendChild(liNode);
    
   
  }

  //function to create task object

function taskUpdater(){

let taskInputValue=taskInput.value;
let descInputValue=descInput.value;

let data={};
let today=new Date();
data.time=today.toLocaleTimeString();
data.date=today.toLocaleDateString();
data.task=taskInputValue;
data.remark=descInputValue;
data.status='pending'

if(taskInputValue.length>3){
  createLi(data.time,data.task,data.status,list)
dbAdd(data);
taskInput.value='';
descInput.value='';}
}
//function querying database for all task and updating dom
function getDb(db,node){
   
       var objectStore = db.transaction("task", 'readwrite').objectStore("task");
         objectStore.openCursor().onsuccess = function(event) {
         var cursor = event.target.result;
         if (cursor) {
      
            createLi(cursor.value.time,cursor.value.task,cursor.value.status,node, cursor.key);
            console.log(cursor);
           cursor.continue();
         }
         else {
           console.log("No more entries!");
          
         }
       };
    
   
    
    }

  //function handling index query
  function dbIndexQuery(index, indexName){
    var tx = dbRequest.result.transaction('task')
    var store = tx.objectStore('task');
    const statusIndex= store.index(index);
    const getStatus=statusIndex.getAll(indexName);

    getStatus.onsuccess=(e)=>{

      let web= e.target.result
      let webKey=getStatus.key
      web.map((pend)=>{
        createLi(pend.time,pend.task,pend.status,activityDisplay)
        console.log(web)

      })
    }
   }

document.querySelector('[today-display] button').addEventListener('click',taskUpdater);