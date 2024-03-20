import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";



export class RealTimeService{
   socket:WebSocket 
   status:"started"|"stopped"
   constructor(){
    if(window.location.hostname==="localhost"){
        this.socket =  new WebSocket(`ws://${window.location}:9091`);

    }else{
        this.socket = new WebSocket(`ws://${window.location.host}/collaborativewall/realtime`);
    }
    this.startListeners()
    this.status="started"
   }
   private startListeners(){
    this.socket.addEventListener('open',  (event) =>{
        
    });
    this.socket.addEventListener('message',  (event) =>{
        console.log('Message from server: ', event.data);
    });
    this.socket.addEventListener('close',  (event) =>{
        console.log('Server closed connection: ', event);
    });
    this.socket.addEventListener('error',  (event)=> {
        console.error('[collaborativewall][realtime] error received:', event);
    });
   }

   queryForMetadata(wallId:string){
    this.socket.send(JSON.stringify({
        wallId,
        type: "metadata",
      }))
   }

   sendPing(wallId:string){
    this.socket.send(JSON.stringify({
        wallId,
        type: "ping",
      }))
   }

   sendWallUpdateEvent(wallId:string, wall:CollaborativeWallPayload){
    this.socket.send(JSON.stringify({
        wallId,
        type: "wallUpdate",
        wall
      }))
   }

   sendNoteAddedEvent(wallId:string,note:CollaborativeWallNotePayload){
    this.socket.send(JSON.stringify({
        wallId,
        type: "noteAdded",
        note: {
            ...note,
            idwall: wallId,
          },
      }))
   }

   sendNoteEditionStartedEvent(wallId:string,noteId:string){
    this.socket.send(JSON.stringify({
        wallId,
        type: "noteEditionStarted",
        noteId
      }))
   }

   sendNoteEditionEndedEvent(wallId:string,noteId:string){
    this.socket.send(JSON.stringify({
        wallId,
        type: "noteEditionEnded",
        noteId
      }))
   }

   sendNoteTextUpdatedEvent(wallId:string,noteId:string){
    this.socket.send(JSON.stringify({
        wallId,
        type: "noteTextUpdated",
        noteId
      }))
   }

   sendNoteImageUpdatedEvent(wallId:string,noteId:string){
    this.socket.send(JSON.stringify({
        wallId,
        type: "noteImageUpdated",
        noteId
      }))
   }

}

type CollaborativeWallPayload = Pick<CollaborativeWallProps, "_id"|"name"|"description"|"background"|"icon">

type CollaborativeWallNotePayload = Pick<NoteProps, "_id"|"content"|"owner"|"x"|"y"|"color"|"zIndex">