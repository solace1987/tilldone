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
   getDb(db,activityDisplay);

    db.onerror = function(e) {

    console.log('ERROR:' + e.target.errorCode)
  }

}

function dbAdd(data){
    var tx = dbRequest.result.transaction('task', 'readwrite')
    var store = tx.objectStore('task');
    store.add(data);
   }


   function dbGet(){
    var tx = dbRequest.result.transaction('task', 'readwrite')
    var store = tx.objectStore('task');
    const statusIndex= store.index('status');
    const getStatus=statusIndex.getAll('pending');

    getStatus.onsuccess=()=>{

        console.log(getStatus.result)
    }
   }

   function getDate(){

    var tx = dbRequest.result.transaction('task', 'readwrite')
    var store = tx.objectStore('task');
    const statusIndex= store.index('date');
    const getStatus=statusIndex.getAll("8/28/2019");

    getStatus.onsuccess=()=>{

        console.log(getStatus.result)
    }
   }


function getDb(db,node){
   
       var objectStore = db.transaction("task").objectStore("task");
         objectStore.openCursor().onsuccess = function(event) {
         var cursor = event.target.result;
         if (cursor) {
      
            createLi(cursor.value.time,cursor.value.task,node);
            console.log(cursor);
           cursor.continue();
         }
         else {
           console.log("No more entries!");
          
         }
       };
    
   
    
    }