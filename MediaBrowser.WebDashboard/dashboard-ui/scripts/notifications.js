define(["dom"],function(dom){"use strict";function onListClick(e){var elem=dom.parentWithClass(e.target,"notificationsList");dom.parentWithClass(e.target,"btnPreviousPage")&&(e.preventDefault(),startIndex-=limit,startIndex<0&&(startIndex=0),Notifications.showNotificationsList(startIndex,limit,elem)),dom.parentWithClass(e.target,"btnNextPage")&&(e.preventDefault(),startIndex+=limit,Notifications.showNotificationsList(startIndex,limit,elem))}var startIndex=0,limit=10;return function(view,params){view.addEventListener("viewshow",function(){startIndex=0;var elem=view.querySelector(".notificationsList");Notifications.showNotificationsList(startIndex,limit,elem),elem.addEventListener("click",onListClick),Notifications.markNotificationsRead([])})}});