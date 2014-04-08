/**
 * @class Gab
 * @classDesc Network module for WooGeen P2P video chat
 */
function Gab(serverAddress, token, chatId){

  var self=this;
  var wsServer=null;

  // Event handlers.
  /**
   * @property {function} onConnected
   * @memberOf Gab#
   */
  this.onConnected=null;
  /**
   * @property {function} onDisconnect
   * @memberOf Gab#
   */
  this.onDisconnected=null;
  /**
   * @property {function} onConnectFailed This function will be executed after connect to server failed. Parameter: errorCode for error code.
   * @memberOf Gab#
   */
  this.onConnectFailed=null;
  /**
   * @property {function} onVideoInvitation Parameter: senderId for sender's ID.
   * @memberOf Gab#
   */
  this.onVideoInvitation=null;
  /**
   * @property {function} onVideoDenied Parameter: senderId for sender's ID.
   * @memberOf Gab#
   */
  this.onVideoDenied=null;
  /**
   * @property {function} onVideoStopped Parameter: senderId for sender's ID.
   * @memberOf Gab#
   */
  this.onVideoStopped=null;
  /**
   * @property {function} onVideoAccepted Parameter: senderId for sender's ID.
   * @memberOf Gab#
   */
  this.onVideoAccepted=null;
  /**
   * @property {function} onVideoError Parameter: errorCode.
   * @memberOf Gab#
   */
  this.onVideoError=null;
  /**
   * @property {function} onVideoSignal Parameter: senderId, signaling message.
   * @memberOf Gab#
   */
  this.onVideoSignal=null;
  /**
   * @property {function} onChatReady Parameter: a list of uid in current chat
   * @memberOf Gab#
   */
  this.onChatReady=null;
  /**
   * @property {function} onChatWait
   * @memberOf Gab#
   */
  this.onChatWait=null;

  /**
   * @property {function} onAuthenticated
   * @memberOf Gab#
   */
  this.onAuthenticated=null;

  /**
   * Connect to the signaling server
   * @memberOf Gab#
   * @param {string} uid Current user's ID.
   * @param {string} token Token for authentication.
   * @param {callback} successCallback Callback function to be executed after connect to server successfully.
   * @param {callback} failureCallback Callback function to be executed after connect to server failed.
   */
  var connect=function(serverAddress, token, chatId){
    var paramters=[];
    var queryString=null;
    if(token)
      paramters.push('token='+token);
    if(chatId)
      paramters.push('chatId='+chatId);
    if(paramters)
      queryString=paramters.join('&');
    console.log('Query string: '+queryString);
    wsServer=io.connect(serverAddress,{query : queryString, 'force new connection': true});


    wsServer.on('connect',function(){
      console.info('Connected to websocket server.');
      if(self.onConnected)
        self.onConnected();
    });

    wsServer.on('disconnect',function(){
      console.info('Disconnected from websocket server.');
      if(self.onDisconnected)
        self.onDisconnected();
    });

    wsServer.on('connect_failed',function(errorCode){
      console.error('Connect to websocket server failed, error:'+errorCode+'.');
      if(self.onConnectFailed)
        self.onConnectFailed(parseInt(errorCode));
    });

    wsServer.on('video-invitation',function(data){
      console.info('Received a video invitation.');
      if(self.onVideoInvitation)
        self.onVideoInvitation(data.from);
    });

    wsServer.on('video-denied',function(data){
      console.info('Remote user denied your invitation.');
      if(self.onVideoDenied)
        self.onVideoDenied(data.from);
    });

    wsServer.on('video-closed',function(data){
      console.info('Remote user stopped video chat.');
      if(self.onVideoStopped)
        self.onVideoStopped(data.from);
    });

    wsServer.on('video-accepted',function(data){
      console.info('Remote user agreed your invitation.');
      if(self.onVideoAccepted)
        self.onVideoAccepted(data.from);
    });

    wsServer.on('video-error',function(data){
      console.info('Video error: '+data.code);
      if(self.onVideoError)
        self.onVideoError(data.code);
    });

    wsServer.on('video-signal',function(data){
      console.log('Received signal message');
      if(self.onVideoSignal)
        self.onVideoSignal(data.from, data.data);
    });

    wsServer.on('video-stopped',function(data){
      console.log('Remote user stopped video chat.');
      if(self.onVideoStopped)
        self.onVideoStopped(data.from);
    });

    wsServer.on('chat-wait',function(){
      console.log('Waiting for a peer.');
      if(self.onChatWait)
        self.onChatWait();
    });

    wsServer.on('chat-ready',function(data){
      console.log('Received chat ready with '+data.peerId);
      if(self.onChatReady)
        self.onChatReady(data.peerId);
    });

    wsServer.on('server-authenticated',function(data){
      console.log('Authentication passed. User ID: '+data.uid);
      if(self.onAuthenticated)
        self.onAuthenticated(data.uid);
    });
  };

  connect(serverAddress, token, chatId);

  /**
   * Send a video invitation to a remote user
   * @memberOf Gab#
   * @param {string} uid Remote user's ID
   */
  this.sendVideoInvitation= function(uid){
    wsServer.emit('video-invitation',{to:uid});
  };

  /**
   * Send video agreed message to a remote user
   * @memberOf Gab#
   * @param {string} uid Remote user's ID
   */
  this.sendVideoAccepted=function(uid){
    wsServer.emit('video-accepted',{to:uid});
  };

  /**
   * Send video denied message to a remote user
   * @memberOf Gab#
   * @param {string} uid Remote user's ID
   */
  this.sendVideoDenied=function(uid){
    wsServer.emit('video-denied',{to:uid});
  };

  /**
   * Send video stopped message to a remote user
   * @memberOf Gab#
   * @param {string} uid Remote user's ID
   */
  this.sendVideoStopped=function(uid){
    wsServer.emit('video-stopped',{to:uid});
  };

  /**
   * Send signal message to a remote user
   * @memberOf Gab#
   * @param {string} uid Remote user's ID
   * @param {string} message Signal message
   */
  this.sendSignalMessage=function(uid, message){
    console.log('C->S: '+JSON.stringify(message));
    wsServer.emit('video-signal',{to:uid, data:message});
  };

  /**
   * Send room join message to server
   * @memberOf Gab#
   * @param {string} Room token.
   */
  this.sendJoinRoom=function(roomToken){
    wsServer.emit('chatroom-join',{chatId:roomToken});
  };

  /**
   * Send leave room message to server
   * @memberOf Gab#
   */
  this.sendLeaveRoom=function(roomToken){
    wsServer.emit('chatroom-leave',{chatId:roomToken});
  };

  /**
   * Finalize
   * @memberOf Gab#
   */
  this.finalize=function(){
    wsServer.socket.disconnect();
  };
}